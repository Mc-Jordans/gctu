import { Stack } from "expo-router";
import { StatusBar } from "react-native";

 function RootLayout() {
   return (
     <>
       <Stack>
         <Stack.Screen
           name="index"
           options={{ headerShown: false }}
         ></Stack.Screen>
         <Stack.Screen
           name="tabs"
           options={{
             headerShown: false,
 }}
         ></Stack.Screen>
       </Stack>
     </>
   );
}

export default RootLayout;