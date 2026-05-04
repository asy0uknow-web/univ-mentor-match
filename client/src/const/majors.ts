/**
 * 대학 계열 및 학과 데이터
 */

export interface Major {
  id: string;
  name: string;
}

export interface College {
  id: string;
  name: string;
  majors: Major[];
}

export const COLLEGES: College[] = [
  {
    id: "liberal_arts",
    name: "문과대학",
    majors: [
      { id: "korean_lang_lit", name: "국어국문학과" },
      { id: "philosophy", name: "철학과" },
      { id: "korean_history", name: "한국사학과" },
      { id: "history", name: "사학과" },
      { id: "sociology", name: "사회학과" },
      { id: "chinese_classics", name: "한문학과" },
      { id: "english_lit", name: "영어영문학과" },
      { id: "german_lit", name: "독어독문학과" },
      { id: "french_lit", name: "불어불문학과" },
      { id: "chinese_lit", name: "중어중문학과" },
      { id: "russian_lit", name: "노어노문학과" },
      { id: "japanese_lit", name: "일어일문학과" },
      { id: "spanish_lit", name: "서어서문학과" },
      { id: "linguistics", name: "언어학과" },
    ],
  },
  {
    id: "political_economics",
    name: "정경대학",
    majors: [
      { id: "political_science", name: "정치외교학과" },
      { id: "economics", name: "경제학과" },
      { id: "statistics", name: "통계학과" },
      { id: "public_admin", name: "행정학과" },
    ],
  },
  {
    id: "business",
    name: "경영대학",
    majors: [{ id: "business_admin", name: "경영학과" }],
  },
  {
    id: "science",
    name: "이과대학",
    majors: [
      { id: "mathematics", name: "수학과" },
      { id: "physics", name: "물리학과" },
      { id: "chemistry", name: "화학과" },
      { id: "earth_science", name: "지구환경과학과" },
    ],
  },
  {
    id: "engineering",
    name: "공과대학",
    majors: [
      { id: "chemical_eng", name: "화공생명공학과" },
      { id: "materials_eng", name: "신소재공학부" },
      { id: "civil_eng", name: "건축사회환경공학부" },
      { id: "architecture", name: "건축학과" },
      { id: "mechanical_eng", name: "기계공학부" },
      { id: "industrial_eng", name: "산업경영공학부" },
      { id: "electrical_eng", name: "전기전자공학부" },
      { id: "energy_eng", name: "융합에너지공학과" },
      { id: "semiconductor_eng", name: "반도체공학과" },
      { id: "communication_eng", name: "차세대통신학과" },
    ],
  },
  {
    id: "medicine",
    name: "의과대학",
    majors: [{ id: "medicine", name: "의학과" }],
  },
  {
    id: "education",
    name: "사범대학",
    majors: [
      { id: "education", name: "교육학과" },
      { id: "korean_education", name: "국어교육과" },
      { id: "english_education", name: "영어교육과" },
      { id: "geography_education", name: "지리교육과" },
      { id: "history_education", name: "역사교육과" },
      { id: "home_economics_education", name: "가정교육과" },
      { id: "math_education", name: "수학교육과" },
      { id: "physical_education", name: "체육교육과" },
    ],
  },
  {
    id: "nursing",
    name: "간호대학",
    majors: [{ id: "nursing", name: "간호학과" }],
  },
  {
    id: "information",
    name: "정보대학",
    majors: [
      { id: "computer_science", name: "컴퓨터학과" },
      { id: "data_science", name: "데이터과학과" },
      { id: "artificial_intelligence", name: "인공지능학과" },
    ],
  },
  {
    id: "design",
    name: "디자인조형학부",
    majors: [{ id: "design_shaping", name: "디자인조형학부" }],
  },
  {
    id: "international",
    name: "국제대학",
    majors: [
      { id: "international_studies", name: "국제학부" },
      { id: "global_korean_fusion", name: "글로벌한국융합학부" },
    ],
  },
  {
    id: "media",
    name: "미디어대학",
    majors: [{ id: "media_studies", name: "미디어학부" }],
  },
  {
    id: "health_science",
    name: "보건과학대학",
    majors: [
      { id: "biomedical_eng", name: "바이오의공학부" },
      { id: "biosystem_medicine", name: "바이오시스템의과학부" },
      { id: "health_environment", name: "보건환경융합과학부" },
      { id: "health_policy", name: "보건정책관리학부" },
    ],
  },
  {
    id: "free_major",
    name: "자유전공학부",
    majors: [{ id: "free_major", name: "자유전공학부" }],
  },
  {
    id: "smart_mobility",
    name: "스마트모빌리티학부",
    majors: [{ id: "smart_mobility", name: "스마트모빌리티학부" }],
  },
  {
    id: "smart_security",
    name: "스마트보안학부",
    majors: [{ id: "smart_security", name: "스마트보안학부" }],
  },
];

/**
 * 학과 ID로 학과 이름 조회
 */
export function getMajorName(majorId: string): string {
  for (const college of COLLEGES) {
    const major = college.majors.find((m) => m.id === majorId);
    if (major) {
      return major.name;
    }
  }
  return "";
}

/**
 * 학과 ID 배열로 학과 이름 배열 조회
 */
export function getMajorNames(majorIds: string[]): string[] {
  return majorIds.map((id) => getMajorName(id)).filter((name) => name !== "");
}
