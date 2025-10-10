import { createContext } from "react";
import type { IAuthContext } from "./authTypes";

// ✅ Export only the context instance (no hooks, no components)
export const AuthContext = createContext<IAuthContext | undefined>(undefined);
