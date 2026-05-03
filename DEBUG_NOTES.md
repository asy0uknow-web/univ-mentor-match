# 로그인 버그 디버깅 노트

## 문제
로그인 버튼을 클릭해도 페이지가 리다이렉트되지 않음

## 수정 사항

### 1. vite.ts - API 경로 우회 (✅ 완료)
- Vite 미들웨어가 모든 요청을 가로채고 있었음
- `/api/` 경로를 Vite 미들웨어에서 우회하도록 수정
- 이제 tRPC 요청이 Express 미들웨어에 도착함

### 2. server/_core/index.ts - JSON 파서 명시적 추가 (✅ 완료)
- tRPC 경로에 JSON 파서를 명시적으로 추가
- `app.use("/api/trpc", express.json({ limit: "50mb" }));`

### 3. client/src/App.tsx - 라우팅 버그 수정 (✅ 완료)
- `<Route path={"\\"} component={Home} />` → `<Route path={"/"} component={Home} />`
- 이제 로그인 후 `/` 경로로 리다이렉트될 때 Home이 렌더링됨

### 4. client/src/pages/Login.tsx - 포괄적인 로깅 추가 (✅ 완료)
- 각 단계마다 콘솔 로그 추가
- 에러 처리 개선

## 현재 상태
- 로그인 요청이 여전히 실패함
- tRPC API가 "Invalid input: expected object, received undefined" 오류 반환
- 이는 요청 본문이 서버에 도착하지 않거나, 형식이 잘못되었음을 의미

## 다음 단계
1. 브라우저 Network 탭에서 실제 tRPC 요청 확인
2. 요청 URL, 헤더, 본문 형식 확인
3. 서버 로그에서 요청 도착 여부 확인
4. 필요하면 tRPC 클라이언트 설정 재검토

## 참고
- tRPC v11 httpBatchLink는 특정한 배치 형식을 사용
- 요청 형식: POST /api/trpc + {"0":{"json":{"email":"...","password":"..."}}}
- 또는 경로 지정: POST /api/trpc/auth.login?batch=1
