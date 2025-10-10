import { createContext } from "react";

export interface User {
  id: string;
  fullName: string;
  email?: string;
  role: "superadmin" | "centraladmin" | "courseadmin" | "student";
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface StudentLoginCredentials {
  studentId: string;
}

export type LoginCredentials = AdminLoginCredentials | StudentLoginCredentials;

export interface IAuthContext {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user: User }>;
  logout: () => Promise<void>;
}

// ✅ Only define the context here — no component export
export const AuthContext = createContext<IAuthContext | undefined>(undefined);
