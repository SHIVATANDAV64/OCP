import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Models } from 'appwrite';
import { authService, dbService, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface AuthContextType {
  user: (Models.User<Models.Preferences> & { avatar?: string }) | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(Models.User<Models.Preferences> & { avatar?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      let userData = { ...currentUser };
      
      // Load avatar from database
      try {
        const userDoc = await dbService.listDocuments(COLLECTIONS.USERS, [Query.equal('userId', currentUser.$id)]);
        if (userDoc.documents.length > 0) {
          const userDocData = userDoc.documents[0] as Record<string, unknown>;
          const avatar = userDocData.avatar as string | undefined;
          if (avatar) {
            userData = { ...userData, avatar };
          }
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
      
      setUser(userData as Models.User<Models.Preferences> & { avatar?: string });
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    await refreshUser();
  };

  const signup = async (email: string, password: string, name: string) => {
    await authService.createAccount(email, password, name);
    await authService.login(email, password);
    await refreshUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
