import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

// 데이터베이스 초기화
export async function initDatabase() {
  // 기본 언어 데이터 확인 및 생성
  const { data: languages, error: langError } = await supabase
    .from('language')
    .select('lang_code')
    .limit(1);

  if (langError && langError.code !== 'PGRST116') {
    console.error('언어 테이블 확인 실패:', langError);
  }

  if (!languages || languages.length === 0) {
    const defaultLanguages = [
      { lang_code: 'K', iso_code2: 'ko', iso_code3: 'kor', name_en: 'Korean', name_local: '한국어', sort_order: 1, use_yn: 'Y' },
      { lang_code: 'E', iso_code2: 'en', iso_code3: 'eng', name_en: 'English', name_local: 'English', sort_order: 2, use_yn: 'Y' },
      { lang_code: 'J', iso_code2: 'ja', iso_code3: 'jpn', name_en: 'Japanese', name_local: '日本語', sort_order: 3, use_yn: 'Y' }
    ];

    const { error: insertError } = await supabase
      .from('language')
      .insert(defaultLanguages);

    if (insertError) {
      console.error('언어 데이터 생성 실패:', insertError);
    }
  }

  // 기본 게시판 확인 및 생성
  const { data: boards, error: boardsError } = await supabase
    .from('boards')
    .select('id')
    .limit(1);

  if (boardsError) {
    console.error('게시판 확인 실패:', boardsError);
    return;
  }

  // 게시판이 없으면 기본 게시판 생성
  if (!boards || boards.length === 0) {
    const defaultBoards = [
      { name: '공지사항', description: '전체 공지사항', order_index: 0 },
      { name: '자유게시판', description: '자유롭게 글을 작성하세요', order_index: 1 },
      { name: '질문과 답변', description: '질문과 답변을 나누는 공간', order_index: 2 },
      { name: '정보공유', description: '유용한 정보를 공유하세요', order_index: 3 },
      { name: '후기', description: '후기와 리뷰를 작성하세요', order_index: 4 },
      { name: '취미/관심사', description: '취미와 관심사를 나누세요', order_index: 5 },
      { name: '구매/판매', description: '중고 거래 게시판', order_index: 6 },
      { name: '모임/모집', description: '모임과 모집 게시판', order_index: 7 },
      { name: '사진/영상', description: '사진과 영상을 공유하세요', order_index: 8 },
      { name: '기타', description: '기타 게시판', order_index: 9 }
    ];

    const { error: insertError } = await supabase
      .from('boards')
      .insert(defaultBoards);

    if (insertError) {
      console.error('게시판 생성 실패:', insertError);
    }
  }

  // 기본 관리자 계정 확인 및 생성
  const { data: adminUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('username', 'admin')
    .single();

  if (userError && userError.code !== 'PGRST116') { // PGRST116은 "not found" 에러
    console.error('관리자 계정 확인 실패:', userError);
    return;
  }

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        role: 2, // 관리자
        gender: null
      });

    if (insertError) {
      console.error('관리자 계정 생성 실패:', insertError);
    }
  }
}

// Supabase 클라이언트 반환 (호환성을 위해)
export function getDatabase() {
  return supabase;
}
