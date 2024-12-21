"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  login: (id: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const users = [
  { id: "user1-id", username: "user1" },
  { id: "user2-id", username: "user2" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = (id: string) => {
    const currentUser = users.find((user) => user.id === id);

    if (currentUser) {
      setUser(currentUser);
      Cookies.set("currentUser", id);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("currentUser");
    router.push("/login");
  };

  useEffect(() => {
    const savedUser = Cookies.get("currentUser");
    if (savedUser) {
      const currentUser = users.find((user) => user.id === savedUser);
      if (currentUser) {
        setUser(currentUser);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
