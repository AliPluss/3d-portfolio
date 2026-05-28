import { NextResponse } from 'next/server'

// This endpoint exists solely to intercept stray requests from the baked-in 
// textures inside the GLB files or stale caches, preventing Next.js 404 terminal spam.
export async function GET() {
  return NextResponse.json({ success: true, message: 'Failsafe empty response' })
}
