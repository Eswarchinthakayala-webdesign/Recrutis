import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  SignUp,
  useUser,
} from "@clerk/clerk-react";
import {
  Home,
  BriefcaseBusiness,
  Heart,
  LogIn,
  PenBox,
  UserPlus,
  User,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { ModeToggle } from "./modeToggle";
import { useTheme } from "./theme-provider";

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("sign-in");
  const [search, setSearch] = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const { theme } = useTheme();
  const location = useLocation();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // handle modal open via query param
  useEffect(() => {
    const authParam = search.get("auth");
    const signInParam = search.get("sign-in");
    const signUpParam = search.get("sign-up");

    if (authParam === "sign-in" || signInParam === "true") {
      setMode("sign-in");
      setShowModal(true);
    } else if (authParam === "sign-up" || signUpParam === "true") {
      setMode("sign-up");
      setShowModal(true);
    }
  }, [search]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
      setSearch({});
    }
  };

  return (
    <>
      {/* Sticky Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md bg-gray-50/80 dark:bg-gray-950 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className={`h-10 sm:h-12 ${
                isDark ? "invert brightness-0" : "brightness-0"
              }`}
            />
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle />

            <SignedOut>
              <Button
                variant="ghost"
                className="flex items-center gap-1 bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-200 transition"
                onClick={() => {
                  setMode("sign-in");
                  setShowModal(true);
                }}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center gap-1 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                onClick={() => {
                  setMode("sign-up");
                  setShowModal(true);
                }}
              >
                <UserPlus size={18} />
                <span>Sign Up</span>
              </Button>
            </SignedOut>

            <SignedIn>
              {user?.unsafeMetadata?.role === "recruiter" && (
                <Link to="/post-job">
                  <Button className="flex items-center gap-1 bg-red-700 text-white hover:bg-red-600 transition">
                    <PenBox size={18} />
                    <span>Post a Job</span>
                  </Button>
                </Link>
              )}

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Jobs"
                    labelIcon={<BriefcaseBusiness size={15} />}
                    href="/my-jobs"
                  />
                  <UserButton.Link
                    label="Saved Jobs"
                    labelIcon={<Heart size={15} />}
                    href="/saved-jobs"
                  />
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 dark:text-gray-100"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 flex flex-col gap-2">
            <SignedOut>
              <Button
                onClick={() => {
                  setMode("sign-in");
                  setShowModal(true);
                }}
                className="bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-800"
              >
                <LogIn size={18} /> Sign In
              </Button>
              <Button
                onClick={() => {
                  setMode("sign-up");
                  setShowModal(true);
                }}
                variant="outline"
              >
                <UserPlus size={18} /> Sign Up
              </Button>
            </SignedOut>

            <SignedIn>
              {user?.unsafeMetadata?.role === "recruiter" && (
                <Link to="/post-job">
                  <Button className="bg-red-700 text-white hover:bg-red-600 w-full">
                    <PenBox size={18} /> Post a Job
                  </Button>
                </Link>
              )}
            </SignedIn>
          </div>
        )}
      </nav>

      {/* Mobile Quick Action Bar */}
      <SignedIn>
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 flex justify-around py-2 md:hidden">
          <Link
            to="/"
            className={`flex flex-col items-center ${
              location.pathname === "/" ? "text-red-600" : "text-gray-500"
            }`}
          >
            <Home size={22} />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/jobs"
            className={`flex flex-col items-center ${
              location.pathname === "/jobs" ? "text-red-600" : "text-gray-500"
            }`}
          >
            <BriefcaseBusiness size={22} />
            <span className="text-xs">Jobs</span>
          </Link>
          <Link
            to="/saved-jobs"
            className={`flex flex-col items-center ${
              location.pathname === "/saved-jobs"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            <Heart size={22} />
            <span className="text-xs">Saved</span>
          </Link>
         <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Jobs"
                    labelIcon={<BriefcaseBusiness size={15} />}
                    href="/my-jobs"
                  />
                
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
        </div>
      </SignedIn>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[999] bg-black/50"
          onClick={handleOverlayClick}
        >
          {mode === "sign-in" ? (
            <SignIn
              signUpUrl="/?sign-up=true"
              redirectUrl="/onboarding"
              appearance={{
                layout: { socialButtonsPlacement: "bottom" },
              }}
            />
          ) : (
            <SignUp
              signInUrl="/?sign-in=true"
              redirectUrl="/onboarding"
              appearance={{
                layout: { socialButtonsPlacement: "bottom" },
              }}
            />
          )}
        </div>
      )}
      <div className="sm:py-10 py-10"></div>
    </>
  );
};

export default Header;
