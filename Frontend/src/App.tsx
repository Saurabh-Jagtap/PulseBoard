import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
  if (!isLoaded) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
};

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const authFetch = useAuthFetch();

  // sync user to DB once after sign-in
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      authFetch.post("/api/users/sync").catch(console.error);
    }
  }, [isSignedIn, isLoaded]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <SignIn routing="path" path="/sign-in" fallbackRedirectUrl="/dashboard" />
          </div>
        } />
        <Route path="/sign-up" element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <SignUp routing="path" path="/sign-up" fallbackRedirectUrl="/dashboard" />
          </div>
        } />

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