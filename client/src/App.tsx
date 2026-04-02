import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ReviewCreate = lazy(() => import("./pages/ReviewCreate"));
const QnAList = lazy(() => import("./pages/QnAList"));
const QnADetail = lazy(() => import("./pages/QnADetail"));
const QnACreate = lazy(() => import("./pages/QnACreate"));

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <Switch>
        <Route path={"\\"} component={Home} />
        <Route path={"/signup"} component={SignUp} />
        <Route path={"/login"} component={Login} />
        <Route path={"/verify-email"} component={VerifyEmail} />
        <Route path={"/mentors"} component={Mentors} />
        <Route path={"/mentor/:id"} component={MentorDetail} />
        <Route path={"/my-profile"} component={MentorProfile} />
        <Route path={"/student-profile"} component={StudentProfile} />
        <Route path={"/bookings"} component={Bookings} />
        <Route path={"/notifications"} component={Notifications} />
        <Route path={"/messages"} component={Messages} />
        <Route path={"/verify-mentor"} component={VerifyMentor} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/delete-account"} component={DeleteAccount} />
        <Route path={"/admin/bug-reports"} component={AdminBugReports} />
        <Route path={"/complete-profile"} component={CompleteProfile} />
        <Route path={"/privacy-policy"} component={PrivacyPolicy} />
        <Route path={"/reviews/new"} component={ReviewCreate} />
        <Route path={"/qna"} component={QnAList} />
        <Route path={"/qna/:id"} component={QnADetail} />
        <Route path={"/qna/new"} component={QnACreate} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
