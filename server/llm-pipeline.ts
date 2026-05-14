import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 멘토 프로필 텍스트에서 특성을 추출하는 LLM 파이프라인
 * GPT-4o-mini를 사용하여 자동으로 정형 데이터 추출
 */

export interface MentorFeatureExtractionResult {
  admissionTypes: string[]; // 입시 전형
  highSchoolTypes: string[]; // 출신 고교 유형
  strengths: string[]; // 상담 강점
  targetStudents: string[]; // 추천 대상 학생
  experiences: string[]; // 주요 경험
  majorDescription: string; // 전공 설명
  admissionAchievements: string; // 입시 성과
  confidenceScore: number; // AI 신뢰도 (0-100)
}

/**
 * 멘토 프로필 정보로부터 특성을 추출합니다
 * @param mentorBio 멘토의 자기소개 텍스트
 * @param university 대학명
 * @param major 전공명
 * @param grade 학년
 * @returns 추출된 특성 데이터
 */
export async function extractMentorFeatures(
  mentorBio: string,
  university: string,
  major: string,
  grade: string
): Promise<MentorFeatureExtractionResult> {
  const prompt = `
당신은 대학 멘토 매칭 플랫폼의 AI 분석가입니다. 다음 멘토의 프로필 정보를 분석하고 구조화된 데이터를 추출해주세요.

멘토 정보:
- 대학: ${university}
- 전공: ${major}
- 학년: ${grade}
- 자기소개: ${mentorBio}

다음 항목들을 JSON 형식으로 추출해주세요:

1. admissionTypes: 멘토가 경험한 입시 전형 (예: ["학생부종합", "일반전형", "수시", "정시"])
2. highSchoolTypes: 멘토의 출신 고교 유형 (예: ["일반고", "자사고"])
3. strengths: 멘토의 상담 강점 (예: ["생기부 컨설팅", "수학 성적 향상", "멘탈 관리"])
4. targetStudents: 추천 대상 학생 (예: ["수시 준비생", "성적 향상 필요"])
5. experiences: 주요 경험 (예: ["학원 강사 경험", "개인 과외 경험"])
6. majorDescription: 전공에 대한 상세 설명 (한 문장)
7. admissionAchievements: 입시 성과 (예: "고대 컴공 수시 합격")
8. confidenceScore: AI 신뢰도 점수 (0-100, 정보가 명확할수록 높음)

응답은 다음 JSON 형식으로 해주세요:
{
  "admissionTypes": [],
  "highSchoolTypes": [],
  "strengths": [],
  "targetStudents": [],
  "experiences": [],
  "majorDescription": "",
  "admissionAchievements": "",
  "confidenceScore": 0
}

정보가 명확하지 않은 경우 빈 배열이나 빈 문자열을 사용하세요.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // 낮은 온도로 일관된 결과 생성
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // JSON 추출 (마크다운 코드 블록 처리)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]) as MentorFeatureExtractionResult;
    return result;
  } catch (error) {
    console.error("Error extracting mentor features:", error);
    // 에러 발생 시 기본값 반환
    return {
      admissionTypes: [],
      highSchoolTypes: [],
      strengths: [],
      targetStudents: [],
      experiences: [],
      majorDescription: "",
      admissionAchievements: "",
      confidenceScore: 0,
    };
  }
}

/**
 * 멘토 정보로부터 검색용 코퍼스 텍스트를 생성합니다
 * @param mentorBio 멘토의 자기소개
 * @param university 대학명
 * @param major 전공명
 * @param features 추출된 특성
 * @returns 검색용 코퍼스 텍스트
 */
export function generateSearchCorpus(
  mentorBio: string,
  university: string,
  major: string,
  features: MentorFeatureExtractionResult
): string {
  const parts = [
    // 기본 정보
    `${university} ${major}`,
    mentorBio,
    
    // 추출된 특성
    features.admissionTypes.join(" "),
    features.highSchoolTypes.join(" "),
    features.strengths.join(" "),
    features.targetStudents.join(" "),
    features.experiences.join(" "),
    features.majorDescription,
    features.admissionAchievements,
  ];

  // 빈 문자열 제거 후 합치기
  return parts
    .filter((part) => part && part.trim().length > 0)
    .join(" ");
}

/**
 * 사용자 검색 쿼리를 정규화합니다
 * @param query 사용자 검색 쿼리
 * @returns 정규화된 쿼리
 */
export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " "); // 연속된 공백 제거
}

/**
 * 검색 쿼리의 해시값을 생성합니다 (캐싱용)
 * @param query 검색 쿼리
 * @returns 해시값
 */
export function hashSearchQuery(query: string): string {
  const normalized = normalizeSearchQuery(query);
  // 간단한 해시 함수 (실제로는 crypto.createHash 사용 권장)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32-bit 정수로 변환
  }
  return Math.abs(hash).toString(16);
}
