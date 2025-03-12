import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import React, { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export const Credits = () => {
  return <Text>15</Text>;
};

const Academics = () => {
  const [activeOption, setActiveOption] = useState("Courses");
  const [registeredCourses, setRegisteredCourses] = useState([]);

  const handleSelect = (option) => {
    setActiveOption(option);
  };

  const courseCodes = useMemo(() => [
    {
      
    }

  ] )

  const courses = useMemo(
    () => [
      {
        title: "Data Communication",
        code: "IT 431",
        credit: "3 Credit Hours",
      },
      {
        title: "Visual Basic .Net Programming",
        code: "IT 201",
        credit: "3 Credit Hours",
      },
      {
        title: "Internet and Information Security",
        code: "IT 253",
        credit: "3 Credit Hours",
      },
      {
        title: "Computer Architecture",
        code: "IT 231",
        credit: "3 Credit Hours",
      },
      {
        title: "Systems Administration",
        code: "IT 212",
        credit: "3 Credit Hours",
      },
    ],
    []
  );

  const handleRegisterCourse = (courseCode) => {
    if (registeredCourses.includes(courseCode)) {
      setRegisteredCourses(
        registeredCourses.filter((code) => code !== courseCode)
      );
    } else {
      setRegisteredCourses([...registeredCourses, courseCode]);
    }
  };

  const handleSelectAll = () => {
    if (registeredCourses.length === courses.length) {
      // If all courses are already selected, deselect all
      setRegisteredCourses([]);
    } else {
      // Otherwise, select all courses
      setRegisteredCourses(courses.map((course) => course.code));
    }
  };

  const areAllCoursesSelected = registeredCourses.length === courses.length;

  const CourseCard = React.memo(({ title, code, credit }) => {
    const isRegistered = registeredCourses.includes(code);

    return (
      <View style={styles.courseCard}>
        <View style={styles.codeContainer}>
          <Text style={styles.courseCode}>{code}</Text>
        </View>
        <View style={styles.courseDetails}>
          <Text style={styles.courseTitle}>{title}</Text>
          <Text style={styles.creditHours}>{credit}</Text>
        </View>
        <Pressable
          style={[
            styles.registerButton,
            isRegistered && styles.registeredButton,
          ]}
          onPress={() => handleRegisterCourse(code)}
        >
          <Ionicons
            name={isRegistered ? "checkmark-circle" : "add-circle-outline"}
            size={24}
            color={isRegistered ? "#fff" : "rgb(71, 131, 235)"}
          />
        </Pressable>
      </View>
    );
  });

  const SelectAllHeader = () => (
    <View style={styles.selectAllContainer}>
      <Text style={styles.selectAllText}>
        {`${registeredCourses.length} of ${courses.length} Courses Selected`}
      </Text>
      <Pressable
        style={[
          styles.selectAllButton,
          areAllCoursesSelected && styles.selectAllActive,
        ]}
        onPress={handleSelectAll}
      >
        <Text
          style={[
            styles.selectAllButtonText,
            areAllCoursesSelected && styles.selectAllButtonTextActive,
          ]}
        >
          {areAllCoursesSelected ? "Deselect All" : "Select All"}
        </Text>
      </Pressable>
    </View>
  );

  const renderContent = () => {
    switch (activeOption) {
      case "Courses":
        return (
          <FlatList
            data={courses}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <CourseCard
                title={item.title}
                code={item.code}
                credit={item.credit}
              />
            )}
            ListHeaderComponent={<SelectAllHeader />}
            ListHeaderComponentStyle={styles.listHeader}
            contentContainerStyle={styles.coursesList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
            bounces={true}
            overScrollMode="always"
            decelerationRate={Platform.OS === "ios" ? "normal" : 0.98}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
        );
      case "Exams":
        return (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyText}>
              Exam timetable will appear here
            </Text>
          </View>
        );
      case "Results":
        return (
          <View style={styles.emptyContent}>
            <Text style={styles.emptyText}>Your results will appear here</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1075E9" barStyle="light-content"  />
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Academics</Text>
          <View style={styles.noteWrapper}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="rgb(254, 178, 0)"
            />
            <Text style={styles.noteText}>
              Register courses, view exams timetable, and results
            </Text>
          </View>
        </View>
        <View style={styles.selectBox}>
          {["Courses", "Exams", "Results"].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.selectOption,
                activeOption === option && styles.active,
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  activeOption === option && styles.activeText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.content}>{renderContent()}</View>
      </SafeAreaView>
    </View>
  );
};

export default Academics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: "rgb(6, 88, 160)",
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    left: "4%",
    color: "#fff",
  },
  noteWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  noteText: {
    color: "rgb(255, 255, 255)",
    fontWeight: "300",
    fontSize: 14,
    fontFamily: "calibri",
  },
  selectBox: {
    flexDirection: "row",
    alignSelf: "center",
    width: "80%",
    height: 50,
    backgroundColor: "rgb(214, 219, 227)",
    borderWidth: 0.3,
    borderColor: "rgba(0,0,0,0.4)",
    marginTop: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
  },
  selectOption: {
    flex: 1,
    borderRightWidth: 0.5,
    borderColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    textAlign: "center",
    color: "rgb(71, 131, 235)",
    fontSize: 15,
    fontWeight: "600",
  },
  active: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  activeText: {
    color: "white",
  },
  content: {
    flex: 1,
    backgroundColor: "rgb(241, 241, 241)",
    padding: 16,
  },
  coursesList: {
    paddingBottom: 20,
  },
  selectAllContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  selectAllText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectAllButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgb(71, 131, 235)",
  },
  selectAllActive: {
    backgroundColor: "rgba(5, 170, 35, 0.63)",
  },
  selectAllButtonText: {
    color: "rgb(71, 131, 235)",
    fontWeight: "600",
    fontSize: 14,
  },
  selectAllButtonTextActive: {
    color: "#fff",
  },
  listHeader: {
    marginBottom: 8,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: "rgb(6, 88, 160)",
    height: 80, // Fixed height to ensure consistent sizing
  },
  codeContainer: {
    backgroundColor: "rgba(6, 88, 160, 0.1)",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  courseCode: {
    fontWeight: "bold",
    color: "rgb(6, 88, 160)",
    textAlign: "center",
    fontSize: 15,
  },
  courseDetails: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  creditHours: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  registerButton: {
    backgroundColor: "#f2f2f2",
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  registeredButton: {
    backgroundColor: "rgba(5, 170, 35, 0.63)",
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
  },
});
