/**
 * Stripe product definitions for consultation services
 * Note: This platform uses dynamic pricing based on mentor's hourly rate
 * Actual payment amounts are calculated at booking time
 */

export const CONSULTATION_PRODUCT = {
  name: "멘토링 상담",
  description: "대학생 멘토와의 1:1 상담 서비스",
} as const;

/**
 * Minimum booking duration in hours
 */
export const MIN_BOOKING_DURATION = 1;

/**
 * Maximum booking duration in hours
 */
export const MAX_BOOKING_DURATION = 3;
