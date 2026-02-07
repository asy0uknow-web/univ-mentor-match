/**
 * SEO 메타 태그 설정 유틸리티
 * 페이지별 동적 메타 태그 설정 (카톡, 페이스북 등 소셜 공유 최적화)
 */

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  ogUrl?: string;
  keywords?: string;
}

const DEFAULT_OG_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png";
const BASE_URL = "https://univmatch-gy6raywm.manus.space";

/**
 * 페이지 메타 태그 설정
 * @param meta - 페이지 메타 정보
 */
export function setPageMeta(meta: PageMeta) {
  const {
    title,
    description,
    ogImage = DEFAULT_OG_IMAGE,
    ogUrl = BASE_URL,
    keywords,
  } = meta;

  // 페이지 제목
  document.title = `${title} | 유니브매치`;

  // Meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  }

  // Meta keywords
  if (keywords) {
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", keywords);
    }
  }

  // OG 태그 (카톡, 페이스북 공유)
  setOGTag("og:title", `${title} | 유니브매치`);
  setOGTag("og:description", description);
  setOGTag("og:url", ogUrl);
  setOGTag("og:image", ogImage);
  setOGTag("og:image:width", "1200");
  setOGTag("og:image:height", "630");
  setOGTag("og:type", "website");
  setOGTag("og:site_name", "유니브매치");

  // Twitter Card
  setMetaTag("twitter:title", `${title} | 유니브매치`);
  setMetaTag("twitter:description", description);
  setMetaTag("twitter:image", ogImage);
  setMetaTag("twitter:card", "summary_large_image");

  // Canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute("href", ogUrl);
  }
}

/**
 * OG 태그 설정
 */
function setOGTag(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

/**
 * Meta 태그 설정
 */
function setMetaTag(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

/**
 * 페이지별 기본 메타 정보
 */
export const PAGE_META: Record<string, any> = {
  home: {
    title: "전공 선택 전에, 이야기부터 들어보기",
    description: "실제 재학생 멘토와 1:1 상담으로 대학, 학과, 대학생활을 준비하세요. 전공 미스매치 없이 올바른 선택을 하세요.",
    keywords: "유니브매치, 멘토, 전공 선택, 학과 선택, 대학 상담, 입시 상담, 대학생활",
  },
  mentors: {
    title: "멘토 찾기",
    description: "원하는 대학, 전공, 학년으로 멘토를 검색하고 상담을 예약하세요. 실제 재학생 멘토와의 1:1 상담으로 올바른 선택을 하세요.",
    keywords: "멘토 검색, 멘토 찾기, 대학별 멘토, 전공별 멘토, 지역별 멘토",
  },
  mentorDetail: (mentorName: string, major: string | null): PageMeta => ({
    title: `${mentorName} 멘토 프로필`,
    description: `${mentorName} 멘토와 1:1 상담으로 ${major || "멘토"}에 대해 알아보세요. 실제 재학생의 경험과 조언을 받을 수 있습니다.`,
    keywords: `${mentorName}, ${major || "멘토"}, 멘토, 상담, 대학생활`,
  }),
  bookings: {
    title: "상담 문의",
    description: "예약한 상담 내역을 확인하고 관리하세요. 멘토와의 상담 시간, 상담 내용, 상담 상태를 확인할 수 있습니다.",
    keywords: "상담 예약, 상담 내역, 예약 관리, 멘토 상담",
  },
  messages: {
    title: "메시지",
    description: "멘토와의 메시지 대화를 통해 상담 내용을 나누세요. 실시간 메시지로 빠른 응답을 받을 수 있습니다.",
    keywords: "메시지, 대화, 멘토 상담, 메시지 알림",
  },
  notifications: {
    title: "알림",
    description: "상담 예약 확정, 메시지, 리뷰 등 모든 알림을 실시간으로 확인하세요.",
    keywords: "알림, 예약 확정, 메시지 알림, 리뷰 알림",
  },
  profile: {
    title: "내 프로필",
    description: "내 프로필을 관리하고 멘토로 등록하세요. 대학, 전공, 상담 경력 등을 등록하면 더 많은 학생들이 나를 찾을 수 있습니다.",
    keywords: "프로필, 멘토 등록, 프로필 관리, 멘토 정보",
  },
  adminBugReports: {
    title: "버그 리포트",
    description: "유니브매치 사용 중 발생한 문제를 리포트하세요. 더 나은 서비스를 만들기 위해 중요한 의견입니다.",
    keywords: "버그 리포트, 문제 신고, 서비스 개선",
  },
};
