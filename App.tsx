// App.tsx
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BootSplash from "react-native-bootsplash"; // 👈 add this

import MainTabs from "./src/navigation/MainTabs";
import PaypalScreen from "./src/screens/PaypalScreen";

import { AuthProvider } from "./src/context/AuthContext";
import { LanguageProvider } from "./src/context/LanguageContext";

export type RootStackParamList = {
  Tabs: undefined;
  Paypal: { level?: "A1" | "A2" | "B1" };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

function AppNavigation() {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Tabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        <RootStack.Screen
          name="Paypal"
          component={PaypalScreen}
          options={{ title: "Pay with PayPal" }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  // 👇 hide native splash when React side is ready
  useEffect(() => {
    BootSplash.hide({ fade: true }); // you can remove fade if you want instant hide
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <LanguageProvider>
          <SafeAreaProvider>
            <AppNavigation />
          </SafeAreaProvider>
        </LanguageProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
