import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: '로그아웃되었습니다.' }, { status: 200 });
  response.cookies.delete('token');
  return response;
}



