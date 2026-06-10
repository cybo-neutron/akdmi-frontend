export type UserDetailsType = {
  userId: string | null;
  email: string | null;
  role: string | null;
  firstName: string | undefined;
  lastName: string | null;
  avatarUrl?: string;
};

export type LoginUserType = {
  email: string;
  password: string;
};

export type RegisterUserType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const UserRole = {
  ADMIN: "admin",
  MENTOR: "mentor",
  STUDENT: "student",
  MANAGER : 'manager'
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
