'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Board {
  id: number;
  name: string;
  description?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  username?: string;
  is_notice: number;
  status: number;
  views: number;
  created_at: string;
  user_id: number;
}

interface User {
  id: number;
  username: string;
  role: number;
}

const REVIEWER_ROLE_THRESHOLD = 1;

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);

  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [isNotice, setIsNotice] = useState(false);

  const isReviewer = user ? user.role >= REVIEWER_ROLE_THRESHOLD : false;

  useEffect(() => {
    loadData();
  }, [boardId]);

  const loadData = async () => {
    try {
      const [boardsRes, postsRes, userRes] = await Promise.all([
        fetch('/api/boards'),
        fetch(`/api/posts?boardId=${boardId}`),
        fetch('/api/auth/me'),
      ]);

      const boardsData = await boardsRes.json();
      const postsData = await postsRes.json();
      const userData = await userRes.json();

      setBoards(boardsData.boards || []);
      setPosts(postsData.posts || []);
      setUser(userData.user);
      
      const board = boardsData.boards.find((b: Board) => b.id === boardId);
      setCurrentBoard(board || null);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          title: writeTitle,
          content: writeContent,
          isNotice: isNotice && isReviewer,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '게시글 작성에 실패했습니다.');
      }

      setShowWriteForm(false);
      setWriteTitle('');
      setWriteContent('');
      setIsNotice(false);
      loadData();
      alert('게시글이 작성되었습니다. 검토 후 공개됩니다.');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleApprove = async (postId: number) => {
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

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">게시판을 찾을 수 없습니다.</div>
      </div>
    );
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
                      board.id === boardId
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
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentBoard.name}</h2>
                  {currentBoard.description && (
                    <p className="text-gray-600 mt-1">{currentBoard.description}</p>
                  )}
                </div>
                {user && (
                  <button
                    onClick={() => setShowWriteForm(!showWriteForm)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    글쓰기
                  </button>
                )}
              </div>

              {/* 글쓰기 폼 */}
              {showWriteForm && (
                <form onSubmit={handleWrite} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={writeTitle}
                      onChange={(e) => setWriteTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      내용
                    </label>
                    <textarea
                      value={writeContent}
                      onChange={(e) => setWriteContent(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  {isReviewer && (
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isNotice}
                          onChange={(e) => setIsNotice(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">공지사항으로 등록</span>
                      </label>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      작성
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWriteForm(false);
                        setWriteTitle('');
                        setWriteContent('');
                        setIsNotice(false);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}

              {/* 게시글 목록 */}
              {posts.length === 0 ? (
                <p className="text-gray-500">게시글이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.is_notice === 1 && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                공지
                              </span>
                            )}
                            {post.status === 0 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                                검토중
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/post/${post.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                          >
                            {post.title}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500 ml-4">
                          <div>{post.username || '익명'}</div>
                          <div>{new Date(post.created_at).toLocaleDateString('ko-KR')}</div>
                          <div>조회 {post.views}</div>
                        </div>
                      </div>
                      {isReviewer && post.status === 0 && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleApprove(post.id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            승인
                          </button>
                        </div>
                      )}
                      {!isReviewer && user && user.id === post.user_id && post.status === 0 && (
                        <p className="mt-2 text-sm text-yellow-700">현재 검토 중입니다.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

