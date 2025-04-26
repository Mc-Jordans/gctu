import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

const StudentAction = () => {
  const navigation = useNavigation();
  const [clearanceStatus, setClearanceStatus] = useState("Pending");
  const [attendanceStatus, setAttendanceStatus] = useState("Not Scanned");

  // Simulate clearance action
  const handleClearance = () => {
    setClearanceStatus("Cleared");
    alert("Clearance completed successfully!");
  };

  // Simulate QR code scanning
  const handleScanQR = () => {
    setAttendanceStatus("Scanned");
    alert("QR code scanned successfully! Attendance recorded.");
  };

  // Navigate to lecture evaluation page
  const router = useRouter();
  const navigateToLectureEvaluation = () => {
    router.push("/screens/LectureEvaluation");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar translucent={true} barStyle="light-content" backgroundColor="#003366" />
      {/* Header covering status bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Action</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Lecture Evaluation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lecture Evaluation</Text>
          <TouchableOpacity
            style={styles.navButton}
            onPress={navigateToLectureEvaluation}
          >
            <Text style={styles.navButtonText}>View Evaluations</Text>
          </TouchableOpacity>
        </View>

        {/* Clearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perform Clearance</Text>
          <Text style={styles.statusText}>Status: {clearanceStatus}</Text>
          {clearanceStatus === "Pending" && (
            <TouchableOpacity style={styles.button} onPress={handleClearance}>
              <Text style={styles.buttonText}>Complete Clearance</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* QR Code Attendance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan Attendance QR</Text>
          <Text style={styles.statusText}>Status: {attendanceStatus}</Text>
          {attendanceStatus === "Not Scanned" && (
            <TouchableOpacity style={styles.button} onPress={handleScanQR}>
              <Text style={styles.buttonText}>Scan QR Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#003366", // Dark blue header
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#003366",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  navButton: {
    backgroundColor: "#004080",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default StudentAction;
