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
import SubscriptionScreen from "../screens/SubscriptionScreen";
import SpeakingLoungeScreen from "../screens/SpeakingLoungeScreen";
import PerformanceScreen from "../screens/PerformanceScreen";

// ---------- Tab types ----------
type RootTabParamList = {
  Home: undefined;
  Learn: undefined;
  Quiz: undefined;
  Community: undefined; // 👈 bottom tab for community chat / speaking lounge
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
      {/* Still available from Learn (e.g. SpeakingRoomFab) */}
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

// ---------- Profile stack (Profile + Performance + Subscription) ----------
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Performance" component={PerformanceScreen} />
      <ProfileStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
      />
    </ProfileStack.Navigator>
  );
}

// ---------- Icon helper ----------
const getTabIconName = (
  routeName: keyof RootTabParamList,
  focused: boolean
) => {
  switch (routeName) {
    case "Home":
      return "home";
    case "Learn":
      return "menu-book";
    case "Quiz":
      return focused ? "quiz" : "help-outline";
    case "Community":
      return "forum"; // 👈 community chat / speaking icon
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
      {/* 👇 New community tab using SpeakingLoungeScreen */}
      <Tab.Screen
        name="Community"
        component={SpeakingLoungeScreen}
        options={{ title: "Community" }}
      />
      {/* 👇 Profile tab with nested stack: Profile, Performance, Subscription */}
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}
