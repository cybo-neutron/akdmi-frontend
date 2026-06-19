import { Link, Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { MoveRight, Rocket } from "lucide-react";
import ThemeSelector from "@/components/custom/ThemeSelector";
import { useAuthStore } from "@/store/useAuthStore";

const MainLayout = () => {
  const navigate = useNavigate();
  const { isUserLoggedIn } = useAuthStore();


  return (
    <div className="flex flex-col">
      <nav className="backdrop-blur-sm flex w-full items-center justify-between px-4 py-2 fixed top-0 z-50 ">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Rocket className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">AKDMI</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            to="/blogs"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Blogs
          </Link>
          <Link
            to="/courses"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Courses
          </Link>
        </div>

        <div className="flex items-center gap-4">

          <ThemeSelector />
          {
            isUserLoggedIn ?
              <Button onClick={() => navigate("/dashboard")}>
                Go to Dashboard
                <MoveRight />
              </Button>
              :
              <Button onClick={() => navigate("/login")}>Login</Button>
          }
        </div>
      </nav>

      {/* <div className="flex flex-1 items-center justify-center"> */}
      <Outlet />
      {/* </div> */}
    </div>
  );
};

export default MainLayout;
