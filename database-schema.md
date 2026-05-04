# 대학 멘토 매칭 플랫폼 - 데이터베이스 스키마

## 현재 스키마 다이어그램

```mermaid
erDiagram
    USERS ||--o{ MENTOR_PROFILES : has
    USERS ||--o{ BOOKINGS : makes
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ REVIEWS : writes
    MENTOR_PROFILES ||--o{ BOOKINGS : receives
    BOOKINGS ||--o{ REVIEWS : has
    BOOKINGS ||--o{ MESSAGES : references
    MENTOR_PROFILES ||--o{ MENTOR_VERIFICATIONS : has
    MENTOR_PROFILES ||--o{ GALLERY_IMAGES : has

    USERS {
        int id PK
        string openId UK
        string name
        string email
        string loginMethod
        enum role
        enum userType
        string stripeCustomerId
        timestamp createdAt
        timestamp updatedAt
        timestamp lastSignedIn
    }

    MENTOR_PROFILES {
        int id PK
        int userId FK
        string university
        string major
        enum field
        enum region
        enum grade
        text bio
        decimal hourlyRate
        text availableSlots
        boolean isActive
        enum verificationStatus
        decimal averageRating
        int reviewCount
        timestamp createdAt
        timestamp updatedAt
    }

    BOOKINGS {
        int id PK
        int studentId FK
        int mentorId FK
        timestamp scheduledAt
        decimal duration
        decimal totalAmount
        enum consultationType
        enum status
        string stripePaymentIntentId
        text studentMessage
        timestamp createdAt
        timestamp updatedAt
    }

    REVIEWS {
        int id PK
        int bookingId FK
        int studentId FK
        int mentorId FK
        int rating
        text comment
        timestamp createdAt
        timestamp updatedAt
    }

    NOTIFICATIONS {
        int id PK
        int userId FK
        enum type
        string title
        text message
        boolean isRead
        int relatedId
        timestamp createdAt
    }

    MESSAGES {
        int id PK
        int senderId FK
        int recipientId FK
        text content
        boolean isRead
        int bookingId FK
        timestamp createdAt
        timestamp updatedAt
    }

    MENTOR_VERIFICATIONS {
        int id PK
        int userId FK
        string studentIdImageUrl
        enum verificationStatus
        text rejectionReason
        timestamp createdAt
        timestamp updatedAt
    }

    GALLERY_IMAGES {
        int id PK
        int mentorId FK
        string imageUrl
        string imageKey
        timestamp createdAt
    }
```

## 현재 문제점

### 멘토 프로필 중복 문제

**상황:**
- `mentorProfiles` 테이블에 `userId`에 대한 UNIQUE 제약이 없음
- 같은 userId를 가진 여러 프로필이 동시에 존재 가능
- 프로필 삭제 후 재생성 시 혼동 발생

**예시:**
```
userId=1 (2003yunho)
├─ id=1 (한국대학교/학과공학과) - 삭제됨
└─ id=120001 (Test University/Computer Science) - 현재 사용
```

## 제안된 해결책

### 방법: `profileStatus` 필드 추가

`mentorProfiles` 테이블에 새로운 필드 추가:

```sql
ALTER TABLE mentor_profiles 
ADD COLUMN profileStatus ENUM('active', 'archived') DEFAULT 'active' NOT NULL;
```

**필드 설명:**
- `profileStatus = 'active'`: 현재 사용 중인 프로필 (최신 프로필)
- `profileStatus = 'archived'`: 삭제되거나 이전에 사용하던 프로필

**장점:**
1. 같은 userId에 여러 프로필 허용 가능
2. 삭제된 프로필과 현재 프로필 명확히 구분
3. 프로필 히스토리 추적 가능
4. 프로필 복구 기능 구현 가능

**쿼리 예시:**

```sql
-- 현재 활성 프로필만 조회
SELECT * FROM mentor_profiles 
WHERE userId = 1 AND profileStatus = 'active';

-- 사용자의 모든 프로필 히스토리 조회
SELECT * FROM mentor_profiles 
WHERE userId = 1 
ORDER BY createdAt DESC;
```

## 수정된 스키마 (제안)

```mermaid
erDiagram
    MENTOR_PROFILES {
        int id PK
        int userId FK
        string university
        string major
        enum field
        enum region
        enum grade
        text bio
        decimal hourlyRate
        text availableSlots
        boolean isActive
        enum verificationStatus
        enum profileStatus "NEW: active|archived"
        decimal averageRating
        int reviewCount
        timestamp createdAt
        timestamp updatedAt
    }
```

**profileStatus 값:**
- `'active'` (1): 현재 사용 중인 프로필
- `'archived'` (0): 삭제되거나 이전 프로필
