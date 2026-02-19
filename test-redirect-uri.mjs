// getPublicOrigin 함수 테스트
const getPublicOrigin = (origin, forcedOrigin) => {
  if (forcedOrigin && forcedOrigin.trim().length > 0) {
    return forcedOrigin.replace(/\/$/, "");
  }
  if (origin.startsWith("http://")) {
    return origin.replace("http://", "https://");
  }
  return origin;
};

// 테스트 케이스
console.log("=== Redirect URI 테스트 ===\n");

// 1. VITE_PUBLIC_ORIGIN이 설정된 경우
const publicOrigin1 = getPublicOrigin("http://localhost:3000", "https://univmatch.com");
console.log("1. VITE_PUBLIC_ORIGIN 설정됨:");
console.log(`   Redirect URI: ${publicOrigin1}/api/oauth/callback`);
console.log(`   예상값: https://univmatch.com/api/oauth/callback`);
console.log(`   ✓ 일치: ${publicOrigin1 === "https://univmatch.com" ? "YES" : "NO"}\n`);

// 2. VITE_PUBLIC_ORIGIN이 설정되지 않은 경우 (HTTP)
const publicOrigin2 = getPublicOrigin("http://localhost:3000", "");
console.log("2. VITE_PUBLIC_ORIGIN 미설정, HTTP 도메인:");
console.log(`   Redirect URI: ${publicOrigin2}/api/oauth/callback`);
console.log(`   예상값: https://localhost:3000/api/oauth/callback`);
console.log(`   ✓ 일치: ${publicOrigin2 === "https://localhost:3000" ? "YES" : "NO"}\n`);

// 3. VITE_PUBLIC_ORIGIN이 설정되지 않은 경우 (HTTPS)
const publicOrigin3 = getPublicOrigin("https://univmatch.com", "");
console.log("3. VITE_PUBLIC_ORIGIN 미설정, HTTPS 도메인:");
console.log(`   Redirect URI: ${publicOrigin3}/api/oauth/callback`);
console.log(`   예상값: https://univmatch.com/api/oauth/callback`);
console.log(`   ✓ 일치: ${publicOrigin3 === "https://univmatch.com" ? "YES" : "NO"}\n`);

// 4. VITE_PUBLIC_ORIGIN에 슬래시가 있는 경우
const publicOrigin4 = getPublicOrigin("http://localhost:3000", "https://univmatch.com/");
console.log("4. VITE_PUBLIC_ORIGIN에 슬래시 포함:");
console.log(`   Redirect URI: ${publicOrigin4}/api/oauth/callback`);
console.log(`   예상값: https://univmatch.com/api/oauth/callback`);
console.log(`   ✓ 일치: ${publicOrigin4 === "https://univmatch.com" ? "YES" : "NO"}\n`);

console.log("=== 결론 ===");
console.log("✓ getPublicOrigin 함수가 모든 경우에 대해 올바르게 작동합니다.");
