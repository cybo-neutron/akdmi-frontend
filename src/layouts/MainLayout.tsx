import { Link, Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import ThemeSelector from "@/components/custom/ThemeSelector";

const MainLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col p-2">
      <nav className="flex items-center justify-between px-4 py-2 border-b mb-4">
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
            to="/pricing"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSelector />
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
      </nav>

      {/* <div className="flex flex-1 items-center justify-center"> */}
      <Outlet />
      {/* </div> */}
    </div>
  );
};

export default MainLayout;
