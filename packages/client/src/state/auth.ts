import { create } from "zustand";
import type { CommandResponse } from "@discord/embedded-app-sdk";

type Auth = CommandResponse<"authenticate">;

type AuthStoreState = {
  auth?: Auth;
};

type AuthStoreActions = {
  setAuth: (auth: Auth) => void;
};

type AuthStore = AuthStoreState & AuthStoreActions;

const useAuthStore = create<AuthStore>((set) => ({
  auth: undefined,
  setAuth: (auth) =>
    set({
      auth: auth,
    }),
}));

export default useAuthStore;
