// frontend/src/context/AuthProvider.tsx

import React, { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext, type IAuthContext, type User } from "./AuthContext";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Use the env var
  withCredentials: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(
    () => JSON.parse(localStorage.getItem("user") || "null")
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // === Verify session on mount ===
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.warn("Session check failed:", err);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  // === Login (Admin or Student) ===
  const login: IAuthContext["login"] = async (credentials) => {
    try {
      let response;

      if ("studentId" in credentials) {
        response = await apiClient.post("/auth/login", {
          studentId: credentials.studentId,
        });
      } else {
        response = await apiClient.post("/auth/login", {
          email: credentials.email,
          password: credentials.password,
        });
      }

      const { user } = response.data;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return { user };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // === Logout ===
  const logout: IAuthContext["logout"] = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
