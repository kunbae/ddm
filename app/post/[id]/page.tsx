'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Board {
  id: number;
  name: string;
}

interface Post {
  id: number;
  board_id: number;
  title: string;
  content: string;
  username?: string;
  board_name?: string;
  views: number;
  status: number;
  created_at: string;
  updated_at: string;
  user_id: number;
}

interface User {
  id: number;
  username: string;
  role: number;
}

const REVIEWER_ROLE_THRESHOLD = 1;

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);

  const [boards, setBoards] = useState<Board[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isReviewer = user ? user.role >= REVIEWER_ROLE_THRESHOLD : false;
  const canEdit = user && post && user.id === post.user_id;

  useEffect(() => {
    loadData();
  }, [postId]);

  const loadData = async () => {
    setErrorMessage(null);
    try {
      const [boardsRes, postRes, userRes] = await Promise.all([
        fetch('/api/boards'),
        fetch(`/api/posts/${postId}`),
        fetch('/api/auth/me'),
      ]);

      const boardsData = await boardsRes.json();
      setBoards(boardsData.boards || []);

      if (postRes.status === 404) {
        setPost(null);
        setErrorMessage('게시글을 찾을 수 없거나 열람 권한이 없습니다.');
      } else if (!postRes.ok) {
        const postError = await postRes.json();
        setPost(null);
        setErrorMessage(postError.error || '게시글을 불러오는 중 오류가 발생했습니다.');
      } else {
        const postData = await postRes.json();
        setPost(postData.post);
        if (postData.post) {
          setEditTitle(postData.post.title);
          setEditContent(postData.post.content);
        }
      }

      const userData = await userRes.json();
      setUser(userData.user);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setErrorMessage('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '게시글 삭제에 실패했습니다.');
      }

      router.push(`/board/${post?.board_id || 1}`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '게시글 수정에 실패했습니다.');
      }

      alert('게시글이 수정되었습니다. 다시 검토 후 공개됩니다.');
      setEditing(false);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 1 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '승인에 실패했습니다.');
      }

      alert('게시글이 승인되었습니다.');
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">게시판 웹사이트</h1>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-gray-700">안녕하세요, {user.username}님</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-600">
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">게시판 웹사이트</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-700">안녕하세요, {user.username}님</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 좌측 사이드바 */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">게시판 목록</h2>
              <nav className="space-y-2">
                <Link
                  href="/"
                  className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-700 font-medium"
                >
                  홈
                </Link>
                {boards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/board/${board.id}`}
                    className={`block px-3 py-2 rounded hover:bg-gray-100 ${
                      post.board_id === board.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    {board.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              {editing ? (
                <form onSubmit={handleUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      내용
                    </label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setEditTitle(post.title);
                        setEditContent(post.content);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {post.status === 0 && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                              검토중
                            </span>
                          )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {post.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{post.username || '익명'}</span>
                          <span>{new Date(post.created_at).toLocaleString('ko-KR')}</span>
                          <span>조회 {post.views}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isReviewer && post.status === 0 && (
                          <button
                            onClick={handleApprove}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            승인
                          </button>
                        )}
                        {canEdit && (
                          <>
                            <button
                              onClick={() => setEditing(true)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                              수정
                            </button>
                            <button
                              onClick={handleDelete}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-6">
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-gray-800">{post.content}</p>
                      </div>
                    </div>
                    {canEdit && post.status === 0 && (
                      <p className="mt-4 text-sm text-yellow-700">현재 검토 중입니다. 승인 후 전체에게 노출됩니다.</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href={`/board/${post.board_id}`}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      목록으로
                    </Link>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

