import MentorProfile from "./MentorProfile";
import StudentProfile from "./StudentProfile";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { setPageMeta, PAGE_META } from "@/lib/seo";

/**
 * 사용자의 역할(멘토/멘티)에 따라 다른 프로필 페이지를 보여주는 래퍼 컴포넌트
 */
export default function MyProfile() {
  useEffect(() => {
    setPageMeta(PAGE_META.profile);
  }, []);

  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; // MentorProfile 또는 StudentProfile에서 처리됨
  }

  // 멘티 (고등학생)
  if (user?.userType === "high_school_student") {
    return <StudentProfile />;
  }

  // 멘토 (대학생)
  return <MentorProfile />;

}
