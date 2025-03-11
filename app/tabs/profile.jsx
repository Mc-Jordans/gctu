import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import ConfirmationModal from "../components/ConfirmationModal";

const Profile = () => {
  // State for expandable cards
  const [expandedCard, setExpandedCard] = useState(null);

  // Animation values
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  // Animated values for header transparency
  const scrollY = useRef(new Animated.Value(0)).current;

  // Handle card toggle
  const toggleCard = (cardName) => {
    if (expandedCard === cardName) {
      // Close card
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setExpandedCard(null);
      });
    } else {
      // Open card
      setExpandedCard(cardName);
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedRotation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Dynamic header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Rotation for icons
  const iconRotation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Get max height for expanded content
  const getExpandedHeight = (cardName) => {
    if (expandedCard !== cardName) return 0;

    return animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, cardName === "Emergency Contacts Info" ? 220 : 180],
    });
  };

  // Card content based on title
  const renderCardContent = (title) => {
    switch (title) {
      case "Student Info":
        return (
          <ScrollView
            style={styles.cardContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>John Doe</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>01/01/2000</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Program</Text>
              <Text style={styles.infoValue}>Computer Science</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Session</Text>
              <Text style={styles.infoValue}>Morning</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Personal Email</Text>
              <Text style={styles.infoValue}>example@gmail.com</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone number</Text>
              <Text style={styles.infoValue}>0245009988</Text>
            </View>
          </ScrollView>
        );
      case "Documents":
        return (
          <ScrollView
            style={styles.cardContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{overflowY:'scroll',flexGrow:1}}
          >
            <TouchableOpacity style={styles.documentItem}>
              <MaterialCommunityIcons
                name="certificate"
                size={22}
                color="#298CFE"
              />
              <Text style={styles.documentText}>Official Admission Letter</Text>
              <Feather name="download" size={18} color="#298CFE" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.documentItem}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={22}
                color="#298CFE"
              />
              <Text style={styles.documentText}>Matriculation Oath</Text>
              <Feather name="download" size={18} color="#298CFE" />
            </TouchableOpacity>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  // Render a single card
  const renderCard = (title, icon) => {
    const isExpanded = expandedCard === title;
    const expandHeight = getExpandedHeight(title);

    return (
      <View style={styles.cardWrapper} key={title}>
        <TouchableOpacity
          style={[styles.cardHeader, isExpanded && styles.cardHeaderActive]}
          onPress={() => toggleCard(title)}
          activeOpacity={0.7}
        >
          <View style={styles.cardTitleContainer}>
            {icon}
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: iconRotation,
                },
              ],
            }}
          >
            <Feather
              name="chevron-down"
              size={22}
              color={isExpanded ? "#fff" : "#298CFE"}
            />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.expandableContent,
            {
              maxHeight: expandHeight,
              opacity: expandedCard === title ? 1 : 0,
            },
          ]}
        >
          {renderCardContent(title)}
        </Animated.View>
      </View>
    );
  };

  // Card data with icons
  const cards = [
    {
      title: "Student Info",
      icon: (
        <MaterialCommunityIcons
          name="account-details"
          size={22}
          color={expandedCard === "Student Info" ? "#fff" : "#298CFE"}
        />
      ),
    },
    {
      title: "Documents",
      icon: (
        <MaterialCommunityIcons
          name="file-document-multiple-outline"
          size={22}
          color={expandedCard === "Documents" ? "#fff" : "#298CFE"}
        />
      ),
    },
  ];

  // Stats items
  const statsItems = [
    { title: "Courses", value: "6", icon: "book-outline" },
    { title: "GPA", value: "3.8", icon: "school-outline" },
    { title: "Attendance", value: "92%", icon: "time-outline" },
  ];

  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(true);
  };

  const confirmLogout = () => {
    setModalVisible(false);
    console.log("User logged out"); // Replace with actual logout logic
  };

  const cancelLogout = () => {
    setModalVisible(false);
    console.log("Logout cancelled");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={`${Platform.OS === "android" ? "light-content" : "dark-content"}`}
        backgroundColor="#1075E9"
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Feather name="power" size={22} color="red" />
          </TouchableOpacity>
        </View>
      </View>
      {/* 
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      > */}
      <LinearGradient
        colors={["#2563EB", "#3B82F6", "#60A5FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHeader}
      >
        <View style={styles.profileImageContainer}>
          <Image
            source={require("../../assets/images/profileSample.jpg")}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Feather name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.profileName}>John Doe</Text>
        <View style={styles.profileBadge}>
          <Text style={styles.profileBadgeText}>Computer Science</Text>
        </View>
        <Text style={styles.profileId}>ID: 0123456789</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        {statsItems.map((item, index) => (
          <View key={index} style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name={item.icon} size={22} color="#298CFE" />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statTitle}>{item.title}</Text>
          </View>
        ))}
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.cardsContainer}>
          {cards.map((card) => renderCard(card.title, card.icon))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="edit-2" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Feather name="lock" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ConfirmationModal
        visible={modalVisible}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
      {/* </Animated.ScrollView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    position: "absolute",
    top: "2.5%",
    left: 0,
    right: 0,
    height: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: "#2563EB",
    zIndex: 100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  editImageButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#298CFE",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  profileBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  profileBadgeText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
  },
  profileId: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: -20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.1)",
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 15,
        shadowOpacity: 1,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(41, 140, 254, 0.1)",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFF",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.1)",
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 10,
        shadowOpacity: 1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF",
  },
  cardHeaderActive: {
    backgroundColor: "#298CFE",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  expandableContent: {
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    overflowY: "scroll",
    
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  documentText: {
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
    color: "#1E293B",
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 8,
  },
  contactRelation: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 8,
  },
  contactActions: {
    flexDirection: "row",
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(41, 140, 254, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#298CFE",
    borderRadius: 12,
    paddingVertical: 12,
    flex: 0.48,
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 12,
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default Profile;
