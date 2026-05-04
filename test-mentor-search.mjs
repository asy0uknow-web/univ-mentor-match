import { getMentorsByFieldAndRegion, getMentorsByField, getMentorsByRegion } from './server/db.ts';

async function testMentorSearch() {
  console.log('=== 멘토 검색 API 테스트 ===\n');

  try {
    // 모든 필터 없이 조회
    console.log('1. 모든 멘토 조회 (필터 없음):');
    const allMentors = await getMentorsByFieldAndRegion();
    console.log(`결과: ${allMentors.length}명\n`);
    if (allMentors.length > 0) {
      console.log('첫 번째 멘토:', allMentors[0]);
    }

    // 분야별 조회
    console.log('\n2. 분야별 멘토 조회 (engineering):');
    const byField = await getMentorsByField('engineering');
    console.log(`결과: ${byField.length}명\n`);

    // 지역별 조회
    console.log('3. 지역별 멘토 조회 (seoul):');
    const byRegion = await getMentorsByRegion('seoul');
    console.log(`결과: ${byRegion.length}명\n`);

    // 분야 + 지역 조회
    console.log('4. 분야 + 지역 멘토 조회 (engineering, seoul):');
    const byFieldAndRegion = await getMentorsByFieldAndRegion('engineering', 'seoul');
    console.log(`결과: ${byFieldAndRegion.length}명\n`);

  } catch (error) {
    console.error('에러:', error);
  }
}

testMentorSearch();
