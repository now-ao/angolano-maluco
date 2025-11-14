import React, { createContext, useContext, useState, useEffect } from 'react';
import { z } from 'zod';
import { db, STORES } from '@/lib/db/indexedDB';
import { seedDatabase } from '@/lib/db/seed';
import type { User } from '@/lib/db/schema';

export type UserRole = 'admin' | 'cashier';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isCashier: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LoginSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255),
  password: z.string().trim().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDB = async () => {
      try {
        await db.init();
        await seedDatabase();
        
        const savedUserId = localStorage.getItem('currentUserId');
        if (savedUserId) {
          const savedUser = await db.get<User>(STORES.USERS, savedUserId);
          if (savedUser && savedUser.active) {
            setUser({
              id: savedUser.id,
              name: savedUser.name,
              email: savedUser.email,
              role: savedUser.role,
            });
          } else {
            localStorage.removeItem('currentUserId');
          }
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Validate input
      const validated = LoginSchema.parse({ email, password });

      // Find user by email
      const users = await db.getByIndex<User>(STORES.USERS, 'email', validated.email);
      const foundUser = users.find((u) => u.password === validated.password && u.active);

      if (foundUser) {
        setUser({
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
        });
        localStorage.setItem('currentUserId', foundUser.id);
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUserId');
  };

  const isAdmin = user?.role === 'admin';
  const isCashier = user?.role === 'cashier';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isCashier, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
