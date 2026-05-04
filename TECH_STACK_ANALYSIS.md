# 기술 스택 분석 보고서

## 1단계: 현재 기술 스택 파악

### 프로젝트 구조
```
univ-mentor-match/
├── client/                    # React 프론트엔드
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── components/       # UI 컴포넌트
│   │   └── lib/              # 유틸리티 함수
│   └── vite.config.ts
├── server/                    # Express 백엔드
│   ├── _core/
│   ├── routers/
│   ├── auth-*.ts
│   └── db.ts
├── drizzle/                   # 데이터베이스 스키마
│   └── schema.ts
└── package.json
```

### 핵심 기술 스택

#### 프론트엔드 (Client)
- **프레임워크**: React 19.2.1
- **번들러**: Vite 7.1.7
- **라우팅**: Wouter 3.3.5
- **상태관리**: TanStack React Query 5.90.2
- **API 통신**: tRPC (client 11.6.0, react-query 11.6.0)
- **UI 라이브러리**: Radix UI (20+ 컴포넌트)
- **스타일링**: Tailwind CSS 4.1.14
- **폼 관리**: React Hook Form 7.64.0
- **애니메이션**: Framer Motion 12.23.22
- **차트**: Recharts 2.15.2
- **토스트**: Sonner 2.0.7
- **아이콘**: Lucide React 0.453.0

#### 백엔드 (Server)
- **프레임워크**: Express 4.21.2
- **런타임**: Node.js (tsx 4.19.1로 실행)
- **API**: tRPC (server 11.6.0)
- **인증**: Jose 6.1.0 (JWT)
- **데이터베이스**: MySQL (mysql2 3.15.0)
- **ORM**: Drizzle ORM 0.44.5
- **결제**: Stripe 20.1.0
- **스토리지**: AWS S3 (@aws-sdk/client-s3 3.693.0)
- **환경변수**: dotenv 17.2.2

#### 개발 도구
- **언어**: TypeScript 5.9.3
- **테스트**: Vitest 2.1.4
- **빌드**: esbuild 0.25.0
- **포매팅**: Prettier 3.6.2
- **패키지 관리**: pnpm 10.15.1

#### 데이터베이스
- **마이그레이션**: Drizzle Kit 0.31.4
- **데이터베이스**: TiDB Cloud (MySQL 호환)

### 의존성 요약

**총 의존성**: 약 80개 (직접 의존성)
- 프로덕션 의존성: 50개
- 개발 의존성: 25개

### 주요 특징
1. **모던 스택**: React 19, TypeScript, Vite, Tailwind CSS 4
2. **타입 안전성**: TypeScript + Zod 스키마 검증
3. **풀스택 tRPC**: 타입 안전한 API 통신
4. **마이크로서비스 아키텍처**: 분리된 client/server 구조
5. **클라우드 기반**: AWS S3, TiDB Cloud 활용

### 설정 파일
- `vite.config.ts`: Vite 번들러 설정
- `tsconfig.json`: TypeScript 설정
- `tailwind.config.ts`: Tailwind CSS 설정
- `postcss.config.ts`: PostCSS 설정
- `.env.local`: 환경변수 (개발용)
- `drizzle.config.ts`: Drizzle ORM 설정

---

## 다음 단계: 레거시 코드 탐지

2단계에서 다음을 탐지할 예정:
1. 미사용 패키지 참조
2. 구버전 API 사용
3. 데드 코드 (미사용 함수/컴포넌트)
4. 중복 코드
5. 의존성 불일치
