import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getProfile } from '../supabase-client';
import type { Profile, GradeLevel } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Convenience getters
  studentName: string | null;
  grade: GradeLevel | null;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile when user changes
  const fetchProfile = async (userId: string) => {
    const profileData = await getProfile(userId);
    console.log('Fetched profile:', profileData); // Debug log
    console.log('User role:', profileData?.role); // Debug log
    setProfile(profileData);
    return profileData;
  };

  // Refresh profile manually
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // Small delay to allow trigger to create profile
          if (event === 'SIGNED_IN') {
            setTimeout(() => fetchProfile(currentUser.id), 500);
          } else {
            await fetchProfile(currentUser.id);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  // Convenience getters
  const studentName = profile?.student_name || user?.user_metadata?.studentName || null;
  const grade = profile?.grade || (user?.user_metadata?.grade as GradeLevel) || null;
  const isStudent = profile?.role === 'student' || !profile?.role;
  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    studentName,
    grade,
    isStudent,
    isTeacher,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};