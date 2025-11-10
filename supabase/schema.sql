-- 언어 테이블
CREATE TABLE IF NOT EXISTS language (
  lang_code CHAR(1) NOT NULL,
  iso_code2 CHAR(2) NOT NULL,
  iso_code3 CHAR(3),
  name_en VARCHAR(60) NOT NULL,
  name_local VARCHAR(60) NOT NULL,
  sort_order INTEGER,
  use_yn CHAR(1) DEFAULT 'Y',
  PRIMARY KEY (lang_code),
  CONSTRAINT uq_language_iso2 UNIQUE (iso_code2)
);

-- 지역 테이블 (계층 구조)
CREATE TABLE IF NOT EXISTS region (
  region_code VARCHAR(10) NOT NULL,
  parent_code VARCHAR(10),
  level SMALLINT NOT NULL,
  sort_order INTEGER,
  use_yn CHAR(1) DEFAULT 'Y',
  valid_from DATE,
  valid_to DATE,
  PRIMARY KEY (region_code),
  CONSTRAINT fk_region_parent
    FOREIGN KEY (parent_code) REFERENCES region(region_code)
);

CREATE INDEX IF NOT EXISTS idx_region_parent ON region(parent_code);
CREATE INDEX IF NOT EXISTS idx_region_level ON region(level);

-- 지역 다국어 테이블
CREATE TABLE IF NOT EXISTS region_text (
  region_code VARCHAR(10) NOT NULL,
  lang_code CHAR(1) NOT NULL,
  name VARCHAR(100) NOT NULL,
  full_name VARCHAR(300),
  short_name VARCHAR(100),
  PRIMARY KEY (region_code, lang_code),
  CONSTRAINT fk_regiontext_region
    FOREIGN KEY (region_code) REFERENCES region(region_code),
  CONSTRAINT fk_regiontext_lang
    FOREIGN KEY (lang_code) REFERENCES language(lang_code)
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  role SMALLINT DEFAULT 0,
  gender CHAR(1),
  region_level1 VARCHAR(10),
  region_level2 VARCHAR(10),
  region_level3 VARCHAR(10),
  region_level4 VARCHAR(10),
  region_level5 VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_region_level1
    FOREIGN KEY (region_level1) REFERENCES region(region_code),
  CONSTRAINT fk_users_region_level2
    FOREIGN KEY (region_level2) REFERENCES region(region_code),
  CONSTRAINT fk_users_region_level3
    FOREIGN KEY (region_level3) REFERENCES region(region_code),
  CONSTRAINT fk_users_region_level4
    FOREIGN KEY (region_level4) REFERENCES region(region_code),
  CONSTRAINT fk_users_region_level5
    FOREIGN KEY (region_level5) REFERENCES region(region_code)
);

-- 게시판 테이블
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 게시글 테이블
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_notice INTEGER DEFAULT 0,
  status SMALLINT DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 기존 테이블에 컬럼 추가 (이미 존재하는 경우 무시)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role SMALLINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gender CHAR(1),
  ADD COLUMN IF NOT EXISTS region_level1 VARCHAR(10),
  ADD COLUMN IF NOT EXISTS region_level2 VARCHAR(10),
  ADD COLUMN IF NOT EXISTS region_level3 VARCHAR(10),
  ADD COLUMN IF NOT EXISTS region_level4 VARCHAR(10),
  ADD COLUMN IF NOT EXISTS region_level5 VARCHAR(10);

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS status SMALLINT DEFAULT 0;

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_posts_board_id ON posts(board_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_notice ON posts(is_notice);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- 기본 게시판 10개 삽입 (이미 있으면 무시)
INSERT INTO boards (name, description, order_index) VALUES
  ('공지사항', '전체 공지사항', 0),
  ('자유게시판', '자유롭게 글을 작성하세요', 1),
  ('질문과 답변', '질문과 답변을 나누는 공간', 2),
  ('정보공유', '유용한 정보를 공유하세요', 3),
  ('후기', '후기와 리뷰를 작성하세요', 4),
  ('취미/관심사', '취미와 관심사를 나누세요', 5),
  ('구매/판매', '중고 거래 게시판', 6),
  ('모임/모집', '모임과 모집 게시판', 7),
  ('사진/영상', '사진과 영상을 공유하세요', 8),
  ('기타', '기타 게시판', 9)
ON CONFLICT DO NOTHING;

-- 기본 언어 데이터 삽입
INSERT INTO language (lang_code, iso_code2, iso_code3, name_en, name_local, sort_order, use_yn) VALUES
  ('K', 'ko', 'kor', 'Korean', '한국어', 1, 'Y'),
  ('E', 'en', 'eng', 'English', 'English', 2, 'Y'),
  ('J', 'ja', 'jpn', 'Japanese', '日本語', 3, 'Y')
ON CONFLICT (lang_code) DO NOTHING;

-- 기본 지역 데이터 예시 (서울, 경기, 강원 등)
-- 실제 사용 시 필요한 지역 데이터를 추가하세요
-- INSERT INTO region (region_code, parent_code, level, sort_order, use_yn) VALUES
--   ('11', NULL, 1, 1, 'Y'),  -- 서울특별시
--   ('41', NULL, 1, 2, 'Y'),  -- 경기도
--   ('42', NULL, 1, 3, 'Y'),  -- 강원도
--   ('41130', '41', 2, 1, 'Y'),  -- 경기도 시흥시
--   ('41170', '41', 2, 2, 'Y')   -- 경기도 안양시
-- ON CONFLICT (region_code) DO NOTHING;

-- 기본 관리자 계정 생성 (비밀번호: admin123)
-- 비밀번호는 bcrypt로 해시화된 값이어야 합니다
-- 실제 사용 시에는 애플리케이션에서 생성해야 합니다
-- INSERT INTO users (username, password, email, role, gender, region_level1) VALUES
--   ('admin', '$2a$10$...', 'admin@example.com', 3, 'M', '11')
-- ON CONFLICT (username) DO NOTHING;

