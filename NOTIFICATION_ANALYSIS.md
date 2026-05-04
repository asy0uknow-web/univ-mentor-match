# 예약 신청 시 멘토 알림 시스템 분석

## 현재 상태: ❌ 알림이 **전송되지 않음**

예약 신청이 들어올 때 멘토에게 알림이 가는지 검사한 결과, **현재 알림 시스템이 작동하지 않고 있습니다.**

---

## 문제점 분석

### 1. 예약 생성 시 알림 미생성
**위치**: `server/routers.ts` - `booking.create` 라우터 (154~204줄)

```typescript
// 현재 코드: 예약만 생성하고 알림은 생성하지 않음
const result = await createBooking({
  studentId: ctx.user.id,
  mentorId: input.mentorId,
  scheduledAt: new Date(input.scheduledAt),
  duration: input.duration,
  totalAmount,
  consultationType: input.consultationType,
  studentMessage: input.studentMessage,
});

// ❌ 여기서 알림 생성 코드가 없음!
```

### 2. 알림 시스템은 존재하지만 사용되지 않음
- **알림 생성 함수**: `createNotification()` (db.ts 342줄)
- **알림 조회 함수**: `getNotificationsByUser()` (db.ts 350줄)
- **알림 읽음 표시**: `markNotificationAsRead()` (db.ts 363줄)
- **미읽음 개수 조회**: `getUnreadNotificationCount()` (db.ts 370줄)

이 함수들은 모두 준비되어 있지만, **예약 생성 시 호출되지 않고 있습니다.**

---

## 알림 시스템 작동 원리 (예상 흐름)

### 현재 구조 (알림 없음)
```
학생이 예약 신청
    ↓
booking 테이블에 저장
    ↓
(끝)
```

### 개선된 구조 (알림 있음)
```
학생이 예약 신청
    ↓
booking 테이블에 저장
    ↓
notification 테이블에 알림 생성 ← 여기가 빠져있음!
    ↓
멘토가 로그인할 때 알림 조회
    ↓
멘토가 알림 확인
```

---

## 데이터베이스 구조

### notifications 테이블 스키마
```
- id: 알림 고유 ID
- userId: 알림을 받을 사용자 ID (멘토)
- type: 알림 종류 (예: "booking_request")
- title: 알림 제목
- message: 알림 내용
- relatedId: 관련 예약 ID (bookingId)
- isRead: 읽음 여부 (기본값: false)
- createdAt: 생성 시간
```

---

## 해결 방법

예약 생성 시 다음과 같이 알림을 생성해야 합니다:

```typescript
// booking.create 라우터에 추가할 코드
const result = await createBooking({
  // ... 기존 코드
});

const bookingId = Number((result as any).insertId);

// ✅ 멘토에게 알림 생성
await createNotification({
  userId: input.mentorId,  // 멘토 ID
  type: "booking_request",
  title: "새로운 상담 예약 신청",
  message: `${mentor.name || "학생"}님이 상담을 신청했습니다.`,
  relatedId: bookingId,
  isRead: false,
});

return { 
  success: true,
  bookingId,
  // ...
};
```

---

## 요약

| 항목 | 현재 상태 |
|------|---------|
| 알림 생성 함수 | ✅ 존재 |
| 알림 저장소 (DB) | ✅ 존재 |
| 알림 조회 기능 | ✅ 존재 |
| 예약 시 알림 발송 | ❌ **미구현** |
| 멘토 알림 수신 | ❌ **작동 안 함** |

**결론**: 알림 시스템의 기반은 모두 준비되어 있지만, 예약 생성 시 실제로 알림을 생성하는 코드가 누락되어 있습니다. 이 부분만 추가하면 멘토가 예약 신청 시 즉시 알림을 받을 수 있습니다.
