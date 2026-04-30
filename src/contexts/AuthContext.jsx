import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/LoadingScreen'; 

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false); // Used for Supplier
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (data) {
        setIsAdmin(data.role === 'ADMIN');
        setIsVendor(data.role === 'SUPPLIER');
      } else {
        setIsAdmin(false);
        setIsVendor(false);
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = {
          ...session.user,
          displayName: session.user.user_metadata?.company_name || session.user.user_metadata?.full_name,
        };
        setCurrentUser(user);
        await fetchUserRole(session.user.id);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = {
          ...session.user,
          displayName: session.user.user_metadata?.company_name || session.user.user_metadata?.full_name,
        };
        setCurrentUser(user);
        await fetchUserRole(session.user.id);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setIsVendor(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const signUp = async (type, formData) => {
    // type will be 'BUYER' or 'SUPPLIER'
    const { email, password, companyName } = formData;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          company_name: companyName,
          role: type
        }
      }
    });
    
    if (error) throw error;

    if (data.user) {
      // Create user record in our SQL schema
      const { error: dbError } = await supabase.from('users').insert([{
        id: data.user.id,
        email: email,
        role: type,
        company_name: companyName,
      }]);
      
      if (dbError) console.error("Error saving to users table:", dbError);
      
      setIsVendor(type === 'SUPPLIER');
      setIsAdmin(type === 'ADMIN');
    }

    return data.user;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim()
    });
    if (error) throw error;
    return data.user;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
    setIsAdmin(false);
    setIsVendor(false);
  };

  const value = {
    currentUser,
    isAdmin,
    isVendor,
    loading,
    signUp,
    signIn,
    signOut
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
