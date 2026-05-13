import { mysqlTable, int, varchar, text, timestamp, decimal, mysqlEnum, json } from "drizzle-orm/mysql-core";

/**
 * Mentor Features - AI가 추출한 멘토의 특성 데이터
 * LLM 파이프라인에서 자동으로 생성되는 정형 데이터
 */
export const mentorFeatures = mysqlTable("mentor_features", {
  id: int("id").autoincrement().primaryKey(),
  mentorId: int("mentorId").notNull().unique(), // References mentorProfiles.id
  
  // 입시 전형: ["학생부종합", "일반전형", "수시", "정시", "특기자전형"]
  admissionTypes: text("admissionTypes"), // JSON array
  
  // 출신 고교 유형: ["일반고", "지방 평준화", "자사고", "영재고", "특목고"]
  highSchoolTypes: text("highSchoolTypes"), // JSON array
  
  // 상담 강점: ["멘탈 관리", "생기부 컨설팅", "수학 성적 향상", "영어 성적 향상", "과학 성적 향상", "진로 상담", "대학 선택"]
  strengths: text("strengths"), // JSON array
  
  // 추천 대상 학생: ["수시 준비생", "정시 준비생", "성적 향상 필요", "멘탈 관리 필요", "진로 미정"]
  targetStudents: text("targetStudents"), // JSON array
  
  // 주요 경험: ["입시 컨설턴트 경험", "학원 강사 경험", "개인 과외 경험", "학생부 작성 지도"]
  experiences: text("experiences"), // JSON array
  
  // 전공 관련 정보
  majorDescription: text("majorDescription"), // 전공에 대한 상세 설명
  
  // 입시 성과 (선택사항)
  admissionAchievements: text("admissionAchievements"), // 예: "고대 컴공 수시 합격", "서울대 경제학부 정시 합격"
  
  // AI 신뢰도 점수 (0-100)
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }).default("0.00"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentorFeatures = typeof mentorFeatures.$inferSelect;
export type InsertMentorFeatures = typeof mentorFeatures.$inferInsert;

/**
 * Mentor Search Corpus - 검색 최적화를 위한 코퍼스 텍스트
 * 멘토의 프로필 정보와 추출된 특성을 합친 검색용 텍스트
 * 사용자 화면에는 보이지 않음
 */
export const mentorSearchCorpus = mysqlTable("mentor_search_corpus", {
  id: int("id").autoincrement().primaryKey(),
  mentorId: int("mentorId").notNull().unique(), // References mentorProfiles.id
  
  // 검색용 코퍼스 텍스트 (멘토 정보 + 추출된 특성을 합친 긴 텍스트)
  corpusText: text("corpusText").notNull(),
  
  // 마지막 업데이트 시간
  lastProcessedAt: timestamp("lastProcessedAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentorSearchCorpus = typeof mentorSearchCorpus.$inferSelect;
export type InsertMentorSearchCorpus = typeof mentorSearchCorpus.$inferInsert;

/**
 * Mentor Embeddings - 멘토 프로필의 벡터 임베딩
 * text-embedding-3-small 모델로 생성된 벡터 데이터
 */
export const mentorEmbeddings = mysqlTable("mentor_embeddings", {
  id: int("id").autoincrement().primaryKey(),
  mentorId: int("mentorId").notNull().unique(), // References mentorProfiles.id
  
  // 벡터 DB에 저장된 벡터 ID (Pinecone/ChromaDB)
  vectorDbId: varchar("vectorDbId", { length: 255 }).notNull().unique(),
  
  // 벡터 차원 (text-embedding-3-small = 1536)
  dimension: int("dimension").default(1536).notNull(),
  
  // 벡터 생성 모델
  model: varchar("model", { length: 100 }).default("text-embedding-3-small").notNull(),
  
  // 마지막 업데이트 시간
  lastEmbeddedAt: timestamp("lastEmbeddedAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentorEmbeddings = typeof mentorEmbeddings.$inferSelect;
export type InsertMentorEmbeddings = typeof mentorEmbeddings.$inferInsert;

/**
 * Search Queries - 사용자 검색 쿼리 로그
 * 검색 성능 분석 및 개선을 위한 로그
 */
export const searchQueries = mysqlTable("search_queries", {
  id: int("id").autoincrement().primaryKey(),
  
  // 검색을 수행한 사용자 ID
  userId: int("userId"),
  
  // 검색 쿼리 텍스트
  queryText: varchar("queryText", { length: 500 }).notNull(),
  
  // 검색 결과 수
  resultCount: int("resultCount").default(0).notNull(),
  
  // 사용자가 클릭한 멘토 ID (클릭 로그)
  clickedMentorId: int("clickedMentorId"),
  
  // 검색 응답 시간 (ms)
  responseTime: int("responseTime").default(0).notNull(),
  
  // 사용자 피드백 (helpful, not_helpful, etc.)
  feedback: mysqlEnum("feedback", ["helpful", "not_helpful", "neutral"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SearchQuery = typeof searchQueries.$inferSelect;
export type InsertSearchQuery = typeof searchQueries.$inferInsert;

/**
 * Search Results Cache - 검색 결과 캐싱
 * 자주 검색되는 쿼리의 결과를 캐시하여 성능 개선
 */
export const searchResultsCache = mysqlTable("search_results_cache", {
  id: int("id").autoincrement().primaryKey(),
  
  // 검색 쿼리의 해시값 (캐시 키)
  queryHash: varchar("queryHash", { length: 64 }).notNull().unique(),
  
  // 원본 검색 쿼리
  queryText: varchar("queryText", { length: 500 }).notNull(),
  
  // 캐시된 검색 결과 (멘토 ID 배열)
  cachedResults: text("cachedResults").notNull(), // JSON array of mentor IDs
  
  // 캐시 유효 시간 (초)
  ttlSeconds: int("ttlSeconds").default(3600).notNull(),
  
  // 캐시 히트 횟수
  hitCount: int("hitCount").default(0).notNull(),
  
  // 캐시 만료 시간
  expiresAt: timestamp("expiresAt").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SearchResultsCache = typeof searchResultsCache.$inferSelect;
export type InsertSearchResultsCache = typeof searchResultsCache.$inferInsert;
