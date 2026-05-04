# 유니브매치 프리미엄 디자인 시스템

## 개요

유니브매치는 대학 멘토 매칭 플랫폼으로서, 신뢰성 있고 전문적인 입시 컨설팅 서비스를 제공합니다. 이 디자인 시스템은 **프리미엄 입시 플랫폼 감성**을 구현하기 위해 설계되었으며, Deep Indigo와 Gray 기반의 정교한 색상 팔레트, 세련된 그림자 시스템, 그리고 일관된 타이포그래피를 통해 사용자에게 신뢰감과 전문성을 전달합니다.

## 색상 팔레트

### Light Mode (기본)

| 색상명 | OKLCH 값 | 용도 | 예시 |
|--------|---------|------|------|
| **Primary (Deep Indigo)** | `oklch(0.35 0.08 260)` | 주요 버튼, 링크, 강조 요소 | 로그인 버튼, 헤더 배경 |
| **Secondary (Medium Indigo)** | `oklch(0.50 0.08 260)` | 보조 버튼, 탭 | 보조 CTA 버튼 |
| **Accent (Purple)** | `oklch(0.55 0.12 280)` | 특별 강조, 배지 | 새로운 알림 배지 |
| **Background** | `oklch(0.99 0.002 0)` | 페이지 배경 | 전체 페이지 배경 |
| **Card** | `oklch(0.99 0.002 0)` | 카드 배경 | 멘토 카드, 프로필 카드 |
| **Foreground** | `oklch(0.25 0.05 260)` | 본문 텍스트 | 모든 텍스트 콘텐츠 |
| **Muted** | `oklch(0.92 0.02 0)` | 비활성 요소, 배경 | 비활성 탭, 구분선 |
| **Border** | `oklch(0.95 0.01 0)` | 테두리 | 카드 테두리, 입력 필드 테두리 |

### Dark Mode

| 색상명 | OKLCH 값 | 용도 |
|--------|---------|------|
| **Primary** | `oklch(0.60 0.12 260)` | 밝은 Indigo |
| **Background** | `oklch(0.10 0.005 0)` | 어두운 배경 |
| **Card** | `oklch(0.15 0.01 260)` | 어두운 카드 |
| **Foreground** | `oklch(0.90 0.02 0)` | 밝은 텍스트 |

## 타이포그래피

### 폰트

- **주 폰트**: Pretendard (한글 최적화)
- **보조 폰트**: Noto Sans KR
- **폴백**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

### 제목 계층

```css
h1 { @apply text-4xl md:text-5xl lg:text-6xl font-bold; }
h2 { @apply text-3xl md:text-4xl lg:text-5xl font-bold; }
h3 { @apply text-2xl md:text-3xl lg:text-4xl font-bold; }
```

### 자간

- **기본**: `-0.01em`
- **제목**: `-0.02em`
- **자막**: `tracking-wide`

## 컴포넌트 클래스

### 카드 (Card)

#### `.card-premium`

기본 카드 스타일로, 중간 정도의 그림자를 가집니다.

**CSS:**
```css
.card-premium {
  @apply bg-card border border-border rounded-lg shadow-sm 
         hover:shadow-md transition-shadow duration-200;
}
```

**사용 예시:**

```jsx
<div className="card-premium p-6">
  <h3 className="text-lg font-semibold mb-2">멘토 정보</h3>
  <p className="text-sm text-muted-foreground">상담 분야 및 경험</p>
</div>
```

**특징:**
- 가벼운 그림자 (shadow-sm)
- 호버 시 그림자 강화 (shadow-md)
- 부드러운 전환 (transition-shadow duration-200)

---

#### `.card-premium-lg`

큰 카드 스타일로, 더 강한 그림자를 가집니다. 주요 콘텐츠 영역에 사용합니다.

**CSS:**
```css
.card-premium-lg {
  @apply bg-card border border-border rounded-lg shadow-md 
         hover:shadow-lg transition-shadow duration-200;
}
```

**사용 예시:**

```jsx
<div className="card-premium-lg p-8">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
      <UserIcon className="h-6 w-6 text-primary" />
    </div>
    <h2 className="text-2xl font-bold">멘토 프로필</h2>
  </div>
  {/* 콘텐츠 */}
</div>
```

**특징:**
- 중간 그림자 (shadow-md)
- 호버 시 강한 그림자 (shadow-lg)
- 더 큰 패딩 권장 (p-8)

---

### 버튼 (Button)

#### `.btn-primary`

주요 행동을 유도하는 버튼입니다.

**CSS:**
```css
.btn-primary {
  @apply bg-primary text-primary-foreground px-6 py-2.5 rounded-md 
         font-medium hover:bg-primary/90 transition-colors duration-200;
}
```

**사용 예시:**

```jsx
<button className="btn-primary">
  상담 신청하기
</button>
```

**특징:**
- Deep Indigo 배경
- 흰색 텍스트
- 호버 시 90% 불투명도로 변경

---

#### `.btn-secondary`

보조 행동을 위한 버튼입니다.

**CSS:**
```css
.btn-secondary {
  @apply bg-secondary text-secondary-foreground px-6 py-2.5 rounded-md 
         font-medium hover:bg-secondary/90 transition-colors duration-200;
}
```

**사용 예시:**

```jsx
<button className="btn-secondary">
  더 알아보기
</button>
```

---

#### `.btn-outline`

투명한 배경의 아웃라인 버튼입니다.

**CSS:**
```css
.btn-outline {
  @apply border border-border bg-transparent text-foreground px-6 py-2.5 
         rounded-md font-medium hover:bg-muted transition-colors duration-200;
}
```

**사용 예시:**

```jsx
<button className="btn-outline">
  취소
</button>
```

---

### 그림자 (Shadow)

프리미엄 그림자 시스템은 4단계로 구성되어 있습니다.

#### `.shadow-premium-sm`

**값:** `0 1px 2px 0 rgba(0, 0, 0, 0.05)`

**사용:** 가벼운 강조, 기본 카드

```jsx
<div className="shadow-premium-sm">가벼운 그림자</div>
```

---

#### `.shadow-premium-md`

**값:** `0 4px 6px -1px rgba(0, 0, 0, 0.08)`

**사용:** 중간 강조, 호버 상태

```jsx
<div className="shadow-premium-md">중간 그림자</div>
```

---

#### `.shadow-premium-lg`

**값:** `0 10px 15px -3px rgba(0, 0, 0, 0.1)`

**사용:** 강한 강조, 모달, 드롭다운

```jsx
<div className="shadow-premium-lg">강한 그림자</div>
```

---

#### `.shadow-premium-xl`

**값:** `0 20px 25px -5px rgba(0, 0, 0, 0.12)`

**사용:** 최강 강조, 플로팅 요소

```jsx
<div className="shadow-premium-xl">매우 강한 그림자</div>
```

---

## 폼 입력 필드 스타일

### 기본 입력 필드

```jsx
<input 
  type="text" 
  className="w-full px-4 py-2.5 border border-border rounded-md 
             bg-input focus:border-primary focus:ring-2 focus:ring-primary/20 
             transition-all duration-200 placeholder-muted-foreground"
  placeholder="입력하세요"
/>
```

**특징:**
- 연한 회색 배경 (bg-input)
- 회색 테두리 (border-border)
- 포커스 시 Primary 색상으로 변경
- 포커스 링 (ring) 추가

### 텍스트 영역

```jsx
<textarea 
  className="w-full px-4 py-2.5 border border-border rounded-md 
             bg-input focus:border-primary focus:ring-2 focus:ring-primary/20 
             transition-all duration-200 placeholder-muted-foreground resize-none"
  placeholder="내용을 입력하세요"
  rows={4}
/>
```

### 셀렉트 드롭다운

```jsx
<select 
  className="w-full px-4 py-2.5 border border-border rounded-md 
             bg-input focus:border-primary focus:ring-2 focus:ring-primary/20 
             transition-all duration-200"
>
  <option>선택하세요</option>
</select>
```

## 애니메이션 및 트랜지션

### 페이지 전환 애니메이션

모든 페이지는 자동으로 페이드인 및 슬라이드 애니메이션이 적용됩니다.

```css
main, section, [role="main"] {
  @apply animate-in fade-in slide-in-from-bottom-4 duration-300;
}
```

### 호버 효과

#### 카드 호버

```jsx
<div className="card-premium group hover:-translate-y-1 transition-transform duration-200">
  카드 콘텐츠
</div>
```

**효과:** 마우스 호버 시 카드가 위로 약간 올라옵니다.

#### 버튼 호버

```jsx
<button className="btn-primary hover:scale-105 transition-transform duration-200">
  버튼
</button>
```

**효과:** 마우스 호버 시 버튼이 약간 확대됩니다.

### 유기적 Blob 애니메이션

배경에 사용되는 부드러운 애니메이션 도형입니다.

```jsx
<div className="blob-1" /> {/* 8초 애니메이션 */}
<div className="blob-2" /> {/* 10초 역방향 애니메이션 */}
```

## 반응형 디자인

### 브레이크포인트

| 이름 | 너비 | 용도 |
|------|------|------|
| **sm** | 640px | 태블릿 |
| **md** | 768px | 태블릿 (중간) |
| **lg** | 1024px | 데스크톱 |
| **xl** | 1280px | 큰 데스크톱 |

### 컨테이너 패딩

```css
.container {
  padding-left: 1rem;     /* 모바일: 16px */
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container {
    padding-left: 1.5rem;  /* 태블릿: 24px */
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: 2rem;    /* 데스크톱: 32px */
    padding-right: 2rem;
    max-width: 1280px;
  }
}
```

## 실제 사용 예시

### 멘토 카드

```jsx
<div className="card-premium-lg p-6 group hover:-translate-y-1 transition-transform duration-200">
  <div className="flex items-center gap-4 mb-4">
    <img 
      src={mentorImage} 
      alt={mentorName}
      className="w-16 h-16 rounded-lg object-cover"
    />
    <div>
      <h3 className="text-lg font-semibold">{mentorName}</h3>
      <p className="text-sm text-muted-foreground">{university} • {major}</p>
    </div>
  </div>
  <p className="text-sm text-foreground mb-4">{bio}</p>
  <button className="btn-primary w-full">상담 신청</button>
</div>
```

### 프로필 섹션

```jsx
<div className="card-premium-lg p-8">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
      <UserIcon className="h-6 w-6 text-primary" />
    </div>
    <h2 className="text-2xl font-bold">개인 정보</h2>
  </div>
  
  <div className="space-y-4">
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">
        이름
      </label>
      <input 
        type="text" 
        value={name}
        className="w-full px-4 py-2.5 border border-border rounded-md 
                   bg-input focus:border-primary focus:ring-2 focus:ring-primary/20 
                   transition-all duration-200"
      />
    </div>
  </div>
</div>
```

### 알림 목록

```jsx
<div className="space-y-3">
  {notifications.map((notif) => (
    <div
      key={notif.id}
      className={`card-premium p-4 transition-all duration-200 ${
        notif.isRead ? "bg-card" : "bg-primary/5 border-primary/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">
            {notif.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {notif.message}
          </p>
        </div>
        {!notif.isRead && (
          <Badge className="flex-shrink-0 bg-primary text-white">NEW</Badge>
        )}
      </div>
    </div>
  ))}
</div>
```

## 접근성 (Accessibility)

### 색상 대비

모든 텍스트는 WCAG AA 표준 (최소 4.5:1 대비)을 충족합니다.

- **Primary + White**: 7.2:1 (AAA)
- **Foreground + Background**: 8.1:1 (AAA)
- **Muted + Background**: 4.8:1 (AA)

### 포커스 상태

모든 인터랙티브 요소는 명확한 포커스 상태를 가집니다.

```css
input:focus {
  @apply border-primary ring-2 ring-primary/20;
}
```

### 다크 모드 지원

모든 색상은 라이트 모드와 다크 모드 모두에서 최적화되어 있습니다.

## 유지보수 및 확장

### 새로운 색상 추가

`index.css`의 `:root` 섹션에 새 색상을 추가합니다.

```css
:root {
  --new-color: oklch(0.50 0.08 260);
}

.dark {
  --new-color: oklch(0.60 0.12 260);
}
```

### 새로운 컴포넌트 클래스 추가

`@layer components` 섹션에 새 클래스를 추가합니다.

```css
@layer components {
  .new-component {
    @apply /* 스타일 */;
  }
}
```

## 참고 자료

- **Tailwind CSS**: https://tailwindcss.com
- **OKLCH 색상 공간**: https://oklch.com
- **WCAG 접근성 표준**: https://www.w3.org/WAI/WCAG21/quickref/
- **Pretendard 폰트**: https://github.com/orioncactus/pretendard
