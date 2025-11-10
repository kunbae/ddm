import { getDatabase } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: number;
  gender?: string;
  region_level1?: string;
  region_level2?: string;
  region_level3?: string;
  region_level4?: string;
  region_level5?: string;
  created_at: string;
}

export interface RegisterUserParams {
  username: string;
  password: string;
  email?: string;
  gender?: string;
  region_level1?: string;
  region_level2?: string;
  region_level3?: string;
  region_level4?: string;
  region_level5?: string;
}

export async function registerUser(params: RegisterUserParams): Promise<User> {
  const supabase = getDatabase();
  const hashedPassword = await bcrypt.hash(params.password, 10);
  
  // 중복 확인
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', params.username)
    .single();

  if (existingUser) {
    throw new Error('이미 존재하는 사용자명입니다.');
  }
  
  // 새 사용자 생성
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      username: params.username,
      password: hashedPassword,
      email: params.email || null,
      role: 0,
      gender: params.gender || null,
      region_level1: params.region_level1 || null,
      region_level2: params.region_level2 || null,
      region_level3: params.region_level3 || null,
      region_level4: params.region_level4 || null,
      region_level5: params.region_level5 || null
    })
    .select('id, username, email, role, gender, region_level1, region_level2, region_level3, region_level4, region_level5, created_at')
    .single();

  if (error) {
    throw new Error('회원가입에 실패했습니다.');
  }

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email || undefined,
    role: newUser.role ?? 0,
    gender: newUser.gender || undefined,
    region_level1: newUser.region_level1 || undefined,
    region_level2: newUser.region_level2 || undefined,
    region_level3: newUser.region_level3 || undefined,
    region_level4: newUser.region_level4 || undefined,
    region_level5: newUser.region_level5 || undefined,
    created_at: newUser.created_at
  };
}

export async function loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
  const supabase = getDatabase();
  
  // 사용자 찾기
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !user) {
    throw new Error('사용자명 또는 비밀번호가 올바르지 않습니다.');
  }
  
  // 비밀번호 검증
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('사용자명 또는 비밀번호가 올바르지 않습니다.');
  }
  
  // JWT 토큰 생성
  const token = jwt.sign({ userId: user.id, username: user.username, role: user.role ?? 0 }, JWT_SECRET, { expiresIn: '7d' });
  
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email || undefined,
      role: user.role ?? 0,
      gender: user.gender || undefined,
      region_level1: user.region_level1 || undefined,
      region_level2: user.region_level2 || undefined,
      region_level3: user.region_level3 || undefined,
      region_level4: user.region_level4 || undefined,
      region_level5: user.region_level5 || undefined,
      created_at: user.created_at
    },
    token
  };
}

export function verifyToken(token: string): { userId: number; username: string; role?: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string; role?: number };
    return decoded;
  } catch {
    return null;
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  const supabase = getDatabase();
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, role, gender, region_level1, region_level2, region_level3, region_level4, region_level5, created_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email || undefined,
    role: user.role ?? 0,
    gender: user.gender || undefined,
    region_level1: user.region_level1 || undefined,
    region_level2: user.region_level2 || undefined,
    region_level3: user.region_level3 || undefined,
    region_level4: user.region_level4 || undefined,
    region_level5: user.region_level5 || undefined,
    created_at: user.created_at
  };
}
