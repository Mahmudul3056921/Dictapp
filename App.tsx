// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import MainTabs from "./src/navigation/MainTabs";

import { AuthProvider } from "./src/context/AuthContext";
import { LanguageProvider } from "./src/context/LanguageContext";

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <LanguageProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <MainTabs />
            </NavigationContainer>
          </SafeAreaProvider>
        </LanguageProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
