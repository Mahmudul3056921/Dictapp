// src/screens/SubscriptionScreen.tsx
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Icons } from '../components/Icons';

// Top-level SVG helpers (no inline components in render)
const HeaderIcon = () => <Icons.Icon1 width={40} height={40} />;
const PlanIcon = () => <Icons.Icon2 width={22} height={22} />;
const PriceIcon = () => <Icons.Icon3 width={18} height={18} />;

type Plan = {
  level: 'A1' | 'A2' | 'B1';
  title: string;
  price: string;
  badge: string;
  highlight: boolean;
  headerColor: string;
  borderColor: string;
  features: string[];
};

const plans: Plan[] = [
  {
    level: 'A1',
    title: 'A1 Beginner Course',
    price: '15 €',
    badge: 'Start from zero',
    highlight: false,
    headerColor: '#E0F2FE',
    borderColor: '#BAE6FD',
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
    headerColor: '#E0E7FF',
    borderColor: '#6366F1',
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
    price: '15 €',
    badge: 'For serious learners',
    highlight: false,
    headerColor: '#DCFCE7',
    borderColor: '#BBF7D0',
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      
      {/* Header "hero" card */}
      <Card style={styles.headerCard} mode="elevated">
        <Card.Content>
          <View style={styles.headerTopRow}>
            <View style={styles.headerIconWrapper}>
              <HeaderIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                Choose Your German Course Level
              </Text>
              <Text style={styles.headerSubtitle}>
                One-time payment. Lifetime access to LEARN & QUIZ for your level.
              </Text>
            </View>
          </View>

          <View style={styles.pillRow}>
            <View style={styles.pillInfo}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>
                Secure PayPal payment · Instant upgrade
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Plan cards */}
      <View style={styles.cardsWrapper}>
        {plans.map((plan) => (
          <Card
            key={plan.level}
            style={[
              styles.card,
              { borderColor: plan.borderColor },
              plan.highlight && styles.cardHighlight,
            ]}
            mode="elevated"
          >

            {/* header strip */}
            <View
              style={[
                styles.cardHeaderBar,
                { backgroundColor: plan.headerColor },
              ]}
            />

            {/* ribbon for highlight */}
            {plan.highlight && (
              <View style={styles.ribbon}>
                <Ionicons name="star" size={12} style={styles.ribbonIcon} />
                <Text style={styles.ribbonText}>MOST POPULAR</Text>
              </View>
            )}

            <Card.Content>

              {/* top row: icon + title/badge + level pill */}
              <View style={styles.cardTopRow}>
                <View style={styles.planIconCircle}>
                  <PlanIcon />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{plan.title}</Text>
                  <Text style={styles.cardBadge}>{plan.badge}</Text>
                </View>

                <View style={styles.levelPill}>
                  <Text style={styles.levelPillText}>{plan.level}</Text>
                </View>
              </View>

              {/* price row */}
              <View style={styles.priceRow}>
                <View style={styles.priceIconWrapper}>
                  <PriceIcon />
                </View>
                <Text style={styles.priceValue}>{plan.price}</Text>
                <Text style={styles.priceSuffix}> / one-time</Text>
              </View>

              {/* features */}
              <View style={styles.featuresWrapper}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              {/* button */}
              <Button
                mode={plan.highlight ? 'contained' : 'outlined'}
                style={[
                  styles.buyButton,
                  plan.highlight && styles.buyButtonHighlight,
                ]}
                contentStyle={styles.buyButtonContent}
                labelStyle={[
                  styles.buyButtonLabel,
                  plan.highlight && styles.buyButtonLabelHighlight,
                ]}
                onPress={() => handleBuy(plan.level)}
              >
                Unlock {plan.level} Access
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Text style={styles.footerText}>
        After payment, your account will be upgraded automatically and you will
        get full access to all chapters and quizzes for the selected level.
      </Text>

    </ScrollView>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
  },

  /* Header card (ONLY CHANGE MADE HERE ↓↓↓) */
  headerCard: {
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: '#8B5CF6', // ★ PREMIUM COLOR ★
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#F3E8FF',
  },
  pillRow: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  pillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  pillText: {
    fontSize: 11,
    color: '#FFFFFF',
  },

  /* Plan cards */
  cardsWrapper: {
    marginTop: 8,
  },
  card: {
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  cardHighlight: {
    borderColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 5,
  },
  cardHeaderBar: {
    height: 6,
    width: '100%',
  },
  ribbon: {
    position: 'absolute',
    top: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
  },
  ribbonIcon: {
    color: '#B45309',
    marginRight: 4,
  },
  ribbonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  planIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardBadge: {
    fontSize: 11,
    color: '#2563EB',
    marginTop: 2,
    fontWeight: '600',
  },
  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    marginLeft: 8,
  },
  levelPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
  },
  priceSuffix: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },

  featuresWrapper: {
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  featureIcon: {
    color: '#22C55E',
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
    borderColor: '#2563EB',
  },
  buyButtonHighlight: {
    backgroundColor: '#2563EB',
  },
  buyButtonContent: {
    paddingVertical: 7,
  },
  buyButtonLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  buyButtonLabelHighlight: {
    color: '#FFFFFF',
  },

  footerText: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 4,
  },
});
