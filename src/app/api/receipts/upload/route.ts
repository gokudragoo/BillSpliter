import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const PINATA_API_KEY = process.env.PINATA_API_KEY!;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY!;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    const metadata = JSON.stringify({
      name: `receipt_${Date.now()}_${file.name}`,
      keyvalues: {
        app: 'BillSplitr',
        userId: session.userId,
        uploadedAt: new Date().toISOString()
      }
    });
    pinataFormData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({ cidVersion: 1 });
    pinataFormData.append('pinataOptions', options);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: pinataFormData
    });

    if (!response.ok) {
      throw new Error('Pinata upload failed');
    }

    const result = await response.json();
    return NextResponse.json({ 
      success: true, 
      ipfsHash: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    });
  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json({ error: 'Failed to upload receipt' }, { status: 500 });
  }
}
