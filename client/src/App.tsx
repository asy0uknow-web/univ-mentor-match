import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Mentors from "./pages/Mentors";
import MentorDetail from "./pages/MentorDetail";
import MentorProfile from "./pages/MentorProfile";
import Bookings from "./pages/Bookings";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import VerifyMentor from "./pages/VerifyMentor";
import AdminDashboard from "./pages/AdminDashboard";
import DeleteAccount from "./pages/DeleteAccount";
import AdminBugReports from "./pages/AdminBugReports";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/mentors"} component={Mentors} />
      <Route path={"/mentor/:id"} component={MentorDetail} />
      <Route path={"/my-profile"} component={MentorProfile} />
      <Route path={"/bookings"} component={Bookings} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/verify-mentor"} component={VerifyMentor} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/delete-account"} component={DeleteAccount} />
      <Route path={"/admin/bug-reports"} component={AdminBugReports} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
