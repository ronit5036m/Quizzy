import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import Cookies from "js-cookie";
import api from "../api/api";
import { extractBearerToken } from "../util/bearerToken";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Error function

      setError: (message) => set({ error: message }),
      clearError: () => set({ error: null }),

      // Login Function

      login: async (userData) => {
        set({
          loading: true,
          error: null,
        });

        try {
          const res = await api.post("/auth/login", userData);
          set({
            user: res.data.user,
            token: extractBearerToken(res.data.token),
            isAuthenticated: true,
            loading: false,
          });
          return res.data.success;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Login failed",
            loading: false,
          });
        }
      },

      // Logout Function

      logout: () => {
        // Cookies.remove("token");
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        return true;
      },

      // Register Function

      register: async (userData) => {
        set({
          loading: true,
          error: null,
        });
        try {
          const res = await api.post("/auth/register", userData);
          set({
            loading: false,
            isAuthenticated: false,
            error: null,
          });
          return res.data.success;
        } catch (error) {
          set({
            error: error.response?.data?.message,
            loading: false,
          });
        }
      },

      // Load user On refresh

      loadUser: async () => {
        if (!get().token) return;
        try {
          const res = await api.get(`/user/me`);
          set({
            user: res.data,
            isAuthenticated: true,
          });
          // console.log(get().user);
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: "token",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
