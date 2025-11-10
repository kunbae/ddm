import { NextRequest, NextResponse } from 'next/server';
import { getPostsByBoard, getAllNotices } from '@/lib/posts';
import { verifyToken, getUserById } from '@/lib/auth';
import { initDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initDatabase();
    const searchParams = request.nextUrl.searchParams;
    const boardId = searchParams.get('boardId');
    const notices = searchParams.get('notices');

    const token = request.cookies.get('token')?.value;
    let viewerId: number | undefined;
    let viewerRole: number | undefined;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const viewer = await getUserById(decoded.userId);
        if (viewer) {
          viewerId = viewer.id;
          viewerRole = viewer.role;
        }
      }
    }

    if (notices === 'true') {
      const posts = await getAllNotices();
      return NextResponse.json({ posts }, { status: 200 });
    }

    if (!boardId) {
      return NextResponse.json(
        { error: 'boardId가 필요합니다.' },
        { status: 400 }
      );
    }

    const posts = await getPostsByBoard(parseInt(boardId), { viewerId, viewerRole });
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: '게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: '인증이 유효하지 않습니다.' },
        { status: 401 }
      );
    }

    await initDatabase();

    const body = await request.json();
    const { boardId, title, content, isNotice } = body;

    if (!boardId || !title || !content) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const { createPost } = await import('@/lib/posts');
    const postId = await createPost(boardId, decoded.userId, title, content, isNotice || false);
    
    return NextResponse.json({ postId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '게시글 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

