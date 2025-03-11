import React, { useState, useMemo, createContext, useContext } from "react";
import { Text } from "react-native";

// Create a context to share the registered courses state
const CoursesContext = createContext();

export const useCoursesContext = () => useContext(CoursesContext);

// Credits component that calculates total credits from registered courses
export const Credits = () => {
  const coursesContext = useCoursesContext();

  // If context isn't available (like when rendering on HomeScreen), return default value
  if (!coursesContext) {
    return <Text>0</Text>;
  }

  const { courses, registeredCourses } = coursesContext;

  // Calculate total credits based on registered courses
  const totalCredits = courses
    .filter((course) => registeredCourses.includes(course.code))
    .reduce((sum, course) => {
      // Extract the numeric value from the credit string (e.g., "3 Credit Hours" -> 3)
      const creditValue = parseInt(course.credit.split(" ")[0]) || 0;
      return sum + creditValue;
    }, 0);

  return <Text>{totalCredits}</Text>;
};

// Provider component to wrap the app
export const CoursesProvider = ({ children }) => {
  const [registeredCourses, setRegisteredCourses] = useState([]);

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

  const contextValue = {
    courses,
    registeredCourses,
    setRegisteredCourses,
  };

  return (
    <CoursesContext.Provider value={contextValue}>
      {children}
    </CoursesContext.Provider>
  );
};
