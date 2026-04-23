import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface PublishChecklistProps {
  title: string;
  content: string;
  excerpt: string;
  coverImageUrl: string;
  categories: string[];
  onPublish: () => void;
  onClose: () => void;
  isPublishing?: boolean;
}

export function PublishChecklist({
  title,
  content,
  excerpt,
  coverImageUrl,
  categories,
  onPublish,
  onClose,
  isPublishing = false,
}: PublishChecklistProps) {
  // 체크리스트 항목 정의
  const checklist = [
    {
      id: "title",
      label: "제목이 명확하고 매력적인가?",
      passed: title.length >= 5 && title.length <= 255,
      suggestion: title.length < 5 ? "제목은 최소 5자 이상이어야 합니다" : undefined,
    },
    {
      id: "content",
      label: "내용이 충분히 상세한가?",
      passed: content.length >= 50,
      suggestion: content.length < 50 ? "내용은 최소 50자 이상이어야 합니다" : undefined,
    },
    {
      id: "excerpt",
      label: "요약이 작성되었는가?",
      passed: excerpt.length > 0,
      suggestion: excerpt.length === 0 ? "요약을 작성하면 독자의 이해도가 높아집니다" : undefined,
    },
    {
      id: "image",
      label: "커버 이미지가 있는가?",
      passed: coverImageUrl.length > 0,
      suggestion: coverImageUrl.length === 0 ? "커버 이미지를 추가하면 시각적 매력이 증가합니다" : undefined,
    },
    {
      id: "category",
      label: "카테고리가 선택되었는가?",
      passed: categories.length > 0,
      suggestion: categories.length === 0 ? "카테고리는 필수입니다" : undefined,
    },
  ];

  const passedCount = checklist.filter((item) => item.passed).length;
  const totalCount = checklist.length;
  const completionPercentage = Math.round((passedCount / totalCount) * 100);
  const allRequiredPassed = checklist
    .filter((item) => ["title", "content", "category"].includes(item.id))
    .every((item) => item.passed);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background border-b">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            발행 전 체크리스트
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* 진행률 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">완성도</span>
              <span className="text-sm font-semibold text-blue-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* 체크리스트 항목 */}
          <div className="space-y-3">
            {checklist.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 pt-0.5">
                  {item.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.passed ? "text-foreground" : "text-amber-600"}`}>
                    {item.label}
                  </p>
                  {item.suggestion && (
                    <p className="text-xs text-muted-foreground mt-1">{item.suggestion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* SEO 팁 */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">SEO 최적화 팁</h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 제목에 주요 키워드를 포함하세요</li>
              <li>• 첫 문장에서 칼럼의 핵심을 설명하세요</li>
              <li>• 요약은 160자 이내로 작성하세요</li>
              <li>• 커버 이미지는 고품질의 시각 자료를 사용하세요</li>
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              돌아가기
            </Button>
            <Button
              onClick={onPublish}
              disabled={!allRequiredPassed || isPublishing}
              className="flex-1"
            >
              {isPublishing ? "발행 중..." : "발행하기"}
            </Button>
          </div>

          {!allRequiredPassed && (
            <p className="text-xs text-muted-foreground text-center">
              필수 항목을 모두 완성해야 발행할 수 있습니다
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
