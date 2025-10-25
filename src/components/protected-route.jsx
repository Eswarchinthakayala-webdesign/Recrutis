/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const ProtectedRoute = ({ children, requireRole = false, signupRedirect = false }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { pathname } = useLocation();

  // Wait for Clerk to load before deciding
  if (!isLoaded) return null;

  // 1️⃣ Not signed in — redirect to Sign In or Sign Up modal
  if (!isSignedIn) {
    const redirectParam = signupRedirect ? "sign-up=true" : "sign-in=true";
    return <Navigate to={`/?${redirectParam}`} replace />;
  }

  // 2️⃣ Signed in but no role set yet (and role is required)
  if (
    requireRole &&
    user &&
    !user?.unsafeMetadata?.role &&
    pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3️⃣ If everything is okay — allow access
  return children;
};

export default ProtectedRoute;
