# 동적 임포트 최적화 예제

## 개요
동적 임포트를 사용하면 초기 번들 크기를 줄이고, 필요한 시점에만 코드를 로드할 수 있습니다.

## 1. 차트 컴포넌트 동적 임포트

### Before (초기 로드 시 recharts 전체 번들 포함)
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function ConsultationStats() {
  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="consultations" fill="#8884d8" />
    </BarChart>
  );
}
```

### After (필요할 때만 로드)
```typescript
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ConsultationStatsChart = lazy(() =>
  import('./ConsultationStatsChart').then(m => ({ default: m.ConsultationStatsChart }))
);

export function ConsultationStats() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-80" />}>
      <ConsultationStatsChart />
    </Suspense>
  );
}
```

## 2. 모달 컴포넌트 동적 임포트

### Before
```typescript
import { BookingModal } from '@/components/BookingModal';

export function MentorDetail() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>예약하기</button>
      <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

### After
```typescript
import { lazy, Suspense, useState } from 'react';

const BookingModal = lazy(() => import('@/components/BookingModal'));

export function MentorDetail() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>예약하기</button>
      {isOpen && (
        <Suspense fallback={null}>
          <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
```

## 3. 라우트 기반 코드 분할

### Before (모든 페이지가 초기 번들에 포함)
```typescript
import Home from './pages/Home';
import Mentors from './pages/Mentors';
import MentorDetail from './pages/MentorDetail';
import Messages from './pages/Messages';

const routes = [
  { path: '/', component: Home },
  { path: '/mentors', component: Mentors },
  { path: '/mentor/:id', component: MentorDetail },
  { path: '/messages', component: Messages },
];
```

### After (필요한 페이지만 로드)
```typescript
import { lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Mentors = lazy(() => import('./pages/Mentors'));
const MentorDetail = lazy(() => import('./pages/MentorDetail'));
const Messages = lazy(() => import('./pages/Messages'));

const routes = [
  { path: '/', component: Home },
  { path: '/mentors', component: Mentors },
  { path: '/mentor/:id', component: MentorDetail },
  { path: '/messages', component: Messages },
];
```

## 4. 조건부 임포트

### Before
```typescript
import { VerifyMentorForm } from '@/components/VerifyMentorForm';
import { StudentProfileForm } from '@/components/StudentProfileForm';

export function ProfileSetup({ userType }: { userType: 'mentor' | 'student' }) {
  return userType === 'mentor' ? <VerifyMentorForm /> : <StudentProfileForm />;
}
```

### After
```typescript
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const VerifyMentorForm = lazy(() => import('@/components/VerifyMentorForm'));
const StudentProfileForm = lazy(() => import('@/components/StudentProfileForm'));

export function ProfileSetup({ userType }: { userType: 'mentor' | 'student' }) {
  const Form = userType === 'mentor' ? VerifyMentorForm : StudentProfileForm;
  
  return (
    <Suspense fallback={<Skeleton className="w-full h-96" />}>
      <Form />
    </Suspense>
  );
}
```

## 5. 유틸리티 함수 동적 임포트

### Before (모든 유틸리티가 초기 로드)
```typescript
import { 
  calculateConsultationDuration, 
  formatDate, 
  validateEmail,
  generateReport,
  exportToCSV 
} from '@/utils';
```

### After (필요할 때만 로드)
```typescript
// 자주 사용하는 함수는 정적 임포트
import { formatDate, validateEmail } from '@/utils';

// 가끔 사용하는 함수는 동적 임포트
export async function generateReport(data: any) {
  const { generateReport } = await import('@/utils');
  return generateReport(data);
}

export async function exportToCSV(data: any) {
  const { exportToCSV } = await import('@/utils');
  return exportToCSV(data);
}
```

## 성능 개선 예상치

| 최적화 | 예상 개선 |
|--------|---------|
| 차트 동적 임포트 | -15-20% |
| 모달 동적 임포트 | -5-10% |
| 라우트 기반 분할 | -30-40% |
| 유틸리티 동적 임포트 | -5-15% |

## 주의사항

1. **Suspense 폴백 제공**: 동적 임포트 중에 표시할 로딩 UI 제공
2. **에러 처리**: 임포트 실패 시 에러 바운더리 사용
3. **번들 크기 모니터링**: 과도한 분할은 오버헤드 증가
4. **사용자 경험**: 로딩 시간이 너무 길면 UX 저하

## 구현 체크리스트

- [ ] 차트 컴포넌트 동적 임포트 적용
- [ ] 모달 컴포넌트 동적 임포트 적용
- [ ] 라우트 기반 코드 분할 적용
- [ ] 에러 바운더리 추가
- [ ] 로딩 상태 UI 개선
- [ ] 번들 크기 측정 및 비교
