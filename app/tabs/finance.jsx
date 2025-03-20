import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Pressable,
  Modal,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Image,
  useWindowDimensions,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BellIcon from "../../assets/SVG/bell";
import ConfirmationModal from "../components/ConfirmationModal";
import { DollarSign } from "lucide-react-native";

// Remove the hardcoded exchange rate constant
// const USD_TO_GHS_RATE = 13.5;

// Payment Item Component
const PaymentItem = ({
  payment,
  isHistory = false,
  currencySymbol,
  conversionRate = 1,
}) => {
  return (
    <View style={styles.paymentItem}>
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentType}>{payment.type}</Text>
        <Text style={styles.paymentDate}>
          {isHistory ? payment.date : `Due: ${payment.dueDate}`}
        </Text>
      </View>
      <View style={styles.paymentAmount}>
        <Text style={styles.paymentAmountText}>
          {currencySymbol}
          {(payment.amount * conversionRate).toFixed(2)}
        </Text>
        {isHistory && (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  payment.status === "Paid" ? "#DCFFE4" : "#FFEDDC",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: payment.status === "Paid" ? "#0A803B" : "#FF8A00",
                },
              ]}
            >
              {payment.status}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Account Card Component (Updated)
const AccountCard = ({
  totalBalance,
  dueDate,
  onPayNow,
  isCedi,
  toggleCurrency,
  conversionRate,
  isLoadingRate,
}) => {
  const { width } = useWindowDimensions();
  const displayAmount = isCedi
    ? (parseFloat(totalBalance) * conversionRate).toFixed(2)
    : totalBalance;

  return (
    <LinearGradient
      colors={["#2D5D8A", "#4D8AC8", "#69B1F9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.accountCard, { height: width * 0.55 }]} // Responsive height
    >
      {/* Card decoration elements */}
      <View style={styles.cardDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <View style={styles.balanceContainer}>
          <Text style={styles.cardTitle}>Account Statement</Text>
          <Text style={styles.cardDescription}>Balance Due</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>{isCedi ? "₵" : "$"}</Text>
            {isLoadingRate && isCedi ? (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginLeft: 10 }}
              />
            ) : (
              <Text style={styles.amount}>{displayAmount}</Text>
            )}
          </View>

          <View style={styles.currencySymbolRight}>
            <TouchableOpacity
              style={styles.currencySymbolRightIcon}
              onPress={toggleCurrency}
              disabled={isLoadingRate}
            >
              {isLoadingRate ? (
                <ActivityIndicator size="small" color="#4D8AC8" />
              ) : isCedi ? (
                <Text
                  style={{ fontSize: 20, color: "#4D8AC8", fontWeight: "bold" }}
                >
                  ₵
                </Text>
              ) : (
                <DollarSign size={20} color="#4D8AC8" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Action Area */}
        <View style={styles.bottomRow}>
          {/* Pay Now Button */}
          <TouchableOpacity
            style={styles.payButton}
            onPress={onPayNow}
            accessibilityLabel="Pay now button"
            accessibilityHint="Tap to make your payment"
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color="#fff"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </View>

        {/* GCTU Logo at Bottom Left */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/gctuLogo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>GCTU</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

// Empty State Component
const EmptyState = ({ type }) => {
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={
          type === "upcoming" ? "calendar-outline" : "document-text-outline"
        }
        size={40}
        color="#C5CEE0"
      />
      <Text style={styles.emptyStateText}>
        No {type === "upcoming" ? "upcoming payments" : "payment history"}{" "}
        matches your filters
      </Text>
    </View>
  );
};

// Quick Action Button Component
const ActionButton = ({ icon, label, onPress }) => {
  const { width } = useWindowDimensions();
  const buttonWidth = (width - 60) / 3; // 60 = padding and gaps

  return (
    <TouchableOpacity
      style={[styles.actionButton, { width: buttonWidth }]}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityHint={`Tap to view ${label.toLowerCase()}`}
    >
      <Ionicons name={icon} size={24} color="#3372EF" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
};

// Filter Modal Component
const FilterModal = ({
  visible,
  onClose,
  paymentTypes,
  academicYears,
  selectedPaymentType,
  selectedAcademicYear,
  onSelectPaymentType,
  onSelectAcademicYear,
  onApply,
  onClear,
}) => {
  const { width } = useWindowDimensions();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { width: width }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Payments</Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Close filter modal"
            >
              <Ionicons name="close" size={24} color="#333" />
            </Pressable>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Payment Type</Text>
            <View style={styles.filterOptions}>
              {paymentTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    selectedPaymentType === type && styles.selectedFilterOption,
                  ]}
                  onPress={() => onSelectPaymentType(type)}
                  accessibilityLabel={`${type} payment type filter`}
                  accessibilityState={{
                    selected: selectedPaymentType === type,
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedPaymentType === type &&
                        styles.selectedFilterOptionText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Academic Year</Text>
            <View style={styles.filterOptions}>
              {academicYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.filterOption,
                    selectedAcademicYear === year &&
                      styles.selectedFilterOption,
                  ]}
                  onPress={() => onSelectAcademicYear(year)}
                  accessibilityLabel={`${year} academic year filter`}
                  accessibilityState={{
                    selected: selectedAcademicYear === year,
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedAcademicYear === year &&
                        styles.selectedFilterOptionText,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClear}
              accessibilityLabel="Clear filters"
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={onApply}
              accessibilityLabel="Apply filters"
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Finance Component
const Finance = () => {
  const { width, height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState("current");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState("All");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2024-2025");
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [isCedi, setIsCedi] = useState(false); // Currency toggle state
  const [exchangeRate, setExchangeRate] = useState(1); // Default exchange rate
  const [isLoadingRate, setIsLoadingRate] = useState(false); // Loading state for exchange rate

  const academicYears = ["2023-2024", "2024-2025", "2025-2026"];
  const paymentTypes = ["All", "Tuition", "Housing", "Books", "Fees"];

  // Function to fetch exchange rate
  const fetchExchangeRate = async (
    fromCurrency = "USD",
    toCurrency = "GHS"
  ) => {
    setIsLoadingRate(true);
    const API_KEY = "ebd61213c021ff0ac0adf562";
    const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}`;

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate");
      }

      const data = await response.json();
      if (data.result === "success") {
        setExchangeRate(data.conversion_rate);
      } else {
        throw new Error("Invalid response from exchange rate API");
      }
    } catch (error) {
      console.error("Exchange rate error:", error);
      Alert.alert(
        "Exchange Rate Error",
        "Could not fetch the latest exchange rate. Using default rate.",
        [{ text: "OK" }]
      );
      // Fallback to a default rate if API fails
      setExchangeRate(13.5);
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Fetch exchange rate when currency is toggled to GHS
  useEffect(() => {
    if (isCedi) {
      fetchExchangeRate();
    }
  }, [isCedi]);

  const fullPaymentHistory = [
    {
      id: 1,
      date: "Jan 15, 2025",
      amount: 1500.0,
      status: "Paid",
      type: "Tuition",
      academicYear: "2024-2025",
    },
    {
      id: 2,
      date: "Dec 10, 2024",
      amount: 1500.0,
      status: "Paid",
      type: "Tuition",
      academicYear: "2024-2025",
    },
    {
      id: 3,
      date: "Nov 05, 2024",
      amount: 1500.0,
      status: "Paid",
      type: "Tuition",
      academicYear: "2024-2025",
    },
    {
      id: 4,
      date: "Oct 15, 2024",
      amount: 750.0,
      status: "Paid",
      type: "Housing",
      academicYear: "2024-2025",
    },
    {
      id: 5,
      date: "Sep 20, 2024",
      amount: 250.0,
      status: "Paid",
      type: "Books",
      academicYear: "2024-2025",
    },
    {
      id: 6,
      date: "May 15, 2024",
      amount: 1400.0,
      status: "Paid",
      type: "Tuition",
      academicYear: "2023-2024",
    },
  ];

  const fullUpcomingPayments = [
    {
      id: 1,
      dueDate: "Feb 28, 2025",
      amount: 1500.0,
      type: "Tuition",
      academicYear: "2024-2025",
    },
    {
      id: 2,
      dueDate: "Feb 28, 2025",
      amount: 750.0,
      type: "Housing",
      academicYear: "2024-2025",
    },
    {
      id: 3,
      dueDate: "Feb 28, 2025",
      amount: 250.0,
      type: "Books",
      academicYear: "2024-2025",
    },
    {
      id: 4,
      dueDate: "Mar 15, 2025",
      amount: 300.0,
      type: "Fees",
      academicYear: "2024-2025",
    },
  ];

  const [paymentHistory, setPaymentHistory] = useState(fullPaymentHistory);
  const [upcomingPayments, setUpcomingPayments] =
    useState(fullUpcomingPayments);

  // Toggle currency function
  const toggleCurrency = () => {
    setIsCedi(!isCedi);
  };

  const filteredHistory = useMemo(() => {
    return fullPaymentHistory.filter((payment) => {
      const matchesType =
        selectedPaymentType === "All" || payment.type === selectedPaymentType;
      const matchesYear = payment.academicYear === selectedAcademicYear;
      return matchesType && matchesYear;
    });
  }, [selectedPaymentType, selectedAcademicYear]);

  const filteredUpcoming = useMemo(() => {
    return fullUpcomingPayments.filter((payment) => {
      const matchesType =
        selectedPaymentType === "All" || payment.type === selectedPaymentType;
      const matchesYear = payment.academicYear === selectedAcademicYear;
      return matchesType && matchesYear;
    });
  }, [selectedPaymentType, selectedAcademicYear]);

  const totalBalanceDue = useMemo(() => {
    return fullUpcomingPayments
      .reduce((sum, payment) => sum + payment.amount, 0)
      .toFixed(2);
  }, [fullUpcomingPayments]);

  useEffect(() => {
    setPaymentHistory(filteredHistory);
    setUpcomingPayments(filteredUpcoming);
  }, [filteredHistory, filteredUpcoming]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Refresh exchange rate if in cedi mode
    if (isCedi) {
      fetchExchangeRate();
    }

    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, [isCedi]);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    console.log("User logged out");
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
    console.log("Logout cancelled");
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    setSelectedPaymentType("All");
    setSelectedAcademicYear("2024-2025");
  };

  const handlePayNow = () => {
    setPaymentInProgress(true);
    setTimeout(() => {
      setPaymentInProgress(false);
      alert("Payment processed successfully!");
    }, 2000);
  };

  const handleViewStatements = () => {
    console.log("View statements");
  };

  const handlePaymentPlan = () => {
    console.log("View payment plan");
  };

  const handlePaymentMethods = () => {
    console.log("View payment methods");
  };

  const renderPaymentItem = ({ item }) => (
    <PaymentItem
      payment={item}
      isHistory={activeTab === "history"}
      currencySymbol={isCedi ? "₵" : "$"}
      conversionRate={isCedi ? exchangeRate : 1}
    />
  );

  // Calculate header height based on device
  const headerHeight =
    Platform.OS === "ios"
      ? height * 0.13
      : StatusBar.currentHeight + height * 0.08;

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={["#2D5D8A", "#69B1F9", "#4D8AC8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={[styles.header, { height: headerHeight }]}
      >
        <SafeAreaView style={styles.safeHeader}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { fontSize: width * 0.06 }]}>
              Finance
            </Text>
            <View style={styles.headerIcons}>
              <Pressable
                style={styles.iconButton}
                accessibilityLabel="Notifications"
              >
                <BellIcon />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={handleLogout}
                accessibilityLabel="Logout"
              >
                <Ionicons
                  name="power-outline"
                  size={22}
                  color="rgb(219, 3, 43)"
                />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: width * 0.05 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3372EF"]}
          />
        }
      >
        {paymentInProgress && (
          <View style={styles.paymentProcessingOverlay}>
            <View style={styles.paymentProcessingContent}>
              <ActivityIndicator size="large" color="#3372EF" />
              <Text style={styles.paymentProcessingText}>
                Processing payment...
              </Text>
            </View>
          </View>
        )}

        <AccountCard
          totalBalance={totalBalanceDue}
          dueDate="Feb 28, 2025"
          onPayNow={handlePayNow}
          isCedi={isCedi}
          toggleCurrency={toggleCurrency}
          conversionRate={exchangeRate}
          isLoadingRate={isLoadingRate}
        />

        <View style={styles.quickActions}>
          <ActionButton
            icon="document-text-outline"
            label="Statements"
            onPress={handleViewStatements}
          />
          <ActionButton
            icon="calendar-outline"
            label="Payment Plan"
            onPress={handlePaymentPlan}
          />
          <ActionButton
            icon="card-outline"
            label="Payment Methods"
            onPress={handlePaymentMethods}
          />
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.filterInfo}>
            <Text style={styles.filterInfoText}>
              {selectedPaymentType === "All"
                ? "All Payments"
                : selectedPaymentType}{" "}
              • {selectedAcademicYear}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
            accessibilityLabel="Filter payments"
          >
            <Ionicons name="filter-outline" size={18} color="#3372EF" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "current" && styles.activeTab]}
            onPress={() => setActiveTab("current")}
            accessibilityLabel="Upcoming payments tab"
            accessibilityState={{ selected: activeTab === "current" }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "current" && styles.activeTabText,
              ]}
            >
              Upcoming Payments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.activeTab]}
            onPress={() => setActiveTab("history")}
            accessibilityLabel="Payment history tab"
            accessibilityState={{ selected: activeTab === "history" }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "history" && styles.activeTabText,
              ]}
            >
              Payment History
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3372EF" />
            <Text style={styles.loadingText}>Loading payments...</Text>
          </View>
        ) : activeTab === "current" ? (
          <View style={styles.paymentsContainer}>
            {upcomingPayments.length > 0 ? (
              <FlatList
                data={upcomingPayments}
                renderItem={renderPaymentItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <EmptyState type="upcoming" />
            )}
          </View>
        ) : (
          <View style={styles.paymentsContainer}>
            {paymentHistory.length > 0 ? (
              <FlatList
                data={paymentHistory}
                renderItem={renderPaymentItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <EmptyState type="history" />
            )}
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        paymentTypes={paymentTypes}
        academicYears={academicYears}
        selectedPaymentType={selectedPaymentType}
        selectedAcademicYear={selectedAcademicYear}
        onSelectPaymentType={setSelectedPaymentType}
        onSelectAcademicYear={setSelectedAcademicYear}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      <ConfirmationModal
        visible={logoutModalVisible}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FF",
  },
  header: {
    backgroundColor: "#3372EF",
    paddingTop: 0,
  },
  safeHeader: {
    flex: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  paymentProcessingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  paymentProcessingContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  paymentProcessingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  accountCard: {
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden", // Ensures the gradient doesn't bleed out of the rounded corners
    position: "relative", // Required for absolute positioning of children
  },
  cardDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  circle1: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle2: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  cardContent: {
    padding: 20,
    flex: 1,
    justifyContent: "space-between",
  },
  balanceContainer: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.7,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 24,
    color: "#fff",
    marginRight: 5,
  },
  amount: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  currencySymbolRight: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  currencySymbolRightIcon: {
    padding: 5,
    borderRadius: 5,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payButton: {
    backgroundColor: "#3372EF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  logoContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    alignItems: "center",
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  logoText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    color: "#3372EF",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  filterInfo: {
    backgroundColor: "#E4EDFB",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  filterInfoText: {
    color: "#3372EF",
    fontSize: 14,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    color: "#3372EF",
    fontSize: 14,
    marginLeft: 5,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F4F9",
    borderRadius: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7A8FA6",
  },
  activeTabText: {
    color: "#3372EF",
  },
  paymentsContainer: {
    flex: 1,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  paymentDate: {
    fontSize: 14,
    color: "#7A8FA6",
  },
  paymentAmount: {
    alignItems: "flex-end",
  },
  paymentAmountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#C5CEE0",
    marginTop: 10,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: "#7A8FA6",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    maxWidth: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#F0F4F9",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilterOption: {
    backgroundColor: "#3372EF",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#7A8FA6",
  },
  selectedFilterOptionText: {
    color: "#fff",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3372EF",
  },
  clearButtonText: {
    color: "#3372EF",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: "#3372EF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Finance;
