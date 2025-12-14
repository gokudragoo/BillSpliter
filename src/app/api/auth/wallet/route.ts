import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateUser, createToken } from '@/lib/auth';
import { verifyMessage } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message, name } = await request.json();
    
    if (!walletAddress || !signature || !message) {
      return NextResponse.json({ 
        error: 'Wallet address, signature, and message are required' 
      }, { status: 400 });
    }

    // Verify the signature
    const recoveredAddress = verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ 
        error: 'Invalid signature' 
      }, { status: 401 });
    }

    // Create or update user
    const user = await createOrUpdateUser(walletAddress, name);

    // Create JWT token
    const token = await createToken({ 
      userId: user._id!.toString(), 
      walletAddress: user.walletAddress 
    });

    const response = NextResponse.json({ 
      success: true,
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        name: user.name,
        creditScore: user.creditScore
      }
    });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;
  } catch (error) {
    console.error('Wallet auth error:', error);
    return NextResponse.json({ 
      error: 'Authentication failed' 
    }, { status: 500 });
  }
}
