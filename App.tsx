// App.tsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import QuizScreen from './src/screens/QuizScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChapterScreen from './src/screens/ChapterScreen';
import QuizCardsScreen from './src/screens/QuizCardsScreen';
import { AuthProvider } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const LearnStack = createNativeStackNavigator();
const QuizStack = createNativeStackNavigator();

// ---------- STACKS ----------
function LearnStackNavigator() {
  return (
    <LearnStack.Navigator>
      <LearnStack.Screen
        name="LearnHome"
        component={LearnScreen}
        options={{ title: 'Learn' }}
      />
      <LearnStack.Screen
        name="Chapter"
        component={ChapterScreen}
        options={({ route }: any) => ({
          title: `Chapter ${route.params?.number ?? ''}`,
        })}
      />
    </LearnStack.Navigator>
  );
}

function QuizStackNavigator() {
  return (
    <QuizStack.Navigator>
      <QuizStack.Screen
        name="QuizHome"
        component={QuizScreen}
        options={{ title: 'Quiz' }}
      />
      <QuizStack.Screen
        name="QuizCards"
        component={QuizCardsScreen}
        options={({ route }: any) => ({
          title: `Chapter ${route.params?.number ?? ''} Quiz`,
        })}
      />
    </QuizStack.Navigator>
  );
}

// ---------- SEPARATE ICON RENDERER ----------
type TabBarIconProps = {
  routeName: string;
  color: string;
  size: number;
  focused: boolean;
};

function TabBarIcon({ routeName, color, size, focused }: TabBarIconProps) {
  let iconName: string = 'home-outline';

  if (routeName === 'Home') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (routeName === 'Learn') {
    iconName = focused ? 'book' : 'book-outline';
  } else if (routeName === 'Quiz') {
    iconName = focused ? 'help-circle' : 'help-circle-outline';
  } else if (routeName === 'Profile') {
    iconName = focused ? 'person' : 'person-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
}

// ---------- MAIN APP ----------
export default function App() {
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '978636197840-ubshs2i4lf66ln4fo3oisvp6tj4uq5i4.apps.googleusercontent.com',
    });
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginBottom: 3,
            },
            tabBarStyle: {
              height: 60,
              paddingBottom: 6,
              backgroundColor: '#ffffff',
              borderTopWidth: 0.5,
              borderTopColor: '#d1d5db',
            },
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#6b7280',
            tabBarIcon: ({ color, size, focused }) => (
              <TabBarIcon
                routeName={route.name}
                color={color}
                size={size}
                focused={focused}
              />
            ),
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Learn" component={LearnStackNavigator} />
          <Tab.Screen name="Quiz" component={QuizStackNavigator} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
