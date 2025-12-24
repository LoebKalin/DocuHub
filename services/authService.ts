
import { User, UserRole } from '../types';

const USER_KEY = 'docuhub_user';
const USERS_DB_KEY = 'docuhub_users_db';

// Initialize with a default admin
const initDB = () => {
  const existing = localStorage.getItem(USERS_DB_KEY);
  if (!existing) {
    const defaultAdmin: User = {
      id: 'admin',
      password: 'admin', // In a real app, use bcrypt. For demo, plain text in simulated DB.
      department: 'IT',
      role: UserRole.ADMIN
    };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify([defaultAdmin]));
  }
};

initDB();

export const login = (id: string, password: string): User | null => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const found = users.find(u => u.id === id && u.password === password);
  if (found) {
    const { password, ...userWithoutPassword } = found;
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword as User;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(USER_KEY);
};

export const getAuthUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const bulkAddUsers = (newUsers: User[]) => {
  const existingUsers: User[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const merged = [...existingUsers];
  
  newUsers.forEach(nu => {
    const idx = merged.findIndex(u => u.id === nu.id);
    if (idx > -1) {
      merged[idx] = nu;
    } else {
      merged.push(nu);
    }
  });

  localStorage.setItem(USERS_DB_KEY, JSON.stringify(merged));
};

export const getAllUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
};
