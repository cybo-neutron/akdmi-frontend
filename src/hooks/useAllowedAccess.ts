import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { type UserRoleType } from "@/types/auth.types";
import { type ResourceType } from "@/types/resource.types";
import { type ActionType } from "@/types/permission.type";

export function useAllowedAccess() {
  const { userDetails } = useAuthStore();
  const { hasPermission } = usePermissionStore();

  /**
   * Check if the current user has a specific permission
   */
  const checkPermission = (
    resource: ResourceType,
    action: ActionType,
  ): boolean => {
    if (!userDetails?.role) return false;
    return hasPermission(userDetails.role as UserRoleType, resource, action);
  };

  /**
   * Check if the current user has any of the allowed roles
   */
  const checkRole = (allowedRoles: UserRoleType[]): boolean => {
    if (!userDetails?.role) return false;
    return allowedRoles.includes(userDetails.role as UserRoleType);
  };

  return {
    userDetails,
    role: userDetails?.role as UserRoleType,
    checkPermission,
    checkRole,
    isAuthenticated: !!userDetails?.userId,
  };
}
