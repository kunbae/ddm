import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await getUserById(decoded.userId);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

