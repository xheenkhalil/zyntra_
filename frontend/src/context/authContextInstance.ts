import { createContext } from "react";
import type { IAuthContext } from "./authTypes";

export const AuthContext = createContext<IAuthContext | undefined>(undefined);
