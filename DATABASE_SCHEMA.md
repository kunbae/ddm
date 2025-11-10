# 데이터베이스 테이블 구조

## 📊 테이블 목록

프로젝트는 총 **6개의 테이블**을 사용합니다:

1. **language** - 언어 정보
2. **region** - 지역 정보 (계층 구조)
3. **region_text** - 지역 다국어 정보
4. **users** - 사용자 정보
5. **boards** - 게시판 정보
6. **posts** - 게시글 정보

---

## 1. language 테이블 (언어)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `lang_code` | CHAR(1) | PRIMARY KEY | - | 언어 코드 (SAP SPRAS 스타일) |
| `iso_code2` | CHAR(2) | UNIQUE, NOT NULL | - | ISO 639-1 코드 (예: 'ko', 'en', 'ja') |
| `iso_code3` | CHAR(3) | NULL 허용 | NULL | ISO 639-3 코드 (예: 'kor', 'eng', 'jpn') |
| `name_en` | VARCHAR(60) | NOT NULL | - | 영어 이름 |
| `name_local` | VARCHAR(60) | NOT NULL | - | 현지어 이름 |
| `sort_order` | INTEGER | NULL 허용 | NULL | 정렬 순서 |
| `use_yn` | CHAR(1) | - | 'Y' | 사용 여부 ('Y'/'N') |

### 기본 언어 데이터
- `K` - 한국어 (ko, kor)
- `E` - 영어 (en, eng)
- `J` - 일본어 (ja, jpn)

---

## 2. region 테이블 (지역 - 계층 구조)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `region_code` | VARCHAR(10) | PRIMARY KEY | - | 지역 코드 (법정동코드 or 내부 코드) |
| `parent_code` | VARCHAR(10) | FOREIGN KEY, NULL 허용 | NULL | 상위 지역 코드 (region.region_code 참조) |
| `level` | SMALLINT | NOT NULL | - | 계층 레벨<br/>- `1`: 시도 (서울, 경기, 강원 등)<br/>- `2`: 시군구 (시흥, 안양 등)<br/>- `3`: 구<br/>- `4`: 읍면동<br/>- `5`: 리 |
| `sort_order` | INTEGER | NULL 허용 | NULL | 정렬 순서 |
| `use_yn` | CHAR(1) | - | 'Y' | 사용 여부 ('Y'/'N') |
| `valid_from` | DATE | NULL 허용 | NULL | 유효 시작일 |
| `valid_to` | DATE | NULL 허용 | NULL | 유효 종료일 |

### 계층 구조 예시
```
서울특별시 (level=1, region_code='11')
  └─ 강남구 (level=3, region_code='11680', parent_code='11')
      └─ 역삼동 (level=4, region_code='1168010100', parent_code='11680')

경기도 (level=1, region_code='41')
  └─ 시흥시 (level=2, region_code='41130', parent_code='41')
  └─ 안양시 (level=2, region_code='41170', parent_code='41')
```

### 인덱스
- `idx_region_parent` - 상위 지역 코드 인덱스
- `idx_region_level` - 레벨별 인덱스

---

## 3. region_text 테이블 (지역 다국어)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `region_code` | VARCHAR(10) | PRIMARY KEY, FOREIGN KEY | - | 지역 코드 (region.region_code 참조) |
| `lang_code` | CHAR(1) | PRIMARY KEY, FOREIGN KEY | - | 언어 코드 (language.lang_code 참조) |
| `name` | VARCHAR(100) | NOT NULL | - | 지역 이름 (예: '마두동') |
| `full_name` | VARCHAR(300) | NULL 허용 | NULL | 전체 이름 (예: '경기도 고양시 일산동구 마두동') |
| `short_name` | VARCHAR(100) | NULL 허용 | NULL | 짧은 이름 |

### 예시
| region_code | lang_code | name | full_name |
|-------------|-----------|------|-----------|
| 41130 | K | 시흥시 | 경기도 시흥시 |
| 41130 | E | Siheung | Gyeonggi-do Siheung-si |

---

## 4. users 테이블 (사용자)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | SERIAL | PRIMARY KEY | 자동 증가 | 사용자 고유 ID |
| `username` | TEXT | UNIQUE, NOT NULL | - | 사용자명 (중복 불가) |
| `password` | TEXT | NOT NULL | - | 해시화된 비밀번호 (bcrypt) |
| `email` | TEXT | NULL 허용 | NULL | 이메일 주소 (선택) |
| `role` | SMALLINT | - | 0 | 사용자 역할<br/>- `0`: 일반 사용자<br/>- `1`: 검토자<br/>- `2`: 관리자<br/>- `3`: 등록자 |
| `gender` | CHAR(1) | NULL 허용 | NULL | 성별<br/>- `M`: 남성<br/>- `F`: 여성<br/>- 기타 |
| `region_level1` | VARCHAR(10) | FOREIGN KEY, NULL 허용 | NULL | 지역 레벨1 (시도) - region.region_code 참조 |
| `region_level2` | VARCHAR(10) | FOREIGN KEY, NULL 허용 | NULL | 지역 레벨2 (시군구) - region.region_code 참조 |
| `region_level3` | VARCHAR(10) | FOREIGN KEY, NULL 허용 | NULL | 지역 레벨3 (구) - region.region_code 참조 |
| `region_level4` | VARCHAR(10) | FOREIGN KEY, NULL 허용 | NULL | 지역 레벨4 (읍면동) - region.region_code 참조 |
| `region_level5` | VARCHAR(10) | FOREIGN KEY, NULL 허용 | NULL | 지역 레벨5 (리) - region.region_code 참조 |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | CURRENT_TIMESTAMP | 계정 생성 일시 |

### 역할(role) 값 설명
- **0**: 일반 사용자
  - 게시글 작성 가능
  - 본인 글만 수정/삭제 가능
  - status=1인 게시글만 조회 가능
  - 본인이 작성한 status=0 게시글도 조회 가능

- **1**: 검토자
  - 모든 게시글 조회 가능
  - 게시글 승인 가능 (status 변경)
  - 공지사항 작성 가능

- **2**: 관리자
  - 모든 권한 보유
  - 기본 admin 계정 (자동 생성)

- **3**: 등록자
  - 등록 관련 권한 보유

### 지역 코드 예시
```
사용자가 "경기도 시흥시"에 거주하는 경우:
- region_level1: '41' (경기도)
- region_level2: '41130' (시흥시)
- region_level3: NULL
- region_level4: NULL
- region_level5: NULL
```

---

## 5. boards 테이블 (게시판)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | SERIAL | PRIMARY KEY | 자동 증가 | 게시판 고유 ID |
| `name` | TEXT | NOT NULL | - | 게시판 이름 |
| `description` | TEXT | NULL 허용 | NULL | 게시판 설명 |
| `order_index` | INTEGER | - | 0 | 정렬 순서 (낮을수록 먼저 표시) |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | CURRENT_TIMESTAMP | 게시판 생성 일시 |

### 기본 게시판 (자동 생성)
1. 공지사항 (order_index: 0)
2. 자유게시판 (order_index: 1)
3. 질문과 답변 (order_index: 2)
4. 정보공유 (order_index: 3)
5. 후기 (order_index: 4)
6. 취미/관심사 (order_index: 5)
7. 구매/판매 (order_index: 6)
8. 모임/모집 (order_index: 7)
9. 사진/영상 (order_index: 8)
10. 기타 (order_index: 9)

---

## 6. posts 테이블 (게시글)

| 컬럼명 | 타입 | 제약조건 | 기본값 | 설명 |
|--------|------|----------|--------|------|
| `id` | SERIAL | PRIMARY KEY | 자동 증가 | 게시글 고유 ID |
| `board_id` | INTEGER | NOT NULL, FOREIGN KEY | - | 게시판 ID (boards.id 참조) |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY | - | 작성자 ID (users.id 참조) |
| `title` | TEXT | NOT NULL | - | 게시글 제목 |
| `content` | TEXT | NOT NULL | - | 게시글 내용 |
| `is_notice` | INTEGER | - | 0 | 공지사항 여부<br/>- `0`: 일반 게시글<br/>- `1`: 공지사항 |
| `status` | SMALLINT | - | 0 | 게시글 상태<br/>- `0`: 검토중 (작성자만 볼 수 있음)<br/>- `1`: 승인됨 (전체 공개) |
| `views` | INTEGER | - | 0 | 조회수 |
| `created_at` | TIMESTAMP WITH TIME ZONE | - | CURRENT_TIMESTAMP | 작성 일시 |
| `updated_at` | TIMESTAMP WITH TIME ZONE | - | CURRENT_TIMESTAMP | 수정 일시 |

### 외래 키 관계
- `board_id` → `boards.id` (CASCADE DELETE: 게시판 삭제 시 게시글도 삭제)
- `user_id` → `users.id` (CASCADE DELETE: 사용자 삭제 시 게시글도 삭제)

### 상태(status) 값 설명
- **0 (검토중)**: 
  - 게시글 작성 시 자동으로 설정됨
  - 작성자 본인과 검토자(role ≥ 1)만 볼 수 있음
  - 일반 사용자에게는 노출되지 않음
  
- **1 (승인됨)**:
  - 검토자가 승인한 게시글
  - 모든 사용자에게 공개됨
  - 조회수 증가 가능

---

## 📑 인덱스

성능 최적화를 위한 인덱스:

| 인덱스명 | 테이블 | 컬럼 | 설명 |
|----------|--------|------|------|
| `idx_region_parent` | region | parent_code | 상위 지역 조회 최적화 |
| `idx_region_level` | region | level | 레벨별 지역 조회 최적화 |
| `idx_posts_board_id` | posts | board_id | 게시판별 게시글 조회 최적화 |
| `idx_posts_user_id` | posts | user_id | 사용자별 게시글 조회 최적화 |
| `idx_posts_is_notice` | posts | is_notice | 공지사항 조회 최적화 |
| `idx_posts_status` | posts | status | 상태별 게시글 조회 최적화 |
| `idx_posts_created_at` | posts | created_at DESC | 최신순 정렬 최적화 |

---

## 🔄 데이터 흐름 예시

### 게시글 작성 흐름
```
1. 사용자가 게시글 작성
   → posts 테이블에 INSERT
   → status = 0 (검토중)
   → user_id = 작성자 ID

2. 작성자 본인에게만 표시
   → getPostsByBoard()에서 status=0인 경우 작성자만 조회 가능

3. 검토자가 승인
   → posts 테이블 UPDATE
   → status = 1 (승인됨)

4. 모든 사용자에게 표시
   → getPostsByBoard()에서 status=1인 게시글만 일반 사용자에게 노출
```

### 사용자 역할별 권한
```
일반 사용자 (role = 0):
  - 본인이 작성한 게시글만 수정/삭제 가능
  - status=1인 게시글만 조회 가능
  - 본인이 작성한 status=0 게시글도 조회 가능

검토자 (role = 1):
  - 모든 게시글 조회 가능
  - 게시글 승인 가능 (status 변경)
  - 공지사항 작성 가능

관리자 (role = 2):
  - 모든 권한 보유
  - 기본 admin 계정 (자동 생성)

등록자 (role = 3):
  - 등록 관련 권한 보유
```

### 지역 데이터 조회 예시
```
1. region 테이블에서 레벨별 지역 조회
   - level=1: 시도 목록 (서울, 경기, 강원 등)
   - level=2: 시군구 목록 (시흥, 안양 등)
   - level=3: 구 목록
   - level=4: 읍면동 목록
   - level=5: 리 목록

2. region_text 테이블에서 다국어 이름 조회
   - region_code와 lang_code로 지역 이름 조회
   - 예: region_code='41130', lang_code='K' → '시흥시'
```

---

## 📝 참고사항

- 모든 테이블은 `created_at` 필드로 생성 일시를 자동 기록합니다.
- `posts` 테이블은 `updated_at` 필드로 수정 일시를 추적합니다.
- `users` 테이블의 지역 코드는 `region` 테이블의 `region_code`를 참조합니다.
- `region` 테이블은 자기 참조(self-referencing) 외래 키를 사용하여 계층 구조를 구현합니다.
- `posts.status`는 SMALLINT 타입으로 저장되며, 현재는 0과 1만 사용됩니다.
- 외래 키 제약조건으로 인해 존재하지 않는 board_id나 user_id로는 게시글을 생성할 수 없습니다.
- `region` 테이블의 `valid_from`과 `valid_to`로 지역 코드의 유효 기간을 관리할 수 있습니다.
