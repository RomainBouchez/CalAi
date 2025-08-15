import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: any

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', { status: 400 })
  }

  const { id } = evt.data
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { email_addresses, first_name, last_name, image_url } = evt.data
    
    console.log('Creating user:', { id, email: email_addresses[0].email_address, first_name, last_name })
    
    try {
      // Créer l'utilisateur
      await sql`
        INSERT INTO users (id, email, first_name, last_name, image_url)
        VALUES (${id}, ${email_addresses[0].email_address}, ${first_name}, ${last_name}, ${image_url})
        ON CONFLICT (id) DO NOTHING
      `
      
      console.log('User created successfully')
      
      // Les objectifs nutritionnels seront créés automatiquement par le trigger
      // Mais on peut aussi le faire manuellement pour s'assurer :
      await sql`SELECT create_default_nutrition_goals(${id})`
      
      console.log('Default nutrition goals created')
      
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  if (eventType === 'user.updated') {
    const { email_addresses, first_name, last_name, image_url } = evt.data
    
    await sql`
      UPDATE users 
      SET email = ${email_addresses[0].email_address},
          first_name = ${first_name},
          last_name = ${last_name},
          image_url = ${image_url},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
  }

  if (eventType === 'user.deleted') {
    await sql`DELETE FROM users WHERE id = ${id}`
  }

  return NextResponse.json({ message: 'Success' })
}