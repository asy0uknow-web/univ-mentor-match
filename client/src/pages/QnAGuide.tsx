import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle, Flag, Shield, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";

export default function QnAGuide() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setPageMeta({ 
      title: "Q&A 가이드", 
      description: "Q&A 이용 가이드, 안전 정책, 신고 방법" 
    });
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation('/qna')}
          className="mb-4 text-xs sm:text-sm"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Q&A로 돌아가기
        </Button>

        <div className="max-w-3xl space-y-6 sm:space-y-8">
          {/* 헤더 */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">Q&A 이용 가이드</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              건강한 Q&A 커뮤니티를 위한 가이드라인입니다
            </p>
          </div>

          {/* 좋은 질문 만드는 법 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle>좋은 질문 만드는 법</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-l-green-500 pl-4">
                  <p className="font-medium text-sm mb-1">✓ 명확하고 구체적인 제목</p>
                  <p className="text-xs text-muted-foreground">
                    "OO대 경영 vs OO대 경제 중 어디가 전공 만족도가 높은가요?"
                  </p>
                </div>

                <div className="border-l-4 border-l-green-500 pl-4">
                  <p className="font-medium text-sm mb-1">✓ 맥락 정보 포함</p>
                  <p className="text-xs text-muted-foreground">
                    관심 대학, 전공, 학년, 내신 성적, 모의고사 등급 등을 포함하면 더 정확한 답변을 받을 수 있습니다
                  </p>
                </div>

                <div className="border-l-4 border-l-green-500 pl-4">
                  <p className="font-medium text-sm mb-1">✓ 한 가지 핵심 고민만</p>
                  <p className="text-xs text-muted-foreground">
                    여러 질문을 섞으면 답변이 산만해질 수 있습니다. 가장 중요한 질문 하나에 집중하세요
                  </p>
                </div>

                <div className="border-l-4 border-l-green-500 pl-4">
                  <p className="font-medium text-sm mb-1">✓ 예의 있는 표현</p>
                  <p className="text-xs text-muted-foreground">
                    멘토의 시간을 소중히 여기는 마음으로 존댓글을 사용하세요
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 금지 사항 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <CardTitle>금지 사항</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-l-red-500 pl-4">
                  <p className="font-medium text-sm mb-1">✗ 개인정보 노출</p>
                  <p className="text-xs text-muted-foreground">
                    전화번호, 카카오톡 ID, 오픈채팅 링크, 인스타그램 ID, 이메일 등을 공개하지 마세요. 1:1 상담을 원하시면 상담 조율 기능을 이용하세요.
                  </p>
                </div>

                <div className="border-l-4 border-l-red-500 pl-4">
                  <p className="font-medium text-sm mb-1">✗ 비방, 욕설, 혐오 표현</p>
                  <p className="text-xs text-muted-foreground">
                    특정 학교, 전공, 사람을 비난하거나 혐오하는 내용은 삭제됩니다
                  </p>
                </div>

                <div className="border-l-4 border-l-red-500 pl-4">
                  <p className="font-medium text-sm mb-1">✗ 광고, 홍보, 스팸</p>
                  <p className="text-xs text-muted-foreground">
                    학원, 과외, 상품 판매 등의 광고성 글은 삭제됩니다
                  </p>
                </div>

                <div className="border-l-4 border-l-red-500 pl-4">
                  <p className="font-medium text-sm mb-1">✗ 허위 정보</p>
                  <p className="text-xs text-muted-foreground">
                    거짓된 정보나 근거 없는 주장은 커뮤니티를 해칩니다
                  </p>
                </div>

                <div className="border-l-4 border-l-red-500 pl-4">
                  <p className="font-medium text-sm mb-1">✗ 중복 질문</p>
                  <p className="text-xs text-muted-foreground">
                    같은 내용의 질문을 반복적으로 올리지 마세요
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 신고 방법 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-orange-600" />
                <CardTitle>신고 방법</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                부적절한 질문, 답변, 댓글을 발견하면 신고해주세요. 신고는 익명으로 처리되며, 커뮤니티를 건강하게 유지하는 데 큰 도움이 됩니다.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-3">신고 절차</h4>
                <ol className="space-y-2 text-xs sm:text-sm">
                  <li className="flex gap-2">
                    <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
                    <span>부적절한 내용 옆의 <Badge className="text-xs">신고</Badge> 버튼을 클릭합니다</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
                    <span>신고 사유를 선택합니다</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
                    <span>필요시 상세 설명을 작성합니다</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
                    <span>신고 버튼을 클릭하면 운영팀에서 검토합니다</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm">신고 사유</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Badge variant="outline" className="text-xs justify-start">부적절한 내용</Badge>
                  <Badge variant="outline" className="text-xs justify-start">개인정보 노출</Badge>
                  <Badge variant="outline" className="text-xs justify-start">광고/홍보</Badge>
                  <Badge variant="outline" className="text-xs justify-start">비방/욕설</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 안전 정책 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <CardTitle>안전 정책</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm mb-2">개인정보 보호</p>
                  <p className="text-xs text-muted-foreground">
                    유니브매치는 모든 사용자의 개인정보를 엄격하게 보호합니다. 질문 작성 시 개인정보를 입력하지 마세요. 1:1 상담이 필요한 경우 상담 조율 기능을 이용하세요.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">익명 질문</p>
                  <p className="text-xs text-muted-foreground">
                    민감한 내용은 익명으로 질문할 수 있습니다. 익명 질문은 질문자의 신원이 공개되지 않습니다.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">블로킹 및 신고</p>
                  <p className="text-xs text-muted-foreground">
                    부적절한 사용자는 신고할 수 있으며, 운영팀에서 검토 후 필요한 조치를 취합니다.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">콘텐츠 삭제</p>
                  <p className="text-xs text-muted-foreground">
                    금지 사항에 해당하는 질문, 답변, 댓글은 사전 통지 없이 삭제될 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 운영 정책 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <CardTitle>운영 정책</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm mb-2">커뮤니티 가이드라인</p>
                  <p className="text-xs text-muted-foreground">
                    모든 사용자는 이 가이드라인을 준수해야 합니다. 위반 시 경고, 콘텐츠 삭제, 계정 정지 등의 조치가 취해질 수 있습니다.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">신고 처리</p>
                  <p className="text-xs text-muted-foreground">
                    신고는 운영팀에서 24시간 이내에 검토하며, 필요시 콘텐츠를 삭제하거나 사용자를 제재합니다.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">계정 정지</p>
                  <p className="text-xs text-muted-foreground">
                    반복적인 위반이나 심각한 위반 시 계정이 정지될 수 있습니다.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">정책 변경</p>
                  <p className="text-xs text-muted-foreground">
                    운영 정책은 커뮤니티의 건강성을 위해 예고 없이 변경될 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 문의 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">문의 및 피드백</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs sm:text-sm text-blue-900">
                Q&A 이용 중 문제가 발생하거나 피드백이 있으신가요?
              </p>
              <Button 
                onClick={() => setLocation('/contact')}
                className="text-xs sm:text-sm h-8 sm:h-10"
              >
                문의하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
