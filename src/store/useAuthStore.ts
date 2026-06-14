import {
  getLocalStorageAccessToken,
  loginUser,
  logOutUser,
  removeLocalStorageAccessToken,
  setAccessTokenLocalStorage,
  verifyAccessToken,
} from "@/services/auth.service";
import type { UserDetailsType, LoginUserType } from "@/types/auth.types";
import { create } from "zustand";

type State = {
  userDetails: UserDetailsType | null;
  userDetailsLoading: boolean;
  isUserLoggedIn: boolean;
};

type Actions = {
  setAccessToken: (token: string) => void;
  isLoggedIn: () => Promise<boolean>;
  logOut: () => void;
  logIn: ({ email, password }: LoginUserType) => void;
  reset: () => void;
  getUserDetails: () => UserDetailsType | null;
  setUserDetails: (details: UserDetailsType) => void;
  setUserDetailsLoading: (value: boolean) => void;
  authMe: () => Promise<boolean>;
};

export const useAuthStore = create<State & Actions>((set, get) => ({
  // ----- state ------
  userDetails: null,
  userDetailsLoading: false,
  isUserLoggedIn: false,

  // ----- actions -----
  setAccessToken: (token: string) => {
    setAccessTokenLocalStorage(token);
  },
  isLoggedIn: async () => {
    const localStorageAccessToken = getLocalStorageAccessToken();
    if (!localStorageAccessToken) {
      return false;
    }
    const response = await verifyAccessToken();
    if (response?.payload) {
      const { userId, role, email, firstName, lastName } = response.payload;
      if (!userId) {
        return false;
      }
      set(() => ({
        isUserLoggedIn: true,
        userDetails: {
          userId,
          email,
          role,
          firstName,
          lastName,
          avatarUrl: undefined,
        },
      }));
      return true;
    }
    return false;
  },

  logIn: async ({ email, password }: LoginUserType) => {
    const response = await loginUser({ email, password });

    const { userId, role, firstName, lastName, token } = response;
    if (!userId) {
      return;
    }
    set(() => ({
      isUserLoggedIn: true,
      userDetails: {
        userId,
        email,
        role,
        firstName,
        lastName,
        avatarUrl: undefined,
      },
    }));
    setAccessTokenLocalStorage(token as string);
  },

  logOut: () => {
    // reset state
    logOutUser();
    set(() => ({
      isUserLoggedIn: false,
      userDetails: null,
      userDetailsLoading: false,
    }));
  },

  reset: () => {
    // reset state
    set(() => ({
      userDetails: {
        userId: null,
        email: null,
        role: null,
        firstName: undefined,
        lastName: null,
        avatarUrl: undefined,
      },
      userDetailsLoading: false,
    }));

    // delete accesstoken from local storage
    removeLocalStorageAccessToken();
  },

  setUserDetails: (details: UserDetailsType) => {
    const { userId, email, role, firstName, lastName } = details;
    set(() => ({
      userDetails: {
        userId,
        email,
        role,
        firstName,
        lastName,
        avatarUrl: undefined,
      },
      isUserLoggedIn: true,
    }));
  },

  getUserDetails: () => {
    return get().userDetails;
  },

  setUserDetailsLoading: (value: boolean) => {
    set(() => ({
      userDetailsLoading: value,
    }));
  },

  authMe: async () => {
    const response = await verifyAccessToken();

    if (response) {
      const { userId, role, email, firstName, lastName } = response;
      if (!userId) {
        return false;
      }
      set(() => ({
        isUserLoggedIn: true,
        userDetails: {
          userId,
          email,
          role,
          firstName,
          lastName,
          avatarUrl: undefined,
        },
      }));
      return true;
    }
    return false;
  },
}));
