# 레거시 코드 탐지 보고서

## 2단계: 레거시 코드 탐지 결과

### 1. 미사용 패키지 참조

#### 1.1 사용 중이지만 불필요한 패키지
| 패키지 | 버전 | 파일 | 줄 번호 | 상태 |
|--------|------|------|--------|------|
| `streamdown` | 1.4.0 | client/src/components/AIChatBox.tsx | - | 1개 파일에서만 사용, ComponentShowcase에서만 참조 |
| `next-themes` | 0.4.6 | client/src/components/ui/sonner.tsx | - | 토스트 알림에서 사용, 현재 기능 미활용 |
| `axios` | 1.12.0 | package.json | - | 선언되었으나 코드에서 사용 없음 (tRPC로 대체) |

#### 1.2 사용되지 않는 UI 컴포넌트 라이브러리
| 패키지 | 사용 여부 |
|--------|---------|
| @radix-ui/react-context-menu | ❌ 미사용 |
| @radix-ui/react-hover-card | ❌ 미사용 |
| @radix-ui/react-menubar | ❌ 미사용 |
| @radix-ui/react-navigation-menu | ❌ 미사용 |

### 2. 데드 코드 (미사용 함수/컴포넌트)

#### 2.1 미사용 페이지 컴포넌트
| 파일 | 상태 | 이유 |
|------|------|------|
| client/src/pages/ComponentShowcase.tsx | ❌ 미사용 | App.tsx에 라우트 등록 안 됨, AIChatBox만 사용 |

#### 2.2 미사용 컴포넌트
| 컴포넌트 | 파일 | 상태 |
|---------|------|------|
| AIChatBox | client/src/components/AIChatBox.tsx | ❌ ComponentShowcase에서만 사용 |

### 3. 중복 코드

#### 3.1 중복된 섹션 컴포넌트
| 컴포넌트 1 | 컴포넌트 2 | 차이점 | 권장사항 |
|-----------|-----------|--------|---------|
| NoCommissionSection | ZeroCommissionUSPSection | 동일한 기능, 다른 스타일 | 하나로 통합, 스타일 옵션 추가 |

#### 3.2 중복된 홈페이지 섹션
```
client/src/components/home/
├── MentorVerificationSection.tsx
├── MentorVerificationUSPSection.tsx  ← 유사 기능
├── ConsultationSafetySection.tsx
├── CompanyInfoSection.tsx
└── ZeroCommissionUSPSection.tsx
    └── NoCommissionSection.tsx (중복)
```

### 4. 구버전 API 사용

#### 4.1 호환성 문제 없음
- React 19 최신 API 사용 중
- TypeScript 5.9.3 최신 문법 사용 중
- Tailwind CSS 4 최신 기능 사용 중

#### 4.2 잠재적 호환성 문제
| 항목 | 현재 상태 | 문제 |
|------|---------|------|
| wouter 라우팅 | 정상 | 패치 적용됨 (patches/wouter@3.7.1.patch) |
| Drizzle ORM | 0.44.5 | 최신 버전 사용 중, 호환성 문제 없음 |

### 5. 의존성 불일치

#### 5.1 패키지 매니저 설정
- pnpm 10.15.1 사용 중
- 패치된 의존성: wouter@3.7.1
- 오버라이드: tailwindcss>nanoid (3.3.7)

#### 5.2 잠재적 문제
| 문제 | 심각도 | 설명 |
|------|--------|------|
| add 패키지 | ⚠️ 낮음 | devDependency로 선언, 사용 목적 불명확 |
| tw-animate-css | ⚠️ 낮음 | tailwindcss-animate와 중복 가능성 |

### 6. 미사용 UI 컴포넌트 라이브러리 상세

```
선언된 Radix UI 컴포넌트 (총 20개):
✅ 사용 중: accordion, alert-dialog, avatar, button, card, checkbox, 
           collapsible, command, dialog, dropdown-menu, form, input, 
           label, popover, progress, radio-group, scroll-area, select, 
           separator, slider, switch, tabs, toggle, tooltip

❌ 미사용: context-menu, hover-card, menubar, navigation-menu
```

### 7. 환경 설정 파일 검토

#### 7.1 설정 파일 상태
| 파일 | 상태 | 비고 |
|------|------|------|
| vite.config.ts | ✅ 정상 | Vite 7 설정 |
| tsconfig.json | ✅ 정상 | TypeScript 5.9.3 |
| tailwind.config.ts | ✅ 정상 | Tailwind CSS 4 |
| postcss.config.ts | ✅ 정상 | 표준 설정 |
| drizzle.config.ts | ✅ 정상 | TiDB Cloud 설정 |

---

## 탐지 결과 요약

### 문제 카테고리별 개수
| 카테고리 | 개수 | 심각도 |
|---------|------|--------|
| 미사용 패키지 | 3 | 낮음 |
| 미사용 UI 라이브러리 | 4 | 낮음 |
| 데드 코드 (페이지) | 1 | 중간 |
| 데드 코드 (컴포넌트) | 1 | 낮음 |
| 중복 코드 | 2 | 중간 |
| 의존성 불일치 | 2 | 낮음 |
| **총계** | **13** | - |

### 우선순위
1. **높음**: 중복된 섹션 컴포넌트 통합 (NoCommissionSection ↔ ZeroCommissionUSPSection)
2. **중간**: 미사용 페이지 제거 (ComponentShowcase.tsx)
3. **중간**: 미사용 UI 라이브러리 제거 (4개)
4. **낮음**: 미사용 패키지 정리 (streamdown, next-themes, axios)

---

## 다음 단계: 수정 계획 제시

3단계에서 각 항목별 수정 방향을 제안할 예정입니다.
