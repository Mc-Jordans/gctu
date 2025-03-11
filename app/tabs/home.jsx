import React, { useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BellIcon from "../../assets/SVG/bell";
import GpaIcon from "../../assets/SVG/GpaIcon";
import CreditsIcon from "../../assets/SVG/CreditsIcon";
import ConfirmationModal from "../components/ConfirmationModal";
import {Credits} from "./academics";

// Dynamic width calculations
const { width } = Dimensions.get("window");

// Component for academic year calculation
const AcademicYear = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Text>
      {currentYear}/{currentYear + 1}
    </Text>
  );
};

// QuickAccess card component
const QuickAccess = React.memo(({ title, icon, BgColor, color }) => (
  <Pressable
    style={({ pressed }) => [styles.courseCard, pressed && styles.pressedCard]}
    android_ripple={{ color: "rgba(0,0,0,0.1)" }}
  >
    <View style={styles.courseCardContent}>
      <View style={[styles.courseIconContainer, { backgroundColor: BgColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.courseCardTitle}>{title}</Text>
      <View style={styles.courseCardArrow}>
        <Ionicons name="chevron-forward" size={20} color="rgba(0,0,0,0.5)" />
      </View>
    </View>
  </Pressable>
));

// Stat card component
const StatCard = React.memo(({ icon, label, value, bgColor }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <View style={styles.statContent}>
      <View style={styles.statIconContainer}>{icon}</View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}:</Text>
      </View>
    </View>
  </View>
));

const HomeScreen = () => {
  // Memoize contents data to prevent unnecessary re-renders
  const quickAccessContents = useMemo(
    () => [
      {
        title: "Course Registration",
        icon: "book-outline",
        color: "rgba(133, 42, 244, 0.98)", // Light purple
        BgColor: "rgba(217, 115, 245, 0.45)", // Dark purple
      },
      {
        title: "Results",
        icon: "document-text-outline",
        color: "rgba(246, 199, 28, 0.98)", // Light cream
        BgColor: "rgba(243, 220, 139, 0.69)", // Dark cream
      },
      {
        title: "Fee Payment",
        icon: "card-outline",
        color: "rgba(242, 47, 57, 0.94)", // Light red
        BgColor: "rgba(239, 110, 116, 0.55)", // Dark red
      },
      
    ],
    []
  );

  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => { 
    setModalVisible(true);
  } 

  const confirmLogout = () => {
    setModalVisible(false);
    console.log("User logged out"); 
  };

  const cancelLogout = () =>{
    setModalVisible(false);
    console.log("Logout cancelled");
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1075E9",
      }}
    >
      <StatusBar backgroundColor="#1075E9" barStyle="light-content" />
      <SafeAreaView style={styles.wrapper}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={["#1075E9", "rgba(25, 46, 235, 0.9)"]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={require("../../assets/images/profileSample.jpg")}
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.greetings}>
                <Text style={styles.mainGreetings}>Welcome</Text>
                <Text style={styles.userName}>Mr John</Text>
              </View>
            </View>
            <View style={styles.rightHeader}>
              <Pressable style={styles.iconButton}>
                <BellIcon />
              </Pressable>
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons
                  name="power-outline"
                  size={22}
                  color="rgb(219, 3, 43)"
                />
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Program Card */}
          <View style={styles.programCard}>
            <View style={styles.programHeader}>
              <View>
                <Text style={styles.programLabel}>PROGRAM</Text>
                <Text style={styles.programTitle}>
                  BSc. Information Technology
                </Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Level 200</Text>
              </View>
            </View>

            <View style={styles.semesterInfo}>
              <View style={styles.semesterDetail}>
                <Text style={styles.semesterLabel}>Current Semester</Text>
                <Text style={styles.semesterText}>
                  <AcademicYear /> - Semester 1
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>

          {/* Stats Cards - Bright Colors */}
          <View style={styles.statsRow}>
            <StatCard
              icon={<GpaIcon />}
              label="CGPA"
              value="3.75"
              bgColor="#e0e7ff" // Light purple
            />
            <StatCard
              icon={<CreditsIcon />}
              label="Credits"
              value={<Credits/>}
              bgColor="#d1fae5" // Light green
            />
          </View>

          {/* Quick Access Section */}
          <View style={styles.quickAccessSection}>
            <Text style={styles.sectionTitle}>Quick access</Text>

            {/* Quick Access Cards */}
            <View style={styles.coursesContainer}>
              {quickAccessContents.map((quickAccessContent, index) => (
                <QuickAccess key={index} {...quickAccessContent} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Confirmation Modal */}
        <ConfirmationModal
          visible={modalVisible}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#1075E9",
  },
  headerGradient: {
    paddingBottom: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25, // Changed to half of width/height for perfect circle
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  greetings: {
    marginLeft: 16,
  },
  mainGreetings: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
    borderTopRightRadius: 24,
    backgroundColor: "#f9fafb",
    marginTop: -15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  programCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  programHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  programLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  levelBadge: {
    backgroundColor: "#e0e7ff", // Light purple to match CGPA
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4338ca", // Dark purple
  },
  semesterInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  semesterDetail: {},
  semesterLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.5)",
  },
  semesterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "rgba(5, 150, 105, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgb(5, 150, 105)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: width * 0.43,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    height: 90,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statTextContainer: {
    position: "relative",
    width: "100%",
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700", // Changed from 500 to 700 for better visibility
    color: "#6b7280",
    marginBottom: 2,
  },
  quickAccessSection: {
    marginBottom: 20,
  },
  coursesContainer: {
    marginBottom: 12,
  },
  courseCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.05)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  courseCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  courseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  courseCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  courseCardArrow: {
    marginLeft: 12,
  },
  pressedCard: {
    opacity: 0.8,
  },
});
