import { Routes, Route, Navigate, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { useAuthFetch } from "./hooks/useAuthFetch.js";
import Dashboard from "./pages/Dashboard.js";
import CreatePoll from "./pages/CreatePoll.js";
import PollRespond from "./pages/PollRespond.js";
import Analytics from "./pages/Analytics.js";
import PollResults from "./pages/PollResults.js";
import LandingPage from "./pages/LandingPage.js";

// ----- Protected Route -----
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

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

  // CRITICAL FIX: Append the targeted route path as a query param so we don't lose it
  if (!isSignedIn) {
    return <Navigate to={`/sign-in?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

// ----- Sign-in page -----
function SignInPage() {
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/dashboard";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      <SignIn
        routing="path"
        path="/sign-in"
        fallbackRedirectUrl={redirectTo} // Clerk handles routing directly to the target page smoothly
        signUpUrl={`/sign-up?redirect=${encodeURIComponent(redirectTo)}`}
      />
    </div>
  );
}

// ----- Sign-up page -----
function SignUpPage() {
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/dashboard";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      <SignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl={redirectTo}
        signInUrl={`/sign-in?redirect=${encodeURIComponent(redirectTo)}`}
      />
    </div>
  );
}

// ----- Post-auth sync & route cleanup handler -----
function useAuthHandler() {
  const { isSignedIn, isLoaded } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const location = useLocation();

  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success">("idle");

  // 1. ROBUST DATABASE SYNC LAYER
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setSyncStatus("idle");
      return;
    }

    if (isSignedIn && syncStatus === "idle") {
      setSyncStatus("syncing");
      
      console.log("Synchronizing profile with backend database...");
      authFetch
        .post("/api/users/sync")
        .then(() => {
          console.log("Database user synchronization successful.");
          setSyncStatus("success");
        })
        .catch((err) => {
          console.error("Database user synchronization failed:", err);
          setSyncStatus("idle"); // Retries smoothly on a future cycle if it drops
        });
    }
  }, [isSignedIn, isLoaded, syncStatus, authFetch]);

  // 2. AUTH PAGE ROUTE GUARD
  // If an already authenticated user manually types/visits /sign-in, bounce them out to dashboard
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const isAuthPage =
      location.pathname.startsWith("/sign-in") ||
      location.pathname.startsWith("/sign-up");

    if (isAuthPage) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSignedIn, isLoaded, location.pathname, navigate]);
}

function AppShell() {
  useAuthHandler(); // Manages background sync updates seamlessly

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
    // <BrowserRouter>
      <AppShell />
    // </BrowserRouter>
  );
}