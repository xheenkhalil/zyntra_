import React, { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext, type IAuthContext, type User } from "./AuthContext";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(
    () => JSON.parse(localStorage.getItem("user") || "null")
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // === HELPER: Normalize User Data ===
  // This fixes the UUID display bug by ensuring student_id is caught
  // regardless of how the backend sends it (snake_case vs camelCase).
  const mapUser = (data: any): User => {
    return {
      ...data,
      student_id: data.student_id || data.studentId || data.username || undefined
    };
  };

  // === Verify session on mount ===
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        if (res.data?.user) {
          const normalizedUser = mapUser(res.data.user);
          setUser(normalizedUser);
          localStorage.setItem("user", JSON.stringify(normalizedUser));
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

      // FIX 1: Normalize data before saving (Solves the "UUID in Header" bug)
      const { user } = response.data;
      const normalizedUser = mapUser(user);

      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      return { user: normalizedUser };
    } catch (error: any) {
      console.error("Login failed:", error);

      // FIX 2: Proper Error Handling (Solves the "Status Code 400" message)
      if (axios.isAxiosError(error) && error.response) {
        // Extract the actual message from backend (e.g., "Invalid credentials")
        const serverMessage =
          error.response.data.message ||
          error.response.data.error ||
          "Login failed. Please check your credentials.";

        // Throw a clean Error object with just the string
        throw new Error(serverMessage);
      }

      // Fallback for network errors
      throw new Error("Connection failed. Please check your internet.");
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