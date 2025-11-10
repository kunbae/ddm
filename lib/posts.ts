import { getDatabase } from './db';

export interface Board {
  id: number;
  name: string;
  description?: string;
  order_index: number;
}

export interface Post {
  id: number;
  board_id: number;
  user_id: number;
  title: string;
  content: string;
  is_notice: number;
  status: number;
  views: number;
  created_at: string;
  updated_at: string;
  username?: string;
  board_name?: string;
}

const REVIEWER_ROLE_THRESHOLD = 1;

export async function getAllBoards(): Promise<Board[]> {
  const supabase = getDatabase();
  
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('게시판 목록 조회 실패:', error);
    return [];
  }

  return data || [];
}

export async function getBoardById(id: number): Promise<Board | null> {
  const supabase = getDatabase();
  
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

interface ViewerOptions {
  viewerId?: number;
  viewerRole?: number;
}

export async function getPostsByBoard(boardId: number, options: ViewerOptions = {}, limit: number = 20, offset: number = 0): Promise<Post[]> {
  const supabase = getDatabase();
  const { viewerId, viewerRole } = options;
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      users!posts_user_id_fkey(username),
      boards!posts_board_id_fkey(name)
    `)
    .eq('board_id', boardId)
    .order('is_notice', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if ((viewerRole ?? 0) >= REVIEWER_ROLE_THRESHOLD) {
    // 검토자는 모든 글 열람 가능
  } else if (viewerId) {
    query = query.or(`status.eq.1,user_id.eq.${viewerId}`);
  } else {
    query = query.eq('status', 1);
  }

  const { data: posts, error: postsError } = await query;

  if (postsError) {
    console.error('게시글 조회 실패:', postsError);
    return [];
  }

  if (!posts) {
    return [];
  }

  return posts.map((post: any) => ({
    id: post.id,
    board_id: post.board_id,
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    is_notice: post.is_notice,
    status: post.status,
    views: post.views,
    created_at: post.created_at,
    updated_at: post.updated_at,
    username: post.users?.username,
    board_name: post.boards?.name
  }));
}

export async function getAllNotices(): Promise<Post[]> {
  const supabase = getDatabase();
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      users!posts_user_id_fkey(username),
      boards!posts_board_id_fkey(name)
    `)
    .eq('is_notice', 1)
    .eq('status', 1)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('공지사항 조회 실패:', error);
    return [];
  }

  if (!posts) {
    return [];
  }

  return posts.map((post: any) => ({
    id: post.id,
    board_id: post.board_id,
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    is_notice: post.is_notice,
    status: post.status,
    views: post.views,
    created_at: post.created_at,
    updated_at: post.updated_at,
    username: post.users?.username,
    board_name: post.boards?.name
  }));
}

export async function getPostById(id: number, options: ViewerOptions = {}): Promise<Post | null> {
  const supabase = getDatabase();
  
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      users!posts_user_id_fkey(username),
      boards!posts_board_id_fkey(name)
    `)
    .eq('id', id)
    .single();

  if (error || !post) {
    return null;
  }

  const viewerRole = options.viewerRole ?? 0;
  const isReviewer = viewerRole >= REVIEWER_ROLE_THRESHOLD;
  const isAuthor = options.viewerId && options.viewerId === post.user_id;

  if (post.status !== 1 && !isReviewer && !isAuthor) {
    return null;
  }

  return {
    id: post.id,
    board_id: post.board_id,
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    is_notice: post.is_notice,
    status: post.status,
    views: post.views,
    created_at: post.created_at,
    updated_at: post.updated_at,
    username: (post as any).users?.username,
    board_name: (post as any).boards?.name
  };
}

export async function createPost(boardId: number, userId: number, title: string, content: string, isNotice: boolean = false): Promise<number> {
  const supabase = getDatabase();
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      board_id: boardId,
      user_id: userId,
      title,
      content,
      is_notice: isNotice ? 1 : 0,
      status: 0,
      views: 0
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('게시글 작성에 실패했습니다.');
  }

  return data.id;
}

export async function updatePost(id: number, userId: number, title: string, content: string, isNotice: boolean = false): Promise<boolean> {
  const supabase = getDatabase();
  
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!post || post.user_id !== userId) {
    return false;
  }

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      content,
      is_notice: isNotice ? 1 : 0,
      status: 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId);

  return !error;
}

export async function updatePostStatus(id: number, status: number): Promise<boolean> {
  const supabase = getDatabase();
  const normalizedStatus = status === 1 ? 1 : 0;

  const { error } = await supabase
    .from('posts')
    .update({
      status: normalizedStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  return !error;
}

export async function deletePost(id: number, userId: number): Promise<boolean> {
  const supabase = getDatabase();
  
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  return !error;
}

export async function incrementViews(id: number): Promise<void> {
  const supabase = getDatabase();
  
  const { data: post, error } = await supabase
    .from('posts')
    .select('views, status')
    .eq('id', id)
    .single();

  if (error || !post || post.status !== 1) {
    return;
  }

  await supabase
    .from('posts')
    .update({ views: post.views + 1 })
    .eq('id', id);
}
