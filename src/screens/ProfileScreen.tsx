// src/screens/ProfileScreen.tsx
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GoogleSignin,
  SignInResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Card, Button as PaperButton } from 'react-native-paper';

import api from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { Icons } from '../components/Icons';

const API = 'https://dictserver-main.vercel.app';
const WEB_CLIENT_ID =
  '978636197840-ubshs2i4lf66ln4fo3oisvp6tj4uq5i4.apps.googleusercontent.com';

// ------------ Icon components (outside ProfileScreen to satisfy eslint) ------------
const GoogleIcon = () => <Icons.Icon16 width={36} height={36} />;
const PerformanceIcon = () => <Icons.Icon5 width={36} height={36} />;
const SubscriptionIcon = () => <Icons.Icon6 width={36} height={36} />;
const LogoutIcon = () => <Icons.Icon7 width={36} height={36} />;

export default function ProfileScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(false);
  const [googlePhoto, setGooglePhoto] = useState<string | null>(null);

  const navigation = useNavigation<any>();
  const { user, setAuthFromBackend, logout } = useContext(AuthContext);

  const isLoggedIn = !!user;

  // Google setup
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  // Fetch user role
  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      return;
    }
    try {
      setLoadingRole(true);
      const res = await api.get('/users/role/me');
      setRole(res.data?.role || null);
    } catch (err: any) {
      console.log('role fetch error:', err?.response?.data || err.message);
      setRole(null);
    } finally {
      setLoadingRole(false);
    }
  }, [user]);

  // Whenever user changes, (re)load role
  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  // LOGIN
  const handleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response: SignInResponse = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return;

      const googleUser = response.data.user;
      setGooglePhoto(googleUser.photo ?? null);

      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;
      if (!idToken) throw new Error('No Google ID token');

      const result = await axios.post(API + '/auth/google', { idToken });

      const backendUser = result.data.user;
      const jwtToken = result.data.token;

      if (!backendUser?.email || !jwtToken) {
        throw new Error('Invalid backend response');
      }

      await setAuthFromBackend(backendUser, jwtToken);
      await fetchRole();

      Alert.alert('Success', 'You are logged in!');
    } catch (err) {
      console.log('Google login error:', err);
      Alert.alert('Login failed', 'Could not sign in with Google');
    }
  };

  // LOGOUT
  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (err) {
      console.log('Google signOut error:', err);
    }
    await logout();
    setRole(null);
    setGooglePhoto(null);
  };

  // Determine Enrollment Status
  let enrollmentStatus = 'Not logged in';
  if (isLoggedIn) {
    if (loadingRole) {
      enrollmentStatus = 'Checking enrollment…';
    } else if (
      role === 'admin' ||
      role === 'customer' ||
      role === 'customer2' ||
      role === 'customer3'
    ) {
      enrollmentStatus = 'Enrolled';
    } else {
      enrollmentStatus = 'Not enrolled';
    }
  }

  const avatarSource = user?.photoURL || googlePhoto || null;

  const hasEnrollment =
    enrollmentStatus === 'Enrolled' ||
    enrollmentStatus === 'Checking enrollment…';

  return (
    <SafeAreaView style={styles.container}>
      {/* ---------- PROFILE HEADER ---------- */}
      <View style={styles.headerCard}>
        {avatarSource ? (
          <Image source={{ uri: avatarSource }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            {/* SVG avatar icon instead of letter */}
            <Icons.Icon1 width={46} height={46} />
          </View>
        )}

        <Text style={styles.nameText}>
          {user?.name || 'Welcome to AusbildungFit'}
        </Text>

        <Text style={styles.emailText}>
          {user?.email || 'Please sign in to continue'}
        </Text>

        <View
          style={[
            styles.statusBadge,
            enrollmentStatus === 'Enrolled'
              ? styles.statusEnrolled
              : styles.statusNotEnrolled,
          ]}
        >
          <Text style={styles.statusText}>{enrollmentStatus}</Text>
        </View>

        {!isLoggedIn && (
          <PaperButton
            mode="contained"
            buttonColor="#2563EB"
            labelStyle={styles.primaryButtonLabel}
            style={styles.signInButton}
            icon={GoogleIcon}
            onPress={handleSignIn}
          >
            Sign in with Google
          </PaperButton>
        )}
      </View>

      {isLoggedIn && (
        <>
          {/* ---------- MY LEARNING ---------- */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content>
              <View style={styles.titleRow}>
                <View style={styles.svgIconWrapper}>
                  <Icons.Icon3 width={36} height={36} />
                </View>
                <Text style={styles.sectionTitle}>My Learning</Text>
              </View>

              <Text style={styles.sectionSubtitle}>
                Track your progress & manage your course access.
              </Text>

              <View style={styles.buttonRow}>
                <PaperButton
                  mode="outlined"
                  textColor="#2563EB"
                  labelStyle={styles.secondaryButtonLabel}
                  style={styles.secondaryButton}
                  icon={PerformanceIcon}
                  onPress={() => navigation.navigate('Performance')}
                >
                  Performance
                </PaperButton>

                <PaperButton
                  mode="outlined"
                  textColor="#2563EB"
                  labelStyle={styles.secondaryButtonLabel}
                  style={styles.secondaryButton}
                  icon={SubscriptionIcon}
                  onPress={() => navigation.navigate('Subscription')}
                >
                  Subscription
                </PaperButton>
              </View>

              {!hasEnrollment && !loadingRole && (
                <Text style={styles.helperText}>
                  Purchase a course to unlock full access for your level.
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* ---------- ACCOUNT / SIGN OUT ---------- */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content>
              <View style={styles.titleRow}>
                <View style={styles.svgIconWrapper}>
                  <Icons.Icon4 width={36} height={36} />
                </View>
                <Text style={styles.sectionTitle}>Account</Text>
              </View>

              <Text style={styles.sectionSubtitle}>
                You are signed in with Google. You can sign out anytime.
              </Text>

              <PaperButton
                mode="outlined"
                textColor="#DC2626"
                labelStyle={styles.logoutButtonLabel}
                style={styles.logoutButton}
                icon={LogoutIcon}
                onPress={handleSignOut}
              >
                Sign out
              </PaperButton>
            </Card.Content>
          </Card>
        </>
      )}
    </SafeAreaView>
  );
}

//
// ------------------------- STYLES -------------------------
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    padding: 16,
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
    marginBottom: 20,
  },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 50,
    marginBottom: 10,
  },

  avatarPlaceholder: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  nameText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },

  emailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },

  statusEnrolled: {
    backgroundColor: '#D1FAE5',
  },

  statusNotEnrolled: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },

  signInButton: {
    marginTop: 14,
    borderRadius: 999,
  },

  primaryButtonLabel: {
    color: 'white',
    fontWeight: '600',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingBottom: 10,
    marginBottom: 14,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  svgIconWrapper: {
    width: 24,
    height: 24,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },

  buttonRow: {
    flexDirection: 'row',
    columnGap: 10,
  },

  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderColor: '#2563EB',
  },

  secondaryButtonLabel: {
    fontWeight: '600',
    color: '#2563EB',
  },

  helperText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },

  logoutButton: {
    borderRadius: 999,
    borderColor: '#DC2626',
    marginTop: 4,
  },

  logoutButtonLabel: {
    color: '#DC2626',
    fontWeight: '600',
  },
});
