"use client";

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
  useWindowDimensions, // Add this import
  Platform,
  Alert,
} from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BellIcon from "../../assets/SVG/bell";
import ConfirmationModal from "../components/ConfirmationModal";
import { DollarSign } from "lucide-react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Big from "big.js";

// Exchange rate constant (1 USD = 13.5 GHS)
const USD_TO_GHS_RATE = 13.5;

// API Configuration
const API_KEY = Constants.expoConfig?.extra?.exchangeRateApiKey;
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair`;

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
  isLoadingRate, // Add this prop
}) => {
  const { width } = useWindowDimensions();
  const displayAmount = isCedi
    ? new Big(totalBalance).times(conversionRate).toFixed(2)
    : totalBalance;

  return (
    <LinearGradient
      colors={["#2D5D8A", "#4D8AC8", "#69B1F9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.accountCard, { height: width * 0.55 }]}
    >
      <View style={styles.cardDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.balanceContainer}>
          <Text style={styles.cardTitle}>Account Statement</Text>
          <Text style={styles.cardDescription}>Balance Due</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>{isCedi ? "₵" : "$"}</Text>
            <Text style={styles.amount}>{displayAmount}</Text>
          </View>

          <View style={styles.currencySymbolRight}>
            <TouchableOpacity
              style={styles.currencySymbolRightIcon}
              onPress={toggleCurrency}
            >
              {isCedi ? (
                <Text
                  style={{ fontSize: 20, color: "#fff", fontWeight: "bold" }}
                >
                  ₵
                </Text>
              ) : (
                <DollarSign size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          {isLoadingRate && (
            <View style={styles.rateLoading}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.rateLoadingText}>Updating rate...</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomRow}>
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
  const [isCedi, setIsCedi] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(USD_TO_GHS_RATE);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const academicYears = ["2023-2024", "2024-2025", "2025-2026"];
  const paymentTypes = ["All", "Tuition", "Housing", "Books", "Fees"];

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

  // Function to fetch exchange rate

  const fetchWithRetry = async (url, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        return response;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error; // Throw on last retry
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error("All retries failed"); // Ensure a return or throw
  };

  const fetchExchangeRate = async (from = "USD", to = "GHS") => {
    if (!API_KEY) {
      console.error("Exchange rate API key is missing");
      setExchangeRate(USD_TO_GHS_RATE);
      Alert.alert(
        "Configuration Error",
        "API key is missing. Using default rate."
      );
      return;
    }

    setIsLoadingRate(true);
    let cacheTime;
    try {
      const cachedRate = await AsyncStorage.getItem("exchangeRate");
      cacheTime = await AsyncStorage.getItem("exchangeRateTime");
      const isFresh = cacheTime && Date.now() - parseInt(cacheTime) < 3600000;

      if (cachedRate && isFresh) {
        setExchangeRate(parseFloat(cachedRate));
        return;
      }

      const response = await fetchWithRetry(`${API_URL}/${from}/${to}`);
      const data = await response.json();

      if (data.result === "success") {
        setExchangeRate(data.conversion_rate);
        await AsyncStorage.setItem(
          "exchangeRate",
          data.conversion_rate.toString()
        );
        await AsyncStorage.setItem("exchangeRateTime", Date.now().toString());
      } else {
        throw new Error("API response unsuccessful");
      }
    } catch (error) {
      console.error("Exchange rate fetch failed:", error);
      setExchangeRate(USD_TO_GHS_RATE);
      Alert.alert(
        "Rate Update Failed",
        `Using cached rate. Last updated: ${
          cacheTime ? new Date(parseInt(cacheTime)).toLocaleTimeString() : "N/A"
        }`
      );
    } finally {
      setIsLoadingRate(false);
    }
  };

  const toggleCurrency = () => {
    const newIsCedi = !isCedi;
    setIsCedi(newIsCedi);
    if (newIsCedi) {
      fetchExchangeRate("USD", "GHS");
    }
  };

  useEffect(() => {
    fetchExchangeRate("USD", "GHS");
  }, []);

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
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

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
      conversionRate={exchangeRate}
    />
  );

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
          isLoadingRate={isLoadingRate} // Pass the loading state
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

export default Finance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  header: {
    justifySelf: "flex-end", // Align content to bottom of header
    alignContent: 'flex-end',
  },
  safeHeader: {
    width: "100%",
    justifyContent:"center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontWeight: "600",
    color: "#fff",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 15,
  },
  iconButton: {
    padding: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  logoutButton: {
    padding: 5,
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
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  accountCard: {
    width: "100%",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10, // Android shadow
  },

  // Decorative elements
  cardDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: -70,
    right: -50,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -100,
    left: -80,
  },

  // Card content
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 1,
  },
  balanceContainer: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },

  currencySymbolRight: {
    position: "absolute",
    right: 10,
    backgroundColor: "rgba(255, 255, 255,0.3)",
    borderRadius: 10,
    paddingHorizontal: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  currencySymbolRightIcon: {
    position: "absolute",
    right: -5,
    borderRadius: 10,
    paddingHorizontal: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(104, 101, 101, 0.43)",
  },

  cardDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 20,
    marginTop: 20,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginRight: 4,
    marginBottom: 3,
  },
  amount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  detailLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
    marginLeft: 6,
    marginRight: 4,
  },
  detailText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },

  // Bottom section
  bottomRow: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    right: 0,
    position: "absolute",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 2,
  },

  // Logo section
  logoContainer: {
    position: "absolute",
    bottom: -16,
    left: -10,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  logoImage: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionText: {
    color: "#333",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  filterInfo: {
    flex: 1,
  },
  filterInfoText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9EFFD",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 5,
  },
  filterButtonText: {
    fontSize: 13,
    color: "#3372EF",
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#E9EFFD",
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#3372EF",
    fontWeight: "600",
  },
  paymentsContainer: {
    marginBottom: 20,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 13,
    color: "#777",
  },
  paymentAmount: {
    alignItems: "flex-end",
  },
  paymentAmountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F0F4F8",
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: "#E1EBFF",
    borderColor: "#3372EF",
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    color: "#555",
  },
  selectedFilterOptionText: {
    color: "#3372EF",
    fontWeight: "600",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  applyButton: {
    flex: 2,
    backgroundColor: "#3372EF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#8F9BB3",
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  paymentProcessingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  paymentProcessingContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: "80%",
  },
  paymentProcessingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  rateLoading: {
    position: "absolute",
    right: 60,
    top: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 5,
    borderRadius: 5,
  },
  rateLoadingText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 5,
  },
});
