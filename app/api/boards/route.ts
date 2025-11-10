import { NextRequest, NextResponse } from 'next/server';
import { getAllBoards } from '@/lib/posts';
import { initDatabase } from '@/lib/db';

export async function GET() {
  try {
    // 데이터베이스 초기화 확인
    await initDatabase();
    
    const boards = await getAllBoards();
    return NextResponse.json({ boards }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: '게시판 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

