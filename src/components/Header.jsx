import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  SignUp,
  useUser,
} from "@clerk/clerk-react";
import { Button } from "./ui/button";
import { BriefcaseBusiness, Heart, LogIn, PenBox, UserPlus } from "lucide-react";
import { ModeToggle } from "./modeToggle";
import { useTheme } from "./theme-provider";

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("sign-in"); // "sign-in" | "sign-up"
  const [search, setSearch] = useSearchParams();
  const { user } = useUser();
    const { theme } = useTheme();

  // Determine if dark mode is active
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  // Check URL params to open modal automatically
  useEffect(() => {
    const param = search.get("auth"); // ?auth=sign-in or ?auth=sign-up
    if (param === "sign-in" || param === "sign-up") {
      setMode(param);
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
      <nav className="py-4 flex justify-between px-4 items-center">
        <Link to="/">
          <img
            src="/logo.png"
            className={`h-14 sm:h-18 lg:h-20 ${isDark ? "invert brightness-10" : "invert brightness-1000"}`}
            alt="Hirrd Logo"
          />
        </Link>

        <div className="flex gap-2 items-center">
          <ModeToggle />

          <SignedOut>
            <Button
              variant="outline"
              className="cursor-pointer bg-black text-white dark:bg-white hover:bg-zinc-800 hover:text-white dark:text-black dark:hover:bg-gray-100"
              onClick={() => {
                setMode("sign-in"); // default to sign-in for existing users
                setShowModal(true);
              }}
            >
              
             <LogIn size={20} />
      <span className="hidden sm:flex">Sign In</span>
            </Button>

            <Button
              variant="outline"
              className=" bg-neutral-700 text-gray-200 cursor-pointer hover:bg-zinc-900 hover:text-white dark:bg-neutral-200  dark:text-zinc-800  dark:hover:bg-gray-300"
              onClick={() => {
                setMode("sign-up"); // sign-up for new users
                setShowModal(true);
              }}
            >
              <UserPlus size={20} />
      <span className="hidden sm:flex">Sign Up</span>
            </Button>
          </SignedOut>

          <SignedIn>
            {user?.unsafeMetadata?.role === "recruiter" && (
              <Link to="/post-job">
                <Button  className="bg-red-700 dark:text-gray-300 hover:bg-red-600 text-white cursor-pointer flex items-center">
                  <PenBox size={20} className="" />
                 <span className="hidden sm:flex"> Post a Job</span>
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
      </nav>

      {/* Modal Overlay */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
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
    </>
  );
};

export default Header;
