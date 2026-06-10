import { create } from "zustand";
import { type ResourceType } from "@/types/resource.types";
import { type UserRoleType } from "@/types/auth.types";
import { getAllPermissions } from "@/services/auth.service";
import type {
  ActionType,
  PermissionWithResourceAndRoleType,
} from "@/types/permission.type";

type State = {
  permissions: PermissionWithResourceAndRoleType;
};

type Actions = {
  populatePermissions: () => Promise<void>;
  hasPermission: (
    role: UserRoleType,
    resource: ResourceType,
    action: ActionType,
  ) => boolean;
};

export const usePermissionStore = create<State & Actions>((set, get) => ({
  // --------- states ---------
  permissions: {} as PermissionWithResourceAndRoleType,

  // --------- actions ---------
  populatePermissions: async () => {
    const response = await getAllPermissions();

    const permissions: any = {};

    for (const item of response.permissions) {
      permissions[item.role] = {
        ...permissions[item.role],
        [item.resource]: item.permission,
      };
    }

    set(() => ({
      permissions,
    }));
  },

  hasPermission: (
    role: UserRoleType,
    resource: ResourceType,
    action: ActionType,
  ) => {
    const permissions = get().permissions[role];
    return permissions?.[resource]?.[action] || false;
  },
}));
