import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Headshot Studio API is running',
    apiKeyConfigured: process.env.GOOGLE_API_KEY ? 'Yes' : 'No'
  });
}
