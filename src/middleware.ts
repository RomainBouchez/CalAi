// Empty middleware file
// We're not using any middleware for this application

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    return NextResponse.next()
}

// Only run middleware on specific routes if needed
export const config = {
    matcher: [],
}