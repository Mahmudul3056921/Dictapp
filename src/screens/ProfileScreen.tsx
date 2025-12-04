// src/screens/ProfileScreen.tsx
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GoogleSignin,
  SignInResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import axios from 'axios';
import api from '../api/client';
import { AuthContext } from '../context/AuthContext';

const API = 'https://dictserver-main.vercel.app';

const WEB_CLIENT_ID =
  '978636197840-ubshs2i4lf66ln4fo3oisvp6tj4uq5i4.apps.googleusercontent.com';

type GoogleUser = {
  id: string;
  name: string | null;
  email: string | null;
  photo: string | null;
};

export default function ProfileScreen() {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(false);

  const { setAuthFromBackend, user, logout } = useContext(AuthContext);

  // 👉 Google Signin setup (only once)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  // 👉 Backend থেকে role লোড (wrapped in useCallback for stable reference)
  const fetchRole = useCallback(async () => {
    try {
      setLoadingRole(true);
      const res = await api.get('/users/role/me'); // api already sends token
      setRole(res.data?.role || null);
    } catch (e: any) {
      console.log('role fetch error:', e?.response?.data || e.message);
      setRole(null);
    } finally {
      setLoadingRole(false);
    }
  }, []);

  // যখন context-এর user বদলায়, তখন googleUser + role আপডেট
  useEffect(() => {
    if (user) {
      setGoogleUser({
        id: user.email,
        name: user.name ?? null,
        email: user.email,
        photo: user.photoURL ?? null,
      });
      fetchRole();
    } else {
      setGoogleUser(null);
      setRole(null);
    }
  }, [user, fetchRole]);

  const handleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      const response: SignInResponse = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return;

      const u: any = response.data.user;

      // 👉 1) Google basic info temporarily রাখি
      setGoogleUser({
        id: u.id,
        name: u.name,
        email: u.email,
        photo: u.photo,
      });

      // 👉 2) Get ID token
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) throw new Error('No Google ID token');

      // 👉 3) Backend এ পাঠাই
      const result = await axios.post(API + '/auth/google', {
        idToken,
      });

      const backendUser = result.data.user;
      const jwtToken = result.data.token;

      if (!backendUser?.email || !jwtToken) {
        throw new Error('Invalid backend response');
      }

      // 👉 4) AuthContext + AsyncStorage + axios header সব আপডেট করি
      await setAuthFromBackend(backendUser, jwtToken);

      // 👉 5) Role আবার লোড করি
      await fetchRole();

      Alert.alert('Success', 'You are logged in!');
    } catch (err) {
      console.log('Google login error:', err);
      Alert.alert('Login failed', 'Google দিয়ে লগইন করতে সমস্যা হচ্ছে।');
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (err) {
      console.log('Google signOut error:', err);
    }
    await logout(); // AuthContext + AsyncStorage clear
    setGoogleUser(null);
    setRole(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        {!googleUser ? (
          <>
            <Text style={styles.notLoggedText}>Not logged in</Text>
            <Button title="Sign in with Google" onPress={handleSignIn} />
          </>
        ) : (
          <>
            {googleUser.photo && (
              <Image
                source={{ uri: googleUser.photo }}
                style={styles.profileImage}
              />
            )}

            <Text style={styles.nameText}>
              Logged in as: {googleUser.name}
            </Text>
            <Text style={styles.emailText}>Email: {googleUser.email}</Text>

            {loadingRole ? (
              <ActivityIndicator style={styles.roleLoader} />
            ) : role ? (
              <Text style={styles.roleText}>
                Role: {role}{' '}
                {role === 'basic user' && '(Waiting for admin approval)'}
              </Text>
            ) : (
              <Text style={styles.roleText}>Role: (Not loaded)</Text>
            )}

            <View style={styles.signOutWrapper}>
              <Button title="Sign out" onPress={handleSignOut} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notLoggedText: {
    marginBottom: 20,
    fontSize: 16,
    color: '#4B5563',
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  roleLoader: {
    marginTop: 10,
  },
  roleText: {
    marginTop: 10,
    fontSize: 14,
    color: '#374151',
  },
  signOutWrapper: {
    marginTop: 20,
  },
});
