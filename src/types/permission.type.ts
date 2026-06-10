import type { UserRoleType } from "./auth.types";
import type { ResourceType } from "./resource.types";

export const Action = {
  create: "create",
  read: "read",
  update: "update",
  delete: "delete",
} as const;

export type ActionType = (typeof Action)[keyof typeof Action];

export type PermissionWithResourceAndRoleType = Record<
  UserRoleType,
  Record<ResourceType, Record<ActionType, boolean>>
>;
