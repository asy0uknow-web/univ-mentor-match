import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, AlertCircle, CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { value: "입시 전략", label: "입시 전략" },
  { value: "전공 선택", label: "전공 선택" },
  { value: "대학 생활", label: "대학 생활" },
  { value: "학교 분위기", label: "학교 분위기" },
  { value: "학업/생기부", label: "학업/생기부" },
  { value: "기숙사/통학", label: "기숙사/통학" },
  { value: "인간관계/적응", label: "인간관계/적응" },
  { value: "진로 고민", label: "진로 고민" },
  { value: "기타", label: "기타" },
];

const GOOD_EXAMPLES = [
  "OO대 경영 vs OO대 경제 중 어디가 전공 만족도가 높은가요?",
  "컴공 진학 생각 중인데 대학 생활에서 가장 힘든 점이 궁금해요",
  "생기부에 데이터 분석 활동이 많은데 어떤 전공과 잘 맞을까요?",
];

export default function QnACreate() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [interestUniversity, setInterestUniversity] = useState("");
  const [interestMajor, setInterestMajor] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [contextInfo, setContextInfo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setPageMeta({ title: "Q&A 질문 작성", description: "Q&A 질문 작성 페이지" });
  }, []);

  // 질문 작성 뮤테이션
  const createQuestionMutation = trpc.qna.createQuestion.useMutation({
    onSuccess: (data: any) => {
      alert("질문이 작성되었습니다");
      const questionId = data.questionId || data.insertId || data.id;
      if (questionId) {
        setLocation(`/qna/${questionId}`);
      } else {
        setLocation('/qna');
      }
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요";
    }
    if (!content.trim()) {
      newErrors.content = "내용을 입력해주세요";
    }
    if (!category) {
      newErrors.category = "카테고리를 선택해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    await createQuestionMutation.mutateAsync({
      title,
      content,
      category,
      isAnonymous,
      interestUniversity: interestUniversity || undefined,
      interestMajor: interestMajor || undefined,
      gradeLevel: gradeLevel || undefined,
      contextInfo: contextInfo || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">로그인이 필요합니다</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/login')}
                className="w-full text-xs sm:text-sm h-9 sm:h-10"
              >
                로그인
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // 멘토는 질문 작성 불가
  if (user?.role === 'mentor') {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">멘토는 질문을 작성할 수 없습니다</CardTitle>
              <CardDescription className="text-sm">멘토는 멘티의 질문에 답변하는 역할입니다. Q&A 목록에서 답변을 기다리는 질문을 찾아보세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/qna')}
                className="w-full text-xs sm:text-sm h-9 sm:h-10 bg-green-600 hover:bg-green-700"
              >
                Q&A 목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-2xl">
        {/* 헤더 */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/qna')}
          className="mb-4 text-xs sm:text-sm"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          돌아가기
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">질문 작성하기</h1>
          <p className="text-sm text-muted-foreground">
            재학생 멘토에게 궁금한 점을 자유롭게 질문해보세요
          </p>
        </div>

        {/* 좋은 질문 예시 */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 mb-6 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-base">좋은 질문 예시</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {GOOD_EXAMPLES.map((example, idx) => (
              <p key={idx} className="text-xs sm:text-sm text-green-900 hover:text-green-700 transition-colors cursor-pointer">
                • {example}
              </p>
            ))}
          </CardContent>
        </Card>

        {/* 금지 안내 */}
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 mb-6 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-base">금지 사항</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs sm:text-sm text-red-900">
              • 전화번호, 카카오톡 ID, 오픈채팅 링크, 인스타 ID 등 개인정보는 적지 마세요
            </p>
            <p className="text-xs sm:text-sm text-red-900">
              • 비방, 허위, 홍보성 글은 삭제될 수 있습니다
            </p>
            <p className="text-xs sm:text-sm text-red-900">
              • 1:1 맞춤 상담이 필요한 경우 상담 조율을 이용하세요
            </p>
          </CardContent>
        </Card>

        {/* 폰 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">필수 정보</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              *표시된 항목은 필수 항목입니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                제목 *
              </label>
              <Input
                placeholder="질문의 핵심을 간단히 적어주세요"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors({ ...errors, title: "" });
                  }
                }}
                className={`text-xs sm:text-sm h-9 sm:h-10 ${errors.title ? "border-red-500" : ""}`}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                카테고리 *
              </label>
              <Select value={category} onValueChange={(val) => {
                setCategory(val);
                if (errors.category) {
                  setErrors({ ...errors, category: "" });
                }
              }}>
                <SelectTrigger className={`w-full text-xs sm:text-sm h-9 sm:h-10 ${errors.category ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="카테고리를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-xs sm:text-sm">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                질문 내용 *
              </label>
              <Textarea
                placeholder="질문을 자세히 적어주세요. 학교, 전공, 학년, 상황 등을 포함하면 더 정확한 답변을 받을 수 있습니다."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) {
                    setErrors({ ...errors, content: "" });
                  }
                }}
                className={`text-xs sm:text-sm min-h-[150px] ${errors.content ? "border-red-500" : ""}`}
              />
              {errors.content && (
                <p className="text-xs text-red-500 mt-1">{errors.content}</p>
              )}
            </div>

            {/* 선택 정보 */}
            <div className="border-t pt-4 sm:pt-6">
              <h3 className="text-xs sm:text-sm font-medium mb-4">추가 정보 (선택)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 관심 대학 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    관심 대학
                  </label>
                  <Input
                    placeholder="예: 서울대, 연세대"
                    value={interestUniversity}
                    onChange={(e) => setInterestUniversity(e.target.value)}
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  />
                </div>

                {/* 관심 전공 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    관심 전공
                  </label>
                  <Input
                    placeholder="예: 컴퓨터공학, 경영학"
                    value={interestMajor}
                    onChange={(e) => setInterestMajor(e.target.value)}
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  />
                </div>

                {/* 학년 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    현재 학년
                  </label>
                  <Input
                    placeholder="예: 고2, 고3"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  />
                </div>

                {/* 익명 여부 */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-xs sm:text-sm">익명으로 질문하기</span>
                  </label>
                </div>
              </div>

              {/* 추가 맥락 정보 */}
              <div className="mt-4">
                <label className="block text-xs sm:text-sm font-medium mb-2">
                  추가 정보
                </label>
                <Textarea
                  placeholder="내신 성적, 모의고사 등급, 생기부 관련 정보 등 추가로 도움이 될 정보가 있으면 적어주세요"
                  value={contextInfo}
                  onChange={(e) => setContextInfo(e.target.value)}
                  className="text-xs sm:text-sm min-h-[100px]"
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setLocation('/qna')}
                className="text-xs sm:text-sm h-9 sm:h-10 flex-1 hover:bg-gray-100 transition-colors"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createQuestionMutation.isPending}
                className="text-xs sm:text-sm h-9 sm:h-10 flex-1 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {createQuestionMutation.isPending ? "작성 중..." : "질문 작성"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
