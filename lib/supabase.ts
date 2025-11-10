import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 서버 사이드용 Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// 타입 정의
export interface Database {
  public: {
    Tables: {
      language: {
        Row: {
          lang_code: string;
          iso_code2: string;
          iso_code3: string | null;
          name_en: string;
          name_local: string;
          sort_order: number | null;
          use_yn: string;
        };
        Insert: {
          lang_code: string;
          iso_code2: string;
          iso_code3?: string | null;
          name_en: string;
          name_local: string;
          sort_order?: number | null;
          use_yn?: string;
        };
        Update: {
          lang_code?: string;
          iso_code2?: string;
          iso_code3?: string | null;
          name_en?: string;
          name_local?: string;
          sort_order?: number | null;
          use_yn?: string;
        };
      };
      region: {
        Row: {
          region_code: string;
          parent_code: string | null;
          level: number;
          sort_order: number | null;
          use_yn: string;
          valid_from: string | null;
          valid_to: string | null;
        };
        Insert: {
          region_code: string;
          parent_code?: string | null;
          level: number;
          sort_order?: number | null;
          use_yn?: string;
          valid_from?: string | null;
          valid_to?: string | null;
        };
        Update: {
          region_code?: string;
          parent_code?: string | null;
          level?: number;
          sort_order?: number | null;
          use_yn?: string;
          valid_from?: string | null;
          valid_to?: string | null;
        };
      };
      region_text: {
        Row: {
          region_code: string;
          lang_code: string;
          name: string;
          full_name: string | null;
          short_name: string | null;
        };
        Insert: {
          region_code: string;
          lang_code: string;
          name: string;
          full_name?: string | null;
          short_name?: string | null;
        };
        Update: {
          region_code?: string;
          lang_code?: string;
          name?: string;
          full_name?: string | null;
          short_name?: string | null;
        };
      };
      users: {
        Row: {
          id: number;
          username: string;
          password: string;
          email: string | null;
          role: number;
          gender: string | null;
          region_level1: string | null;
          region_level2: string | null;
          region_level3: string | null;
          region_level4: string | null;
          region_level5: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          username: string;
          password: string;
          email?: string | null;
          role?: number;
          gender?: string | null;
          region_level1?: string | null;
          region_level2?: string | null;
          region_level3?: string | null;
          region_level4?: string | null;
          region_level5?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          username?: string;
          password?: string;
          email?: string | null;
          role?: number;
          gender?: string | null;
          region_level1?: string | null;
          region_level2?: string | null;
          region_level3?: string | null;
          region_level4?: string | null;
          region_level5?: string | null;
          created_at?: string;
        };
      };
      boards: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      posts: {
        Row: {
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
        };
        Insert: {
          id?: number;
          board_id: number;
          user_id: number;
          title: string;
          content: string;
          is_notice?: number;
          status?: number;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          board_id?: number;
          user_id?: number;
          title?: string;
          content?: string;
          is_notice?: number;
          status?: number;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

