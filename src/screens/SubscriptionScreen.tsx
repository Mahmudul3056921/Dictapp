// src/screens/SubscriptionScreen.tsx
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

type Plan = {
  level: 'A1' | 'A2' | 'B1';
  title: string;
  price: string;
  badge: string;
  highlight: boolean;
  colors: {
    header: string;
    border: string;
  };
  features: string[];
};

const plans: Plan[] = [
  {
    level: 'A1',
    title: 'A1 Beginner Course',
    price: '10 €',
    badge: 'Start from zero',
    highlight: false,
    colors: {
      header: '#22d3ee', // cyan-400
      border: '#bfdbfe', // blue-200
    },
    features: [
      'Full access to all A1 vocabulary chapters',
      'A1 quizzes & performance tracking',
      'Search access for A1 words',
      'Perfect for total beginners',
    ],
  },
  {
    level: 'A2',
    title: 'A2 Intermediate Course',
    price: '15 €',
    badge: 'Most popular',
    highlight: true,
    colors: {
      header: '#6366f1', // indigo-500
      border: '#818cf8', // indigo-400
    },
    features: [
      'Full access to all A2 vocabulary chapters',
      'A2 quizzes & performance tracking',
      'Search access for A2 words',
      'Ideal after completing A1',
    ],
  },
  {
    level: 'B1',
    title: 'B1 Advanced Course',
    price: '20 €',
    badge: 'For serious learners',
    highlight: false,
    colors: {
      header: '#34d399', // emerald-400
      border: '#6ee7b7', // emerald-300
    },
    features: [
      'Full access to all B1 vocabulary chapters',
      'B1 quizzes & performance tracking',
      'Search access for B1 words',
      'Get ready for real-life conversations',
    ],
  },
];

const SubscriptionScreen = () => {
  const navigation = useNavigation<any>();

  const handleBuy = (level: Plan['level']) => {
    navigation.navigate('Paypal', { level });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.headerWrapper}>
        <Text style={styles.headerTitle}>
          Choose Your German Course Level
        </Text>
        <Text style={styles.headerSubtitle}>
          Unlock full access to LEARN and QUIZ for your selected level. One-time
          payment, lifetime access.
        </Text>

        <View style={styles.pillInfo}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>
            Secure PayPal payment · Instant upgrade
          </Text>
        </View>
      </View>

      {/* Cards */}
      <View style={styles.cardsWrapper}>
        {plans.map((plan) => (
          <Card
            key={plan.level}
            style={[
              styles.card,
              { borderColor: plan.colors.border },
              plan.highlight && styles.cardHighlight,
            ]}
            mode="elevated"
          >
            {/* Top bar */}
            <View
              style={[
                styles.cardHeaderBar,
                { backgroundColor: plan.colors.header },
              ]}
            />

            {/* Popular ribbon */}
            {plan.highlight && (
              <View style={styles.ribbon}>
                <Ionicons
                  name="star"
                  size={10}
                  style={styles.ribbonIcon}
                />
                <Text style={styles.ribbonText}>MOST POPULAR</Text>
              </View>
            )}

            <Card.Content>
              {/* Title + badge */}
              <View style={styles.cardTitleWrapper}>
                <Text style={styles.cardTitle}>{plan.title}</Text>
                <Text style={styles.cardBadge}>{plan.badge}</Text>
              </View>

              {/* Price row */}
              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>{plan.price}</Text>
                <Text style={styles.priceSuffix}> / one-time</Text>
              </View>

              {/* Features */}
              <View style={styles.featuresWrapper}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              {/* Buy button */}
              <Button
                mode={plan.highlight ? 'contained' : 'outlined'}
                style={[
                  styles.buyButton,
                  plan.highlight && styles.buyButtonHighlight,
                ]}
                contentStyle={styles.buyButtonContent}
                onPress={() => handleBuy(plan.level)}
              >
                Buy {plan.level} Access
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Text style={styles.footerText}>
        After payment, your account will be upgraded automatically and you
        will get access to all chapters and quizzes for the selected level.
      </Text>
    </ScrollView>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerWrapper: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 10,
  },
  pillInfo: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  pillText: {
    fontSize: 11,
    color: '#4b5563',
  },
  cardsWrapper: {
    marginTop: 12,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHighlight: {
    borderColor: '#6366f1',
  },
  cardHeaderBar: {
    height: 6,
    width: '100%',
  },
  ribbon: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#fef3c7',
  },
  ribbonIcon: {
    color: '#b45309',
    marginRight: 4,
  },
  ribbonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
  },
  cardTitleWrapper: {
    marginTop: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardBadge: {
    fontSize: 11,
    color: '#4f46e5',
    marginTop: 2,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4f46e5',
  },
  priceSuffix: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  featuresWrapper: {
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  featureIcon: {
    color: '#22c55e',
    marginRight: 6,
    marginTop: 2,
  },
  featureText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  buyButton: {
    borderRadius: 999,
    marginTop: 4,
  },
  buyButtonHighlight: {
    backgroundColor: '#4f46e5',
  },
  buyButtonContent: {
    paddingVertical: 6,
  },
  footerText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
