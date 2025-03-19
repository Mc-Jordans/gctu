import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { customSignIn } from "../lib/customAuth";
import { Alert } from "react-native";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error.message);
        }

        if (session) {
          setSession(session);
          setUser(session.user);

          // Fetch student profile
          if (session.user) {
            await fetchStudentProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error("Session check error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch student profile when auth state changes
      if (session?.user) {
        await fetchStudentProfile(session.user.id);
      } else {
        setStudentProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchStudentProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching student profile:", error.message);
        return;
      }

      setStudentProfile(data);
    } catch (error) {
      console.error("Profile fetch error:", error.message);
    }
  };

  const signIn = async (identifier, password) => {
    setLoading(true);
    try {
      const { success, user, session, error } = await customSignIn(
        identifier,
        password
      );

      if (!success) {
        Alert.alert("Login Failed", error || "Invalid credentials");
        return false;
      }

      setUser(user);
      setSession(session);

      // Fetch student profile
      if (user) {
        await fetchStudentProfile(user.id);
      }

      return true;
    } catch (error) {
      Alert.alert("Login Error", error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Logout Failed", error.message);
      } else {
        setUser(null);
        setSession(null);
        setStudentProfile(null);
      }
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (identifier) => {
    setLoading(true);
    try {
      // Convert index number to email if needed
      let email = identifier;
      if (!identifier.includes("@")) {
        email = `${identifier}@live.gctu.edu.gh`;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "gctu://reset-password",
      });

      if (error) {
        Alert.alert("Password Reset Failed", error.message);
        return false;
      }

      Alert.alert(
        "Password Reset Email Sent",
        "Check your email for a password reset link"
      );
      return true;
    } catch (error) {
      Alert.alert("Password Reset Error", error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        studentProfile,
        signIn,
        signOut,
        forgotPassword,
        fetchStudentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
