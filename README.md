🛡️ Gryphon Auth

Gryphon Auth는 Node.js 기반의 인증 서버 실습 프로젝트입니다.
Fastify, JWT, Redis를 활용하여 간단하고 안전한 인증 기능을 직접 구현하며,
MSA 아키텍처에서 인증 마이크로서비스를 어떻게 구성할 수 있는지 학습하는 것이 목적입니다.

⸻

🚀 주요 기능

•	회원가입 / 로그인 / 로그아웃
•	Access Token + Refresh Token 발급
•	Redis 기반 토큰 관리
•	보호된 라우트 접근 (JWT 인증)
⸻

📦 설치 및 실행

git clone https://github.com/your-username/gryphon-auth.git
cd gryphon-auth
npm install

.env 파일을 작성:

PORT=3000
JWT_SECRET=your_jwt_secret
REDIS_HOST=127.0.0.1

Redis 실행 후:

node server.js

⸻

🧪 API 예시

메서드	경로	설명
POST	/auth/signup	회원가입
POST	/auth/login	로그인 및 토큰 발급
POST	/auth/logout	로그아웃 및 리프레시 토큰 제거
POST	/auth/refresh	리프레시 토큰으로 액세스 토큰 재발급
GET	/auth/protected	JWT 인증이 필요한 보호된 라우트

⸻

✅ 개발 목표
•	Fastify 기반 기본 API 구성
•	JWT 액세스 / 리프레시 토큰 설계
•	Redis 연동 및 토큰 관리
•	사용자 DB 연동
•	테스트 케이스 작성
•	OAuth 2.0 지원 (Google 로그인 등)