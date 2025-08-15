import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Vérifier les variables d'environnement critiques
    const envStatus = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET ? 'Set' : 'Not set',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'Set' : 'Not set',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    }

    // Vérifier si toutes les variables critiques sont définies
    const criticalVars = ['DATABASE_URL', 'CLERK_WEBHOOK_SECRET', 'CLERK_SECRET_KEY']
    const missingVars = criticalVars.filter(varName => !process.env[varName])

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      envStatus,
      missingVariables: missingVars,
      webhookUrl: `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/webhooks/clerk`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in test-webhook:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  console.log('Webhook test POST received')
  const body = await req.json()
  console.log('Webhook body:', body)
  
  return NextResponse.json({ 
    message: 'Webhook test POST successful', 
    received: body 
  })
}