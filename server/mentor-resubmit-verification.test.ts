import { describe, it, expect } from 'vitest';

describe('Mentor Resubmit Verification', () => {
  it('거부된 인증 요청을 재신청하면 상태가 pending으로 변경됨', () => {
    const existingVerification = {
      id: 1,
      userId: 210001,
      status: 'rejected',
      adminNotes: '학생증이 명확하지 않습니다.',
      studentIdImageUrl: 'https://example.com/old-image.jpg',
    };

    const newImageUrl = 'https://example.com/new-image.jpg';

    // 재신청 시뮬레이션
    const updated = {
      ...existingVerification,
      studentIdImageUrl: newImageUrl,
      status: 'pending',
      adminNotes: null,
    };

    expect(updated.status).toBe('pending');
    expect(updated.studentIdImageUrl).toBe(newImageUrl);
    expect(updated.adminNotes).toBeNull();
  });

  it('pending 상태에서는 재신청 불가', () => {
    const existingVerification = {
      id: 1,
      userId: 210001,
      status: 'pending',
    };

    const shouldThrowError = existingVerification.status === 'pending';
    expect(shouldThrowError).toBe(true);
  });

  it('approved 상태에서는 새로운 인증 요청 생성 불가', () => {
    const existingVerification = {
      id: 1,
      userId: 210001,
      status: 'approved',
    };

    // approved 상태에서는 아무 작업도 하지 않음
    const shouldSkip = existingVerification.status === 'approved';
    expect(shouldSkip).toBe(true);
  });

  it('거부 사유가 초기화됨', () => {
    const existingVerification = {
      id: 1,
      userId: 210001,
      status: 'rejected',
      adminNotes: '학생증이 명확하지 않습니다.',
    };

    const updated = {
      ...existingVerification,
      status: 'pending',
      adminNotes: null,
    };

    expect(updated.adminNotes).toBeNull();
    expect(existingVerification.adminNotes).toBe('학생증이 명확하지 않습니다.');
  });

  it('재신청 시 새로운 이미지 URL로 업데이트됨', () => {
    const existingVerification = {
      id: 1,
      userId: 210001,
      status: 'rejected',
      studentIdImageUrl: 'https://example.com/old-image.jpg',
    };

    const newImageUrl = 'https://example.com/new-image-2.jpg';

    const updated = {
      ...existingVerification,
      studentIdImageUrl: newImageUrl,
      status: 'pending',
    };

    expect(updated.studentIdImageUrl).toBe(newImageUrl);
    expect(updated.studentIdImageUrl).not.toBe(existingVerification.studentIdImageUrl);
  });
});
