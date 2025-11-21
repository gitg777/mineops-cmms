'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { onAuthChange, signOut as firebaseSignOut, getUserData } from '@/lib/firebase/auth';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export default function UserProvider({
  children,
  initialUser
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    // This will be handled by onAuthChange
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      router.push('/');
      router.refresh();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}
