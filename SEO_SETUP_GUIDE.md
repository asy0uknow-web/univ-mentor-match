# 검색 엔진 최적화 (SEO) 설정 가이드

## 개요
이 문서는 대학 멘토 매칭 플랫폼을 Google과 Naver 검색 엔진에 등록하고 최적화하는 방법을 설명합니다.

## 1. 사이트맵 및 robots.txt

### 사이트맵 (sitemap.xml)
- **위치**: `/client/public/sitemap.xml`
- **역할**: 검색 엔진 크롤러가 모든 페이지를 쉽게 발견하도록 도움
- **접근 URL**: `https://univmatch-gy6raywm.manus.space/sitemap.xml`

### robots.txt
- **위치**: `/client/public/robots.txt`
- **역할**: 검색 엔진 크롤러의 접근을 제어
- **접근 URL**: `https://univmatch-gy6raywm.manus.space/robots.txt`

## 2. Google Search Console 등록

### 단계별 가이드

1. **Google Search Console 접속**
   - URL: https://search.google.com/search-console/about
   - Google 계정으로 로그인

2. **속성 추가**
   - "속성 추가" 클릭
   - URL 접두사 선택: `https://univmatch-gy6raywm.manus.space`
   - "계속" 클릭

3. **소유권 확인**
   - HTML 파일 다운로드 방법 선택
   - 다운로드한 파일을 `/client/public/` 디렉토리에 저장
   - "확인" 클릭

4. **사이트맵 제출**
   - 좌측 메뉴에서 "Sitemaps" 선택
   - 사이트맵 URL 입력: `https://univmatch-gy6raywm.manus.space/sitemap.xml`
   - "제출" 클릭

5. **검색 성능 모니터링**
   - "성능" 탭에서 검색 트래픽 확인
   - 검색 쿼리, 클릭 수, 노출 수 등 추적

### 주요 검색어 최적화
다음 검색어들이 노출되도록 콘텐츠 최적화:
- "대학 멘토"
- "멘토링 플랫폼"
- "입시 상담"
- "대학 상담"
- "고등학생 멘토"
- "학과 선택 상담"

## 3. Naver Webmaster Tools 등록

### 단계별 가이드

1. **Naver Webmaster Tools 접속**
   - URL: https://webmaster.naver.com/
   - Naver 계정으로 로그인

2. **사이트 등록**
   - "사이트 등록" 클릭
   - 사이트 URL 입력: `https://univmatch-gy6raywm.manus.space`
   - "등록" 클릭

3. **소유권 확인**
   - HTML 파일 또는 메타 태그 방법 선택
   - HTML 파일 방법: 파일을 `/client/public/` 디렉토리에 저장
   - "확인" 클릭

4. **사이트맵 제출**
   - 좌측 메뉴에서 "사이트맵" 선택
   - 사이트맵 URL 입력: `https://univmatch-gy6raywm.manus.space/sitemap.xml`
   - "제출" 클릭

5. **RSS 피드 제출** (선택사항)
   - 블로그나 뉴스 피드가 있으면 제출

### Naver 검색 최적화
- 메타 태그 최적화 (이미 적용됨)
- 정기적인 콘텐츠 업데이트
- 내부 링크 구조 최적화

## 4. 메타 태그 최적화

### 현재 적용된 메타 태그

```html
<title>대학 멘토 매칭 - 고등학생을 위한 대학생 1:1 상담 플랫폼</title>
<meta name="description" content="고등학생이 대학생 멘토와 1:1 상담으로 대학 입시, 학과 선택, 대학생활을 준비하세요." />
<meta name="keywords" content="대학 멘토, 멘토링, 대학 상담, 입시 상담, 학과 선택, 대학생활, 고등학생, 멘토 매칭" />
<meta name="author" content="대학 멘토 매칭" />
<meta property="og:title" content="대학 멘토 매칭 - 고등학생을 위한 대학생 1:1 상담 플랫폼" />
<meta property="og:description" content="고등학생이 대학생 멘토와 1:1 상담으로 대학 입시, 학과 선택, 대학생활을 준비하세요." />
<meta property="og:type" content="website" />
```

## 5. 구조화된 데이터 (Schema.org)

### 현재 적용된 스키마
- WebApplication 스키마
- 교육 애플리케이션 카테고리
- 조직 정보

## 6. 검색 최적화 체크리스트

- [x] 사이트맵 생성 및 배포
- [x] robots.txt 생성 및 배포
- [x] 메타 태그 최적화
- [x] Open Graph 메타 태그 추가
- [x] 구조화된 데이터 추가
- [ ] Google Search Console 등록 및 사이트맵 제출
- [ ] Naver Webmaster Tools 등록 및 사이트맵 제출
- [ ] 검색 성능 모니터링
- [ ] 정기적인 콘텐츠 업데이트

## 7. 예상 검색 결과 노출 시간

- **Google**: 등록 후 1-4주 내 검색 결과 노출
- **Naver**: 등록 후 2-3주 내 검색 결과 노출

## 8. 모니터링 및 개선

### Google Analytics 설정
1. Google Analytics 가입
2. 추적 코드 설치
3. 사용자 행동 분석

### 정기적인 최적화
- 월 1회 검색 성능 리뷰
- 상위 검색어 분석
- 클릭률(CTR) 개선
- 콘텐츠 업데이트

## 9. 추가 최적화 팁

### 콘텐츠 최적화
- 각 페이지에 고유한 제목과 설명 작성
- 키워드 자연스럽게 포함
- 정기적인 콘텐츠 업데이트

### 기술적 최적화
- 페이지 로딩 속도 개선
- 모바일 반응형 디자인 (이미 적용됨)
- HTTPS 사용 (이미 적용됨)

### 링크 최적화
- 내부 링크 구조 개선
- 외부 백링크 확보
- 소셜 미디어 공유

## 10. 문제 해결

### 사이트맵이 제출되지 않는 경우
- 사이트맵 URL 확인: `https://univmatch-gy6raywm.manus.space/sitemap.xml`
- 파일 형식이 XML인지 확인
- robots.txt에서 사이트맵 경로 확인

### 페이지가 색인되지 않는 경우
- robots.txt에서 차단되지 않았는지 확인
- 메타 태그 확인 (noindex 없는지)
- Google Search Console에서 URL 검사 실행

---

**마지막 업데이트**: 2026년 1월 7일
