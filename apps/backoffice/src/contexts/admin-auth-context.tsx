import { adminApi } from "@/lib/admin-api";
import type { AdminUser } from "@/types";
import { type ReactNode, createContext, useContext, useEffect, useReducer } from "react";

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AdminAuthAction =
  | { type: "SET_USER"; payload: AdminUser }
  | { type: "CLEAR_USER" }
  | { type: "SET_LOADING"; payload: boolean };

interface AdminAuthContextValue extends AdminAuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function adminAuthReducer(state: AdminAuthState, action: AdminAuthAction): AdminAuthState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case "CLEAR_USER":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

const initialState: AdminAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get user from cookie-authenticated session
        const user = await adminApi.getMe();
        if (user.role !== "admin") {
          // Not an admin, clear the session
          await adminApi.logout();
          dispatch({ type: "CLEAR_USER" });
          return;
        }
        dispatch({ type: "SET_USER", payload: user });
      } catch {
        // Cookie is invalid or expired
        dispatch({ type: "CLEAR_USER" });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await adminApi.login(email, password);
    dispatch({ type: "SET_USER", payload: user });
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // Ignore errors on logout
    }
    dispatch({ type: "CLEAR_USER" });
  };

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
