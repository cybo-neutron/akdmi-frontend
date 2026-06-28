import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { MoveRight, Rocket, Menu, X } from "lucide-react";
import ThemeSelector from "@/components/custom/ThemeSelector";
import { useAuthStore } from "@/store/useAuthStore";

const MainLayout = () => {
  const navigate = useNavigate();
  const { isUserLoggedIn } = useAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/blogs", label: "Blogs" },
    { to: "/courses", label: "Courses" },
  ];

  return (
    <div className="flex flex-col">
      <nav className="backdrop-blur-sm bg-background/80 border-b border-border/40 flex w-full flex-col fixed top-0 z-50">
        {/* Main nav row */}
        <div className="flex w-full items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Rocket className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">AKDMI</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <div className="hidden md:block">
              {isUserLoggedIn ? (
                <Button onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                  <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => navigate("/login")}>Login</Button>
              )}
            </div>
            {/* Hamburger */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle navigation"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              {mobileNavOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile slide-down nav */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-border/40 px-4 py-4 flex flex-col gap-4 bg-background/95 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium transition-colors hover:text-primary py-1"
                onClick={() => setMobileNavOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border/40">
              {isUserLoggedIn ? (
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileNavOpen(false);
                  }}
                >
                  Go to Dashboard <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate("/login");
                    setMobileNavOpen(false);
                  }}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      <Outlet />
    </div>
  );
};

export default MainLayout;
