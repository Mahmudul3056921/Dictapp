// src/navigation/MainTabs.tsx
import React, { useMemo } from "react";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  useSafeAreaInsets,
  type EdgeInsets,
} from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import HomeScreen from "../screens/HomeScreen";
import LearnScreen from "../screens/LearnScreen";
import QuizScreen from "../screens/QuizScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChapterScreen from "../screens/ChapterScreen";
import QuizCardsScreen from "../screens/QuizCardsScreen";

// ---------- Tab types ----------
type RootTabParamList = {
  Home: undefined;
  Learn: undefined;
  Quiz: undefined;
  Profile: undefined;
};

// ---------- Stack types ----------
type LearnStackParamList = {
  LearnMain: undefined;
  Chapter: { number?: number; level?: string };
};

type QuizStackParamList = {
  QuizMain: undefined;
  QuizCards: { number?: number; level?: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const LearnStack = createNativeStackNavigator<LearnStackParamList>();
const QuizStack = createNativeStackNavigator<QuizStackParamList>();

// ---------- Learn stack ----------
function LearnStackNavigator() {
  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false }}>
      <LearnStack.Screen name="LearnMain" component={LearnScreen} />
      <LearnStack.Screen name="Chapter" component={ChapterScreen} />
    </LearnStack.Navigator>
  );
}

// ---------- Quiz stack ----------
function QuizStackNavigator() {
  return (
    <QuizStack.Navigator screenOptions={{ headerShown: false }}>
      <QuizStack.Screen name="QuizMain" component={QuizScreen} />
      <QuizStack.Screen name="QuizCards" component={QuizCardsScreen} />
    </QuizStack.Navigator>
  );
}

// ---------- Icon helper ----------
const getTabIconName = (routeName: keyof RootTabParamList, focused: boolean) => {
  switch (routeName) {
    case "Home":
      return "home";
    case "Learn":
      return "menu-book";
    case "Quiz":
      return focused ? "quiz" : "help-outline";
    case "Profile":
      return focused ? "person" : "person-outline";
    default:
      return "circle";
  }
};

// ---------- Options factory (outside component for eslint) ----------
const createScreenOptions =
  (insets: EdgeInsets) =>
  ({
    route,
  }: {
    route: { name: keyof RootTabParamList };
  }): BottomTabNavigationOptions => ({
    headerShown: false,
    tabBarShowLabel: true,
    tabBarLabelStyle: { fontSize: 11 },
    tabBarStyle: {
      backgroundColor: "#fff",
      borderTopWidth: 0.5,
      borderTopColor: "#d1d5db",
      height: 54 + insets.bottom,
      paddingBottom: insets.bottom,
      paddingTop: 6,
    },
    tabBarActiveTintColor: "#2563eb",
    tabBarInactiveTintColor: "#9ca3af",
    tabBarIcon: ({ color, size = 22, focused }) => {
      const iconName = getTabIconName(route.name, focused);
      return <MaterialIcons name={iconName} size={size} color={color} />;
    },
  });

// ---------- Main tabs ----------
export default function MainTabs() {
  const insets = useSafeAreaInsets();

  const screenOptions = useMemo(
    () => createScreenOptions(insets),
    [insets]
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Learn"
        component={LearnStackNavigator}
        options={{ title: "Learn" }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizStackNavigator}
        options={{ title: "Quiz" }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
