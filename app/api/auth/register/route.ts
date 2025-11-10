import { NextRequest, NextResponse } from 'next/server';
import { registerUser, loginUser } from '@/lib/auth';
import { initDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 데이터베이스 초기화 확인
    await initDatabase();
    
    const body = await request.json();
    const { username, password, email, gender, region_level1, region_level2, region_level3, region_level4, region_level5 } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    const user = await registerUser({
      username,
      password,
      email,
      gender,
      region_level1,
      region_level2,
      region_level3,
      region_level4,
      region_level5
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '회원가입에 실패했습니다.' },
      { status: 400 }
    );
  }
}

