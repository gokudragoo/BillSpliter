import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'billsplitr-secret-key-2024'
);

export interface User {
  _id?: ObjectId;
  walletAddress: string;
  name?: string;
  creditScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionPayload {
  userId: string;
  walletAddress: string;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection<User>('users').findOne({ _id: new ObjectId(userId) });
  return user;
}

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection<User>('users').findOne({ 
    walletAddress: walletAddress.toLowerCase() 
  });
  return user;
}

export async function createOrUpdateUser(walletAddress: string, name?: string): Promise<User> {
  const db = await getDb();
  const normalizedWallet = walletAddress.toLowerCase();
  
  const existingUser = await db.collection<User>('users').findOne({ 
    walletAddress: normalizedWallet 
  });
  
  if (existingUser) {
    if (name && name !== existingUser.name) {
      await db.collection<User>('users').updateOne(
        { _id: existingUser._id },
        { $set: { name, updatedAt: new Date() } }
      );
      return { ...existingUser, name, updatedAt: new Date() };
    }
    return existingUser;
  }
  
  const newUser: User = {
    walletAddress: normalizedWallet,
    name: name || `User ${normalizedWallet.slice(0, 6)}`,
    creditScore: 750,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await db.collection<User>('users').insertOne(newUser);
  return { ...newUser, _id: result.insertedId };
}
