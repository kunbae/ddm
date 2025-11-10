import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { initDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 데이터베이스 초기화 확인
    await initDatabase();
    
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    const result = await loginUser(username, password);
    const response = NextResponse.json({ user: result.user }, { status: 200 });
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
    });
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '로그인에 실패했습니다.' },
      { status: 401 }
    );
  }
}

