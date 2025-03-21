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
  const [mountedCourses, setMountedCourses] = useState([]); // Added mountedCourses
  const currentSemester = "Semester 1"; // Adjust dynamically if needed

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

          // Fetch student profile and courses
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

      // Fetch student profile and courses when auth state changes
      if (session?.user) {
        await fetchStudentProfile(session.user.id);
      } else {
        setStudentProfile(null);
        setMountedCourses([]); // Reset mountedCourses when user logs out
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
        .from("students") // Changed from "profiles" to "students" per your code
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching student profile:", error.message);
        return;
      }

      setStudentProfile(data);
      await fetchMountedCourses(data); // Fetch courses after profile
    } catch (error) {
      console.error("Profile fetch error:", error.message);
    }
  };

  const fetchMountedCourses = async (profile) => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, code, name, level, credit_hours, program, semester")
        .eq("mounted", true)
        .eq("program", profile.program)
        .eq("level", profile.level)
        .eq("semester", currentSemester);

      if (error) throw error;

      setMountedCourses(
        data.map((course) => ({
          title: course.name,
          code: course.code,
          credit: `${course.credit_hours} Credit Hours`,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching mounted courses:", error.message);
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

      // Fetch student profile and courses
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
        setMountedCourses([]); // Reset mountedCourses on logout
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
        mountedCourses, // Added to context value
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
