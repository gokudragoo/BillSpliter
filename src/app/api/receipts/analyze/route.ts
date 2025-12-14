import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { analyzeReceipt } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const analysis = await analyzeReceipt(imageBase64);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Receipt analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze receipt' }, { status: 500 });
  }
}
