'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  board_name?: string;
  is_notice: number;
  status: number;
  views: number;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  role: number;
}

const REVIEWER_ROLE_THRESHOLD = 1;

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [notices, setNotices] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<number>(1);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [isNotice, setIsNotice] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [boardsRes, noticesRes, userRes] = await Promise.all([
        fetch('/api/boards'),
        fetch('/api/posts?notices=true'),
        fetch('/api/auth/me'),
      ]);

      const boardsData = await boardsRes.json();
      const noticesData = await noticesRes.json();
      const userData = await userRes.json();

      setBoards(boardsData.boards || []);
      setNotices(noticesData.posts || []);
      setUser(userData.user);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
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
          boardId: selectedBoardId,
          title: writeTitle,
          content: writeContent,
          isNotice: isNotice && user.role >= REVIEWER_ROLE_THRESHOLD,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
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
          {/* 좌측 사이드바 - 게시판 목록 */}
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
                    className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
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
                <h2 className="text-2xl font-bold text-gray-900">공지사항</h2>
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
                      게시판 선택
                    </label>
                    <select
                      value={selectedBoardId}
                      onChange={(e) => setSelectedBoardId(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {boards.map((board) => (
                        <option key={board.id} value={board.id}>
                          {board.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  {user.role >= REVIEWER_ROLE_THRESHOLD && (
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

              {notices.length === 0 ? (
                <p className="text-gray-500">공지사항이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <div
                      key={notice.id}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                              공지
                            </span>
                            <span className="text-sm text-gray-500">
                              {notice.board_name}
                            </span>
                          </div>
                          <Link
                            href={`/post/${notice.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                          >
                            {notice.title}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notice.content}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500 ml-4">
                          <div>{notice.username || '익명'}</div>
                          <div>{new Date(notice.created_at).toLocaleDateString('ko-KR')}</div>
                          <div>조회 {notice.views}</div>
                        </div>
                      </div>
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

