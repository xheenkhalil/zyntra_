// frontend/src/context/authTypes.ts

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  student_id?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface IAuthContext {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
}
