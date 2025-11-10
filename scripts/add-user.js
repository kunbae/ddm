/**
 * 사용자 추가 스크립트
 * 사용법: node scripts/add-user.js <username> <password> [email]
 * 예시: node scripts/add-user.js testuser test123 test@example.com
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');

// 명령줄 인자 확인
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('사용법: node scripts/add-user.js <username> <password> [email]');
  process.exit(1);
}

const [username, password, email] = args;

// 데이터 디렉토리 확인
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 기존 사용자 읽기
let users = [];
if (fs.existsSync(usersFile)) {
  try {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
  } catch (error) {
    console.error('사용자 파일 읽기 실패:', error.message);
    process.exit(1);
  }
}

// 중복 확인
if (users.find(u => u.username === username)) {
  console.error(`오류: 사용자명 "${username}"이(가) 이미 존재합니다.`);
  process.exit(1);
}

// 비밀번호 해시화
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) {
    console.error('비밀번호 해시화 실패:', err.message);
    process.exit(1);
  }

  // 새 사용자 생성
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    password: hashedPassword,
    email: email || undefined,
    created_at: new Date().toISOString()
  };

  users.push(newUser);

  // 파일에 저장
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
    console.log(`✅ 사용자 "${username}"이(가) 성공적으로 추가되었습니다.`);
    console.log(`   ID: ${newUser.id}`);
    if (email) {
      console.log(`   이메일: ${email}`);
    }
  } catch (error) {
    console.error('파일 저장 실패:', error.message);
    process.exit(1);
  }
});



