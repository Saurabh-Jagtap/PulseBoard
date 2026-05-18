import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/react";
import { useEffect, useRef } from "react";
import { useAuthFetch } from "./hooks/useAuthFetch.js";
import Dashboard from "./pages/Dashboard.js";
import CreatePoll from "./pages/CreatePoll.js";
import PollRespond from "./pages/PollRespond.js";
import Analytics from "./pages/Analytics.js";
import PollResults from "./pages/PollResults.js";
import LandingPage from "./pages/LandingPage.js";

// ----- Constants -----
const REDIRECT_KEY = "pb_post_auth_redirect";

// ----- Helpers -----
function saveRedirect(path: string) {
  sessionStorage.setItem(REDIRECT_KEY, path);
}

function consumeRedirect(): string | null {
  const val = sessionStorage.getItem(REDIRECT_KEY);
  if (val) sessionStorage.removeItem(REDIRECT_KEY);
  return val;
}

// ----- Protected Route -----
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "var(--bg)",
        fontFamily: "'DM Sans', sans-serif", color: "var(--muted)",
      }}>
        Loading…
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
};

// ----- Sign-in page -----
// Reads ?redirect= from the URL and:
// 1. Passes it to Clerk as fallbackRedirectUrl (works for login)
// 2. Saves it to sessionStorage (survives email verification for sign-up)
function SignInPage() {
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/dashboard";

  // Always persist to sessionStorage so the post-auth handler in App
  // can pick it up regardless of whether it was login or sign-up
  useEffect(() => {
    if (redirectTo && redirectTo !== "/dashboard") {
      saveRedirect(redirectTo);
    }
  }, [redirectTo]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      <SignIn
        routing="path"
        path="/sign-in"
        // For returning users: Clerk reads this and redirects immediately
        fallbackRedirectUrl={redirectTo}
        // When "Don't have an account?" is clicked, preserve the redirect param
        signUpUrl={`/sign-up?redirect=${encodeURIComponent(redirectTo)}`}
      />
    </div>
  );
}

// ----- Sign-up page -----
function SignUpPage() {
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/dashboard";

  // Same persistence — after email verification Clerk will land back
  // on /sign-up (or /dashboard), and our App-level handler will pick
  // up sessionStorage and navigate to the intended destination
  useEffect(() => {
    if (redirectTo && redirectTo !== "/dashboard") {
      saveRedirect(redirectTo);
    }
  }, [redirectTo]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      <SignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl='/dashboard'
        signInUrl={`/sign-in?redirect=${encodeURIComponent(redirectTo)}`}
      />
    </div>
  );
}

// ----- Post-auth redirect handler -----
// Runs once when isSignedIn flips to true.
// Checks sessionStorage for a saved destination and navigates there.
// This is what fixes the new-user email-verification case.
function useAuthHandler() {
  const { isSignedIn, isLoaded } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  const hasHandledAuth = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasHandledAuth.current) return;

    hasHandledAuth.current = true;

    const destination = consumeRedirect();

    authFetch
      .post("/api/users/sync")
      .catch(console.error)
      .finally(() => {
        navigate(destination || "/dashboard", { replace: true });
      });
  }, [isSignedIn, isLoaded]);
}

function AppShell() {
  useAuthHandler(); // single hook, correct order

  return (
    <Routes>
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="/poll/:pollId" element={<PollRespond />} />
      <Route path="/poll/:pollId/results" element={<PollResults />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreatePoll /></ProtectedRoute>} />
      <Route path="/analytics/:pollId" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ----- Root export -----
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}