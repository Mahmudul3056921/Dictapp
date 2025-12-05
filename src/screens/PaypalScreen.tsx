// src/screens/PaypalScreen.tsx
import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import api from '../api/client';
import { AuthContext } from '../context/AuthContext';

// If you have a type for your root stack, you can replace 'any' with it
type PaypalRouteProp = RouteProp<any, any>;

const LEVEL_TITLES: Record<string, string> = {
  A1: 'A1 Beginner Course',
  A2: 'A2 Intermediate Course',
  B1: 'B1 Advanced Course',
};

const PaypalScreen = () => {
  const route = useRoute<PaypalRouteProp>();
  const { user } = useContext(AuthContext); // ✅ no token here
  const [loading, setLoading] = useState(false);

  // level আসবে route.params থেকে, না থাকলে A1 ধরব
  const levelParam = (route.params as any)?.level;
  const level: 'A1' | 'A2' | 'B1' =
    levelParam === 'A2' || levelParam === 'B1' ? levelParam : 'A1';

  const title = LEVEL_TITLES[level] || `Course level ${level}`;

  const handleOpenPaypal = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please login to purchase a course.');
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create order on backend (no need to pass token manually)
      const res = await api.post('/paypal/create-order', { level });

      const { orderId } = res.data || {};
      console.log('PayPal orderId:', orderId);

      if (!orderId) {
        Alert.alert(
          'Payment error',
          'Could not create PayPal order. Please try again later.'
        );
        return;
      }

      // 2️⃣ Build PayPal URL from orderId
      const approvalUrl = `https://www.paypal.com/checkoutnow?token=${orderId}`;
      // Sandbox:
      // const approvalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;

      // 3️⃣ Open PayPal in browser (or PayPal app)
      await Linking.openURL(approvalUrl);
    } catch (err: any) {
      console.log(
        'PayPal create-order error:',
        err?.response?.data || err.message
      );
      Alert.alert(
        'Could not open PayPal',
        'Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // If user not logged in – simple info card
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Please login
              </Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                You need to be logged in to purchase a course.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Complete your purchase
            </Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Course: <Text style={styles.bold}>{title}</Text>
            </Text>
            <Text variant="bodySmall" style={styles.cardSubText}>
              You are logged in as{' '}
              <Text style={styles.bold}>{user?.email}</Text>
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.cardText}>
              Tap the button below to pay securely with PayPal. After successful
              payment, your account will be upgraded automatically.
            </Text>

            <Button
              mode="contained"
              style={styles.button}
              contentStyle={styles.buttonContent}
              onPress={handleOpenPaypal}
              loading={loading}
              disabled={loading}
              buttonColor="#0070BA" // PayPal blue, not black
            >
              Pay with PayPal
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

export default PaypalScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // light grey, no black behind status bar
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF', // force white, avoid theme black
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#111827',
  },
  cardText: {
    marginBottom: 4,
    color: '#111827',
  },
  cardSubText: {
    color: '#6B7280',
    marginTop: 4,
  },
  bold: {
    fontWeight: '600',
  },
  button: {
    marginTop: 16,
    borderRadius: 999,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
