# 유니브매치 시니어 리뷰어 진단 보고서

**작성일**: 2026년 2월 7일  
**리뷰어**: Manus AI (시니어 프론트엔드/풀스택)  
**프로젝트**: React 19 + Vite + Express + tRPC + MySQL  
**코드 규모**: ~17,901줄 (클라이언트 5,913줄 + 서버 3,297줄)

---

## 📊 핵심 이슈 Top 10 (우선순위순)

### 🚨 **P0 (즉시 수정 필요)**

#### 1. **Missing useAuth Import in Navbar.tsx**
- **왜 문제인가**: `useAuth()` 호출하지만 import 없음 → 런타임 에러 발생
- **영향**: 모든 페이지 네비게이션 바 기능 마비 (로그인/로그아웃 불가)
- **수정 방향**: `import { useAuth } from "@/_core/hooks/useAuth";` 추가

#### 2. **Unprotected Admin Routes (인증 검증 부재)**
- **왜 문제인가**: `/admin`, `/admin/bug-reports` 라우트가 클라이언트 레벨에서만 보호됨
- **영향**: 브라우저 개발자 도구로 URL 직접 접근 시 관리자 기능 노출 (보안 위험)
- **수정 방향**: 서버 라우터에서 `adminProcedure` 검증 강화 + 클라이언트 라우트 가드 추가

#### 3. **Navbar.tsx에서 useAuth 정의 안 됨**
- **왜 문제인가**: `const { isAuthenticated } = useAuth();` 사용하지만 import 누락
- **영향**: 프로덕션 빌드 실패 또는 런타임 크래시
- **수정 방향**: `import { useAuth } from "@/_core/hooks/useAuth";` 추가

#### 4. **Missing Error Handling in API Calls**
- **왜 문제인가**: `MentorDetail.tsx` 등에서 `trpc.mentor.getById.useQuery()` 실패 시 UI 처리 없음
- **영향**: 멘토 조회 실패 시 빈 화면 또는 크래시
- **수정 방향**: `isError` 상태 확인 후 에러 UI 렌더링

#### 5. **SQL Injection 위험 (URL 파라미터)**
- **왜 문제인가**: `MentorDetail.tsx`에서 `const { id } = useParams()`로 받은 id를 검증 없이 쿼리에 전달
- **영향**: 악의적 URL 조작 시 데이터 노출 가능
- **수정 방향**: `parseInt(id, 10)` 후 `isNaN()` 검증 + 서버에서 타입 검증

---

### ⚠️ **P1 (이번 릴리즈 전 권장)**

#### 6. **Multiple API Calls in Mentors.tsx (성능 저하)**
- **왜 문제인가**: 필터 선택 시 4개의 독립적인 `useQuery` 호출 (listAll, getByFieldAndRegion, getByField, getByRegion)
- **영향**: 불필요한 네트워크 요청 → 로딩 지연, 대역폭 낭비
- **수정 방향**: 단일 `useQuery`로 통합 + 서버에서 필터 로직 처리

#### 7. **Missing SEO Meta Tags (페이지별)**
- **왜 문제인가**: `Home.tsx`에서만 동적 메타 태그 설정, 다른 페이지는 기본값 사용
- **영향**: 검색 엔진 최적화 저하, 소셜 공유 시 썸네일 미표시
- **수정 방향**: 모든 페이지에 `useEffect`로 동적 메타 태그 설정 또는 `react-helmet` 도입

#### 8. **No Loading State in MentorDetail Booking Dialog**
- **왜 문제인가**: 상담 신청 중 버튼 상태 변화 없음 (중복 클릭 가능)
- **영향**: 중복 신청 또는 UX 혼란
- **수정 방향**: `createBookingMutation.isPending` 상태로 버튼 비활성화

#### 9. **Hardcoded Image URL in Navbar**
- **왜 문제인가**: 로고 이미지가 외부 CDN URL로 하드코딩됨 (`https://files.manuscdn.com/...`)
- **영향**: 이미지 로드 실패 시 로고 미표시, 외부 의존성 증가
- **수정 방향**: 환경 변수 또는 import 로컬 이미지 사용

#### 10. **No Debounce on Search Input (Mentors.tsx)**
- **왜 문제인가**: `searchTerm` 상태 변경 시마다 필터링 실행 (모든 키입력마다)
- **영향**: 불필요한 렌더링, 성능 저하
- **수정 방향**: `useMemo` + `useCallback` 또는 debounce 라이브러리 사용

---

### 🧹 **P2 (리팩토링/정리 단계)**

#### 11. **Duplicate Code in Navbar (Mobile/Desktop)**
- **왜 문제인가**: 메뉴 항목이 데스크톱 버튼 + 모바일 드롭다운에 중복
- **영향**: 유지보수 어려움, 코드 가독성 저하
- **수정 방향**: 메뉴 배열 상수화 + 반복 렌더링

#### 12. **No TypeScript Strict Mode Validation**
- **왜 문제인가**: `as any` 캐스팅 사용 (`Mentors.tsx` 라인 40-41)
- **영향**: 타입 안전성 저하, 런타임 에러 위험
- **수정 방향**: 정확한 타입 정의 + `as any` 제거

#### 13. **Console.log 남아있음**
- **왜 문제인가**: 프로덕션 코드에 디버깅 로그 9개 존재
- **영향**: 번들 크기 증가, 보안 정보 노출 가능
- **수정 방향**: 모든 `console.log` 제거 또는 로깅 라이브러리로 통합

#### 14. **Missing Accessibility Attributes**
- **왜 문제인가**: 버튼, 링크에 `aria-label` 부족, 포커스 스타일 미흡
- **영향**: 스크린 리더 사용자 접근성 저하
- **수정 방향**: `aria-label`, `aria-describedby` 추가 + 포커스 스타일 강화

#### 15. **No Error Boundary for Async Components**
- **왜 문제인가**: `ErrorBoundary`는 있지만 비동기 에러(Promise rejection) 미처리
- **영향**: 비동기 작업 실패 시 흰 화면
- **수정 방향**: `onUnhandledRejection` 이벤트 리스너 추가

---

## 📈 프로젝트 건강도 스코어

| 항목 | 점수 | 상태 |
|------|:---:|------|
| **보안** | 6/10 | ⚠️ 관리자 라우트 검증 필요 |
| **성능** | 7/10 | ⚠️ API 호출 최적화 필요 |
| **가독성** | 8/10 | ✅ 구조 양호, 중복 코드 정리 필요 |
| **테스트** | 7/10 | ⚠️ 71개 테스트 통과, E2E 부족 |
| **SEO** | 6/10 | ⚠️ 기본 메타 태그만 설정 |
| **접근성** | 5/10 | ⚠️ aria 속성 부족 |
| **배포 안정성** | 8/10 | ✅ TypeScript 에러 0, 빌드 안정 |
| **유지보수성** | 7/10 | ⚠️ 중복 코드, 상수화 필요 |
| **평균** | **6.9/10** | ⚠️ **개선 필요** |

---

## 🎯 즉시 조치 사항 (1시간 내)

1. ✅ `Navbar.tsx`에 `useAuth` import 추가
2. ✅ `MentorDetail.tsx`에 에러 UI 추가
3. ✅ `/admin` 라우트 클라이언트 가드 추가
4. ✅ 모든 `console.log` 제거

---

## 📋 상세 리뷰는 다음 문서 참고

- **A. 구조/가독성**: `SENIOR_REVIEW_DETAILED_A.md`
- **B. 오류/버그**: `SENIOR_REVIEW_DETAILED_B.md`
- **C. 성능**: `SENIOR_REVIEW_DETAILED_C.md`
- **D. 보안**: `SENIOR_REVIEW_DETAILED_D.md`
- **E. SEO**: `SENIOR_REVIEW_DETAILED_E.md`
- **F. 접근성**: `SENIOR_REVIEW_DETAILED_F.md`
- **G. 코드스타일**: `SENIOR_REVIEW_DETAILED_G.md`
- **H. 배포 안정성**: `SENIOR_REVIEW_DETAILED_H.md`

---

**다음 단계**: 상세 리뷰 및 리팩토링 패치 생성 중...
