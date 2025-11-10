import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost, incrementViews, updatePostStatus } from '@/lib/posts';
import { verifyToken, getUserById } from '@/lib/auth';
import { initDatabase } from '@/lib/db';

const REVIEWER_ROLE_THRESHOLD = 1;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await initDatabase();
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

    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id);
    const post = await getPostById(id, { viewerId, viewerRole });
    
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (post.status === 1) {
      await incrementViews(id);
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: '게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const viewer = await getUserById(decoded.userId);
    if (!viewer) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    const { title, content, isNotice, status } = body;

    if (typeof status === 'number') {
      if (viewer.role < REVIEWER_ROLE_THRESHOLD) {
        return NextResponse.json(
          { error: '승인 권한이 없습니다.' },
          { status: 403 }
        );
      }

      const success = await updatePostStatus(id, status);
      if (!success) {
        return NextResponse.json(
          { error: '게시글 상태를 변경할 수 없습니다.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ message: '게시글 상태가 변경되었습니다.' }, { status: 200 });
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    const success = await updatePost(id, viewer.id, title, content, isNotice || false);
    
    if (!success) {
      return NextResponse.json(
        { error: '게시글을 수정할 수 없습니다.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: '게시글이 수정되었습니다. (다시 검토 대기)' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: '게시글 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const viewer = await getUserById(decoded.userId);
    if (!viewer) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id);
    const success = await deletePost(id, viewer.id);
    
    if (!success) {
      return NextResponse.json(
        { error: '게시글을 삭제할 수 없습니다.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: '게시글이 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: '게시글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

