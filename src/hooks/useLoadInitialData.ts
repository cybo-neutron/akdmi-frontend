import { usePermissionStore } from "@/store/usePermissionStore";
import { useEffect } from "react";

export const useLoadInitialData = () => {
  const { populatePermissions } = usePermissionStore();

  useEffect(() => {
    populatePermissions();
  }, []);
};
