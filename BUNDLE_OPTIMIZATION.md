# 번들 크기 최적화 가이드

## 현재 번들 상태 분석

### 주요 의존성 크기 (package.json 기준)

| 패키지 | 크기 | 용도 | 최적화 방안 |
|--------|------|------|-----------|
| react-window | ~2.2.7 | 가상 스크롤링 | 필요한 컴포넌트만 import |
| recharts | ~2.15.2 | 차트 렌더링 | 동적 import 적용 |
| framer-motion | ~12.23.22 | 애니메이션 | 필요한 기능만 사용 |
| @radix-ui/* | 다중 | UI 컴포넌트 | Tree-shaking 최적화 |
| date-fns | ~4.1.0 | 날짜 처리 | 필요한 함수만 import |

## 최적화 전략

### 1. 동적 임포트 (Code Splitting)
차트, 복잡한 모달 등 초기 로드에 필요하지 않은 컴포넌트는 동적 임포트로 분리합니다.

```typescript
// Before
import { BarChart } from 'recharts';

// After
const BarChart = lazy(() => import('recharts').then(m => ({ default: m.BarChart })));
```

### 2. Tree-shaking 최적화
불필요한 export는 제거하고, ESM 형식의 패키지를 우선 사용합니다.

```typescript
// Before - 전체 date-fns 번들 포함
import * as dateFns from 'date-fns';

// After - 필요한 함수만 import
import { format, isToday } from 'date-fns';
```

### 3. 이미지 최적화
- WebP 포맷 지원 추가
- 반응형 이미지 (srcset) 구현
- 이미지 압축 및 리사이징

### 4. CSS 최적화
- Tailwind CSS purge 설정 확인
- 사용하지 않는 CSS 제거
- Critical CSS 추출

## 구현 체크리스트

- [ ] 번들 분석 도구 설치 및 실행 (rollup-plugin-visualizer)
- [ ] 동적 임포트 적용 (차트, 모달 등)
- [ ] Tree-shaking 최적화 (date-fns, lucide-react 등)
- [ ] 이미지 최적화 (WebP, srcset)
- [ ] CSS 최적화 (Tailwind purge)
- [ ] 번들 크기 비교 (최적화 전후)

## 성능 측정 지표

| 지표 | 목표 | 현재 | 최적화 후 |
|------|------|------|----------|
| Initial Bundle Size | < 300KB | TBD | TBD |
| Largest Contentful Paint | < 2.5s | TBD | TBD |
| First Input Delay | < 100ms | TBD | TBD |
| Cumulative Layout Shift | < 0.1 | TBD | TBD |

## 참고 자료

- [Vite Bundle Analysis](https://vitejs.dev/guide/build.html#analyzing-the-bundle)
- [Webpack Bundle Analyzer](https://github.com/webpack-bundle-analyzer/webpack-bundle-analyzer)
- [Web Vitals](https://web.dev/vitals/)
