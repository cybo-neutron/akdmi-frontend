import { Outlet } from "react-router";
import { useAuthMe } from "@/hooks/useAuthMe";
import { Loader2 } from "lucide-react";
import { useLoadInitialData } from "@/hooks/useLoadInitialData";

const RootLayout = () => {
  const { isLoading } = useAuthMe();

  useLoadInitialData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Outlet />
    </div>
  );
};

export default RootLayout;
