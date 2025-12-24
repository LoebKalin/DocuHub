
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: string;
  password?: string;
  department: string;
  role: UserRole;
}

export interface PDFDocument {
  id: string; // Internal UUID
  userId: string; // The ID extracted from filename
  category: string;
  month: string;
  fileName: string;
  fileData: string; // Base64 encoded string for simulation
  uploadedAt: string;
  viewCount: number; // Number of times the document was opened
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
