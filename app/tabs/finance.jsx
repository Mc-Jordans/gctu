import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationIcon from "../../assets/SVG/NotificationIcon";
import DetailsIcon from "../../assets/SVG/DetailsIcon";
import ProfileIcon from "../../assets/SVG/ProfileIcon";

const home = () => {
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={{
          textAlign: 'center',
          fontSize: 20,
          color:'#fff'
        }}>Finance</Text>
      </View>
        <ScrollView style={styles.scrollView}>
          <LinearGradient
            colors={["#3E6993", "#69B1F9"]}
            start={{ x: 0, y: 1 }} // Bottom-left
            end={{ x: 1, y: 0 }} // Top-right (45-degree angle)
            style={styles.AccountCard}
          >
            <View style={styles.topLine}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>Account Statement</Text>
                <Text style={styles.cardDescription}>Total Balance Due</Text>
              </View>
              <View style={styles.currency}>
                <Text style={styles.currencyText}>$</Text>
              </View>
            </View>
            <View style={styles.midLine}>
              <Text style={styles.amount}>4,500.00</Text>
            </View>
            <View style={styles.bottomLine}>
              <View style={styles.season}>
                <Text style={styles.seasonText}>Spring 2025</Text>
              </View>
              <View style={styles.cardTime}>
                <View style={styles.dueDate}>
                  <Text style={{ color: "rgb(199, 12, 74)", fontSize: 12 }}>
                    Due
                  </Text>
                  <Text style={styles.dueDateText}>Feb 28 , 2025</Text>
                </View>
                <View style={styles.semester}>
                  <Text style={styles.semesterText}>Current Semester</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
    </SafeAreaView>
  );
};

export default home;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    backgroundColor: "rgb(51, 114, 239)",
    padding:10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
    margin: "5%",
  },

  AccountCard: {
    position: "relative",
    width: "100%",
    height: 219,
    flexDirection: "column",
    gap: 10,
    padding: 20,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },

  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  cardHead: {
    flexDirection: "column",
    gap: 15,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "semi-bold",
  },

  cardDescription: {
    fontSize: 12,
    fontWeight: "300",
    color: "#fff",
  },

  currencyText: {
    fontSize: 24,
    fontWeight: "semi-bold",
    color: "#333",
  },

  midLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },

  amount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  bottomLine: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 14,
    marginTop: 10,
    marginBottom: 10,
  },

  cardTime: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dueDate: {
    flexDirection: "row",
    gap: 6,
  },

  dueDateText: {
    fontSize: 12,
    color: "rgba(28, 27, 27, 0.85)",
  },
  seasonText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },

  semester: {
    backgroundColor: "rgba(25, 97, 205, 0.23)",
    paddingHorizontal: 10,
    right: -10,
    borderRadius: 10,
  },

  semesterText: {
    fontSize: 12,
    color: "rgba(16, 20, 203, 0.8)",
  },
});
