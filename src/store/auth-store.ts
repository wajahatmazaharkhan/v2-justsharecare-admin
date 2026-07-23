import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  authenticated: boolean;
  toggleAuthState: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authenticated: false,
      toggleAuthState: (value) => set({ authenticated: value }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
