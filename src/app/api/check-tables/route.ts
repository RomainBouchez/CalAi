import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      )
    }

    const sql = neon(process.env.DATABASE_URL)

    // Test de connexion et récupération des tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `

    // Vérifier si les tables principales existent
    const tableNames = tables.map((row: any) => row.table_name)
    const expectedTables = ['users', 'food_entries', 'nutrition_goals']
    const missingTables = expectedTables.filter(table => !tableNames.includes(table))

    // Test de connexion simple
    const connectionTest = await sql`SELECT 1 as test`

    return NextResponse.json({
      success: true,
      connection: 'OK',
      tables: tableNames,
      expectedTables,
      missingTables,
      connectionTest: connectionTest[0]?.test,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
