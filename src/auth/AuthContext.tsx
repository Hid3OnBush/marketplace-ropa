import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import API_URL from "../api/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
  address?: string;
  city?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  register: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    address?: string;
    city?: string;
    phone?: string;
  }) => boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = "store_current_user";
const TOKEN_KEY = "store_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) return false;

      return await login(userData.email, userData.password);
    } catch (error) {
      console.error("Error registrando usuario:", error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(TOKEN_KEY, data.token);

      setUser(data.user);
      setToken(data.token);

      return true;
    } catch (error) {
      console.error("Error iniciando sesión:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  const updateProfile = (data: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    address?: string;
    city?: string;
    phone?: string;
  }) => {
    if (!user) return false;

    const updatedUser = {
      ...user,
      ...data,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        register,
        login,
        logout,
        updateProfile,
        isLoggedIn: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}