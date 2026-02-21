import { api } from "@/lib/api";
import type { User } from "@/types";
import { type ReactNode, createContext, useContext, useEffect, useReducer } from "react";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: "SET_USER"; payload: User }
  | { type: "CLEAR_USER" }
  | { type: "SET_LOADING"; payload: boolean };

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name?: string }) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function authReducer(state: AuthState, action: AuthAction): AuthState {
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

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get user from cookie-authenticated session
        const user = await api.getMe();
        dispatch({ type: "SET_USER", payload: user });
      } catch {
        // Cookie is invalid or expired
        dispatch({ type: "CLEAR_USER" });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await api.login(email, password);
    dispatch({ type: "SET_USER", payload: user });
  };

  const register = async (data: { email: string; password: string; name?: string }): Promise<
    string | null
  > => {
    const { user, licenseKey } = await api.register(data);
    dispatch({ type: "SET_USER", payload: user });
    return licenseKey || null;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors on logout
    }
    dispatch({ type: "CLEAR_USER" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
