import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user || !user.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const indexNumber = user.email.split("@")[0];
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("index_number", indexNumber)
        .single();
      if (studentError || !student) {
        console.error(
          "Student fetch error:",
          studentError?.message || "No student found"
        );
        throw new Error("Student profile not found");
      }

      const { data: personalNotifs, error: personalError } = await supabase
        .from("notifications")
        .select("*")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });
      if (personalError) throw personalError;

      const { data: generalNotifs, error: generalError } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (generalError) throw generalError;

      setNotifications(personalNotifs || []);
      setAnnouncements(generalNotifs || []);
      const unreadNotifs = (personalNotifs || []).filter((n) => !n.read).length;
      const unreadAnnouns = (generalNotifs || []).length; // Count all announcements
      setUnreadCount(unreadNotifs + unreadAnnouns); // Combine both
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);
      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(
        (prev) => prev - notifications.filter((n) => !n.read).length
      ); // Only reduce by notifications
    } catch (error) {
      console.error("Error marking all as read:", error.message);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const notificationSubscription = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        async (payload) => {
          const indexNumber = user.email.split("@")[0];
          const { data: student } = await supabase
            .from("students")
            .select("id")
            .eq("index_number", indexNumber)
            .single();
          if (payload.new.student_id === student?.id) {
            setNotifications((prev) => [payload.new, ...prev]);
            if (!payload.new.read) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }
      )
      .subscribe();

    const announcementSubscription = supabase
      .channel("public:announcements")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "announcements" },
        (payload) => {
          setAnnouncements((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1); // Increment for each new announcement
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationSubscription);
      supabase.removeChannel(announcementSubscription);
    };
  }, [user, fetchNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        announcements,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
