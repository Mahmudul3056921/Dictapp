// src/screens/PerformanceScreen.tsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';

import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { Icons } from '../components/Icons';

// ---- SVG icon components (top-level) ----
const PerformanceIcon = () => <Icons.Icon9 width={22} height={22} />;
const CorrectIcon = () => <Icons.Icon11 width={18} height={18} />;
const WrongIcon = () => <Icons.Icon12 width={18} height={18} />;
const AccuracyIcon = () => <Icons.Icon13 width={18} height={18} />;
const LoginIcon = () => <Icons.Icon4 width={26} height={26} />;

type Level = 'A1' | 'A2' | 'B1';

type QuizResult = {
  level: string;
  chapter: number;
  result: 'correct' | 'wrong' | string;
};

const { width } = Dimensions.get('window');
const chartWidth = width - 32;

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // indigo
  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  barPercentage: 0.6,
};

const roleToLevel = (role: string | null | undefined): Level => {
  if (role === 'customer3') return 'B1';
  if (role === 'customer2') return 'A2';
  return 'A1';
};

const PerformanceScreen = () => {
  const { user } = useContext(AuthContext);

  const [level, setLevel] = useState<Level>('A1');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loadingRole, setLoadingRole] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user role → level
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setLevel('A1');
        return;
      }

      try {
        setLoadingRole(true);
        const res = await api.get('/users/role/me');
        const role = res.data?.role ?? null;
        setLevel(roleToLevel(role));
      } catch {
        setLevel('A1');
      } finally {
        setLoadingRole(false);
      }
    };

    fetchRole();
  }, [user]);

  // Load quiz results
  useEffect(() => {
    const fetchQuizResults = async () => {
      if (!user) {
        setResults([]);
        return;
      }

      try {
        setLoadingResults(true);
        setError(null);
        const res = await api.get('/quiz-results');
        setResults(res.data || []);
      } catch {
        setError('Failed to load performance data.');
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    };

    fetchQuizResults();
  }, [user]);

  // Filter results by current level
  const filtered = useMemo(
    () => results.filter((q) => q.level === level),
    [results, level]
  );

  const totalCorrect = filtered.filter((q) => q.result === 'correct').length;
  const totalWrong = filtered.filter((q) => q.result !== 'correct').length;
  const total = filtered.length;
  const percent = total ? Math.round((totalCorrect / total) * 100) : 0;

  // Aggregate by chapter
  const chaptersMap: Record<number, { correct: number; wrong: number }> = {};
  filtered.forEach((item) => {
    const ch = Number(item.chapter);
    if (!chaptersMap[ch]) {
      chaptersMap[ch] = { correct: 0, wrong: 0 };
    }
    if (item.result === 'correct') {
      chaptersMap[ch].correct += 1;
    } else {
      chaptersMap[ch].wrong += 1;
    }
  });

  const sortedChapters = Object.keys(chaptersMap)
    .map(Number)
    .sort((a, b) => a - b);

  const barLabels = sortedChapters.map((c) => `Ch ${c}`);
  const barCorrectData = sortedChapters.map((c) => chaptersMap[c].correct);
  const barWrongData = sortedChapters.map((c) => chaptersMap[c].wrong);

  const hasData = total > 0;
  const isLoading = loadingRole || loadingResults;

  // If not logged in
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.loginCard} mode="elevated">
          <Card.Content style={styles.loginContent}>
            <View style={styles.loginIconWrapper}>
              <LoginIcon />
            </View>
            <Text style={styles.loginTitle}>Sign in to see your progress</Text>
            <Text style={styles.loginSubtitle}>
              Performance is only available for registered users who play quizzes.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with icon + level pill */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrapper}>
            <PerformanceIcon />
          </View>
          <View>
            <Text style={styles.titleText}>Performance overview</Text>
            <Text style={styles.titleSubText}>Based on your quiz history</Text>
          </View>
        </View>

        <View style={styles.levelPill}>
          <Text style={styles.levelPillText}>Level {level}</Text>
        </View>
      </View>

      <Card style={styles.mainCard} mode="elevated">
        <Card.Content>
          {isLoading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading…</Text>
            </View>
          ) : error ? (
            <View style={styles.noDataWrapper}>
              <Text style={styles.noDataTitle}>⚠ {error}</Text>
            </View>
          ) : hasData ? (
            <>
              {/* Summary */}
              <View style={styles.summaryRow}>
                <View style={[styles.summaryBox, styles.summaryBoxCorrect]}>
                  <View style={styles.summaryIconWrapper}>
                    <CorrectIcon />
                  </View>
                  <Text style={styles.summaryLabel}>Correct</Text>
                  <Text style={styles.summaryValue}>{totalCorrect}</Text>
                </View>

                <View style={[styles.summaryBox, styles.summaryBoxWrong]}>
                  <View style={styles.summaryIconWrapper}>
                    <WrongIcon />
                  </View>
                  <Text style={styles.summaryLabel}>Wrong</Text>
                  <Text style={styles.summaryValue}>{totalWrong}</Text>
                </View>

                <View style={[styles.summaryBox, styles.summaryBoxAccuracy]}>
                  <View style={styles.summaryIconWrapper}>
                    <AccuracyIcon />
                  </View>
                  <Text style={styles.summaryLabel}>Accuracy</Text>
                  <Text style={styles.summaryValue}>{percent}%</Text>
                </View>
              </View>

              {/* Bar chart only – chapter wise */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Per chapter</Text>

                {sortedChapters.length > 0 ? (
                  <>
                    <View style={styles.chartWrapper}>
                      <BarChart
                        data={{
                          labels: barLabels,
                          datasets: [
                            {
                              data: barCorrectData,
                              color: () => 'rgba(34, 197, 94, 1)', // green
                            },
                            {
                              data: barWrongData,
                              color: () => 'rgba(239, 68, 68, 1)', // red
                            },
                          ],
                        }}
                        width={chartWidth}
                        height={240}
                        chartConfig={chartConfig}
                        fromZero
                        withInnerLines={false}
                        style={styles.barChart}
                        yAxisLabel=""
                        yAxisSuffix=""
                      />
                    </View>

                    {/* Legend */}
                    <View style={styles.barLegend}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, styles.legendDotCorrect]} />
                        <Text style={styles.legendText}>Correct</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, styles.legendDotWrong]} />
                        <Text style={styles.legendText}>Wrong</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noDataSubtitle}>
                    Play some quizzes to see your chapter-wise progress here.
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.noDataWrapper}>
              <Text style={styles.noDataTitle}>
                No quiz data for {level} yet.
              </Text>
              <Text style={styles.noDataSubtitle}>
                Play a few quizzes and come back to see your stats.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default PerformanceScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  titleText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#111827',
  },
  titleSubText: {
    fontSize: 12,
    color: '#6B7280',
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },
  levelPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },

  // Card
  mainCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  loadingWrapper: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 13,
  },

  // Summary boxes
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  summaryBoxCorrect: {
    backgroundColor: '#DCFCE7',
  },
  summaryBoxWrong: {
    backgroundColor: '#FEE2E2',
  },
  summaryBoxAccuracy: {
    backgroundColor: '#E0EAFF',
  },
  summaryIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  summaryValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  // Bar chart
  chartCard: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },
  chartWrapper: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
  },
  barChart: {
    marginTop: 4,
  },
  barLegend: {
    flexDirection: 'row',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendDotCorrect: {
    backgroundColor: '#22C55E',
  },
  legendDotWrong: {
    backgroundColor: '#EF4444',
  },
  legendText: {
    fontSize: 12,
    color: '#4B5563',
  },

  // No data
  noDataWrapper: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    color: '#4B5563',
  },
  noDataSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },

  // Login state
  centerContainer: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loginCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  loginContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loginIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loginTitle: {
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '700',
    fontSize: 16,
    color: '#111827',
  },
  loginSubtitle: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
  },
});
