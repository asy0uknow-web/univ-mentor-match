import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, MessageCircle, Eye, X, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useCallback } from "react";

type TabType = "qna" | "column" | "mentor";

export function TrendingContentPopup() {
  const [activeTab, setActiveTab] = useState<TabType>("qna");
  const [isVisible, setIsVisible] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("trendingPopupHideUntil");
    if (stored) {
      const hideTime = parseInt(stored);
      const now = Date.now();
      if (now < hideTime) {
        setIsVisible(false);
      } else {
        localStorage.removeItem("trendingPopupHideUntil");
      }
    }
  }, []);

  // 5분마다 자동 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
  }, []);

  const { data: questions, isLoading: qnaLoading } = trpc.qna.getQuestions.useQuery(
    {
      limit: 10,
      sortBy: "latest",
    },
    { enabled: isVisible }
  );

  const { data: columns, isLoading: columnLoading } = trpc.mentorColumns.getList.useQuery(
    {
      limit: 10,
      sortBy: "latest",
    },
    { enabled: isVisible }
  );

  const { data: mentors, isLoading: mentorLoading } = trpc.mentor.listAll.useQuery(
    undefined,
    { enabled: isVisible }
  );

  const getTrendingQnA = () => {
    return questions?.sort((a: any, b: any) => {
      if ((a.recentViewCount || 0) !== (b.recentViewCount || 0)) {
        return (b.recentViewCount || 0) - (a.recentViewCount || 0);
      }
      if ((a.viewCount || 0) !== (b.viewCount || 0)) {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if ((a.likeCount || 0) !== (b.likeCount || 0)) {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      return (b.answerCount || 0) - (a.answerCount || 0);
    })[0];
  };

  const getTrendingColumn = () => {
    return columns?.sort((a: any, b: any) => {
      if ((a.recentViewCount || 0) !== (b.recentViewCount || 0)) {
        return (b.recentViewCount || 0) - (a.recentViewCount || 0);
      }
      if ((a.viewCount || 0) !== (b.viewCount || 0)) {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if ((a.likeCount || 0) !== (b.likeCount || 0)) {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      return (b.commentCount || 0) - (a.commentCount || 0);
    })[0];
  };

  const getTrendingMentor = () => {
    return mentors?.sort((a: any, b: any) => {
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    })[0];
  };

  const handleHideToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("trendingPopupHideUntil", tomorrow.getTime().toString());
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const trendingQnA = getTrendingQnA();
  const trendingColumn = getTrendingColumn();
  const trendingMentor = getTrendingMentor();

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const isLoading = qnaLoading || columnLoading || mentorLoading;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 rounded-3xl shadow-2xl p-0 border-4 border-white dark:border-slate-800 animate-in slide-in-from-top-4 duration-500 z-50 group hover:shadow-3xl transition-all mx-4 sm:mx-0">
      {/* 헤더 */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-500 rounded-t-3xl p-6 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-2 w-20 h-20 bg-white rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-2 right-2 w-16 h-16 bg-yellow-200 rounded-full blur-2xl animate-bounce"></div>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-black">오늘의 핫 콘텐츠</h3>
              <p className="text-xs text-purple-100">지금 가장 인기있는 글을 확인하세요</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="팝업 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-white dark:bg-slate-900 px-4 pt-4 border-b border-gray-200 dark:border-slate-700">
        {[
          { id: "qna", label: "Q&A" },
          { id: "column", label: "칼럼" },
          { id: "mentor", label: "멘토" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 px-3 sm:px-4 py-3 font-bold text-xs sm:text-sm transition-all text-center ${
              activeTab === tab.id
                ? "text-purple-600 border-b-4 border-purple-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-b-3xl">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : activeTab === "qna" && trendingQnA ? (
          <Link href={`/qna/${trendingQnA.id}`}>
            <div className="group/card cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💬</div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground mb-1 line-clamp-2 group-hover/card:text-purple-600 transition-colors">
                    {trendingQnA.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {truncateText(trendingQnA.content?.replace(/<[^>]*>/g, "") || "", 100)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {trendingQnA.viewCount || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {trendingQnA.likeCount || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {trendingQnA.answerCount || 0}
                    </div>
                    <ChevronRight className="w-3 h-3 ml-auto group-hover/card:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : activeTab === "column" && trendingColumn ? (
          <Link href={`/columns/${trendingColumn.id}`}>
            <div className="group/card cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📝</div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground mb-1 line-clamp-2 group-hover/card:text-pink-600 transition-colors">
                    {trendingColumn.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {truncateText(trendingColumn.content?.replace(/<[^>]*>/g, "") || "", 100)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {trendingColumn.viewCount || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {trendingColumn.likeCount || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {trendingColumn.commentCount || 0}
                    </div>
                    <ChevronRight className="w-3 h-3 ml-auto group-hover/card:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : activeTab === "mentor" && trendingMentor ? (
          <Link href={`/mentor/${trendingMentor.uuid || trendingMentor.id}`}>
            <div className="group/card cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="text-3xl">👨‍🏫</div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground mb-1 line-clamp-2 group-hover/card:text-red-600 transition-colors">
                    {trendingMentor.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {trendingMentor.university} · {trendingMentor.major}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {trendingMentor.reviewCount || 0} 리뷰
                    </div>
                    <div className="flex items-center gap-1">
                      ⭐ {(trendingMentor.averageRating || 0).toFixed(1)}
                    </div>
                    <ChevronRight className="w-3 h-3 ml-auto group-hover/card:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : null}
      </div>

      {/* 푸터 */}
      <div className="bg-gray-50 dark:bg-slate-800 px-6 py-3 rounded-b-3xl border-t border-gray-200 dark:border-slate-700 flex gap-2">
        <button
          onClick={handleHideToday}
          className="flex-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 py-2 transition-colors"
        >
          오늘 하루 보이지 않음
        </button>
      </div>
    </div>
  );
}
