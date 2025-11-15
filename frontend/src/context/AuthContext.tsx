// /frontend/src/context/AuthContext.ts

import React, { createContext } from 'react';

// so we must add it to the User type here.
export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string; 
  role: string;
  status: string;
  organization_id?: string;
}

export interface IAuthContext {
  user: User | null;
  loading: boolean;
  login: (credentials: {
    email?: string;
    password?: string;
    studentId?: string;
  }) => Promise<{ user: User }>;
  logout: () => void;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined);