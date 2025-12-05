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

import HomeScreen from "../screens/HomeScreen";
import LearnScreen from "../screens/LearnScreen";
import QuizScreen from "../screens/QuizScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChapterScreen from "../screens/ChapterScreen";
import QuizCardsScreen from "../screens/QuizCardsScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import SpeakingLoungeScreen from "../screens/SpeakingLoungeScreen";
import PerformanceScreen from "../screens/PerformanceScreen";

import { Icons } from "../components/Icons"; // ✅ your custom SVG icons

// ---------- Tab types ----------
type RootTabParamList = {
  Home: undefined;
  Learn: undefined;
  Quiz: undefined;
  Community: undefined;
  Profile: undefined;
};

// ---------- Stack types ----------
type LearnStackParamList = {
  LearnMain: undefined;
  Chapter: { number?: number; level?: string };
  SpeakingLounge: undefined;
};

type QuizStackParamList = {
  QuizMain: undefined;
  QuizCards: { number?: number; level?: string };
};

type ProfileStackParamList = {
  ProfileMain: undefined;
  Performance: undefined;
  Subscription: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const LearnStack = createNativeStackNavigator<LearnStackParamList>();
const QuizStack = createNativeStackNavigator<QuizStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// ---------- Learn stack ----------
function LearnStackNavigator() {
  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false }}>
      <LearnStack.Screen name="LearnMain" component={LearnScreen} />
      <LearnStack.Screen name="Chapter" component={ChapterScreen} />
      <LearnStack.Screen
        name="SpeakingLounge"
        component={SpeakingLoungeScreen}
      />
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

// ---------- Profile stack ----------
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Performance" component={PerformanceScreen} />
      <ProfileStack.Screen name="Subscription" component={SubscriptionScreen} />
    </ProfileStack.Navigator>
  );
}

// ---------- NEW: SVG Icon Mapper ----------
const getTabIconComponent = (routeName: keyof RootTabParamList) => {
  switch (routeName) {
    case "Home":
      return Icons.Icon8;
    case "Learn":
      return Icons.Icon1;
    case "Quiz":
      return Icons.Icon3;
    case "Community":
      return Icons.Icon4;
    case "Profile":
      return Icons.Icon9;
    default:
      return Icons.Icon14;
  }
};

// ---------- Options factory ----------
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
    tabBarActiveTintColor: "#2563EB",
    tabBarInactiveTintColor: "#9CA3AF",
    tabBarIcon: ({ color, size = 24 }) => {
      const Icon = getTabIconComponent(route.name);
      return <Icon width={size} height={size} fill={color} />;
    },
  });

// ---------- Main tabs ----------
export default function MainTabs() {
  const insets = useSafeAreaInsets();

  const screenOptions = useMemo(() => createScreenOptions(insets), [insets]);

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
      <Tab.Screen
        name="Community"
        component={SpeakingLoungeScreen}
        options={{ title: "Community" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}
