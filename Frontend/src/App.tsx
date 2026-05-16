import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/react";
import { useEffect } from "react";
import { useAuthFetch } from "./hooks/useAuthFetch.js";
import Dashboard from "./pages/Dashboard.js";
import CreatePoll from "./pages/CreatePoll.js";
import PollRespond from "./pages/PollRespond.js";
import Analytics from "./pages/Analytics.js";
import PollResults from "./pages/PollResults.js";
import LandingPage from "./pages/LandingPage.js";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      Loading...
    </div>
  );
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
};

// reads ?redirect= param and forwards it to Clerk's afterSignInUrl
function SignInPage() {
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/dashboard";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <SignIn
        routing="path"
        path="/sign-in"
        // after sign-in, go back to where they came from
        fallbackRedirectUrl={redirectTo}
        signUpUrl={`/sign-up?redirect=${encodeURIComponent(redirectTo)}`}
      />
    </div>
  );
}

function SignUpPage() {
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/dashboard";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>
      <SignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl={redirectTo}
        signInUrl={`/sign-in?redirect=${encodeURIComponent(redirectTo)}`}
      />
    </div>
  );
}

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const authFetch = useAuthFetch();

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      authFetch.post("/api/users/sync").catch(console.error);
    }
  }, [isSignedIn, isLoaded]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        <Route path="/poll/:pollId" element={<PollRespond />} />
        <Route path="/poll/:pollId/results" element={<PollResults />} />

        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreatePoll /></ProtectedRoute>} />
        <Route path="/analytics/:pollId" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}