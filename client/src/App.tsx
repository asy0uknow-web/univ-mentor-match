import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationToast } from "./components/NotificationToast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { lazy, Suspense } from "react";

// 주요 페이지는 즉시 로드, 나머지는 동적 로드
import Home from "./pages/Home";
const Mentors = lazy(() => import("./pages/Mentors"));
const MentorDetail = lazy(() => import("./pages/MentorDetail"));
const MentorProfile = lazy(() => import("./pages/MentorProfile"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Messages = lazy(() => import("./pages/Messages"));
const VerifyMentor = lazy(() => import("./pages/VerifyMentor"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount"));
const AdminBugReports = lazy(() => import("./pages/AdminBugReports"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));
const ReviewCreate = lazy(() => import("./pages/ReviewCreate"));
const QnAList = lazy(() => import("./pages/QnAList"));
const QnADetail = lazy(() => import("./pages/QnADetail"));
const QnACreate = lazy(() => import("./pages/QnACreate"));
const QnAGuide = lazy(() => import("./pages/QnAGuide"));
const QnADashboard = lazy(() => import("./pages/QnADashboard"));
const MentorColumns = lazy(() => import("./pages/MentorColumns"));
const MentorColumnDetail = lazy(() => import("./pages/MentorColumnDetail"));
const MentorColumnCreate = lazy(() => import("./pages/MentorColumnCreate"));
const AdminColumnStats = lazy(() => import("./pages/AdminColumnStats"));
const Terms = lazy(() => import("./pages/Terms"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const DraftColumns = lazy(() => import("./pages/DraftColumns"));
const RecommendedMentors = lazy(() => import("./pages/RecommendedMentors"));

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/signup"} component={SignUp} />
        <Route path={"/login"} component={Login} />
        <Route path={"/mentors"} component={Mentors} />
        <Route path={"/mentor/:id"} component={MentorDetail} />
        <Route path={"/my-profile"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <MentorProfile />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/student-profile"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <StudentProfile />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/bookings"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <Bookings />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/notifications"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <Notifications />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/messages"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <Messages />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/verify-mentor"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <VerifyMentor />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/admin"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/delete-account"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <DeleteAccount />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/admin/bug-reports"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <AdminBugReports />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/admin/column-stats"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <AdminColumnStats />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/complete-profile"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <CompleteProfile />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/privacy-policy"} component={PrivacyPolicy} />
        <Route path={"/terms"} component={Terms} />
        <Route path={"/refund-policy"} component={RefundPolicy} />
        <Route path={"/reviews/new"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <ReviewCreate />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/qna"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <QnAList />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/qna/guide"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <QnAGuide />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/qna/dashboard"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <QnADashboard />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/qna/new"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <QnACreate />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/qna/:id"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <QnADetail />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/columns"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <MentorColumns />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/columns/new"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <MentorColumnCreate />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/columns/:id"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <MentorColumnDetail />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/draft-columns"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <DraftColumns />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/recommended-mentors"}>
          {() => (
            <ProtectedRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
                <RecommendedMentors />
              </Suspense>
            </ProtectedRoute>
          )}
        </Route>
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <NotificationToast />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
