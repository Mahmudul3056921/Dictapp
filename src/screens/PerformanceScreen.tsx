// src/screens/PerformanceScreen.tsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { PieChart, BarChart } from 'react-native-chart-kit';

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
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
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

  const pieData = [
    {
      name: 'Correct',
      population: totalCorrect,
      color: '#22C55E',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: 'Wrong',
      population: totalWrong,
      color: '#EF4444',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
  ];

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
          <Card.Content>
            <Text style={styles.loginTitle}>Please login to see performance</Text>
            <Text style={styles.loginSubtitle}>
              Performance page is only available for registered users.
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.titleWrapper}>
        <Text style={styles.titleText}>Your {level} Performance</Text>
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
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Correct</Text>
                  <Text style={styles.summaryValue}>{totalCorrect}</Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Wrong</Text>
                  <Text style={styles.summaryValue}>{totalWrong}</Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Accuracy</Text>
                  <Text style={styles.summaryValue}>{percent}%</Text>
                </View>
              </View>

              {/* Pie chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Overall</Text>
                <View style={styles.chartWrapper}>
                  <PieChart
                    data={pieData}
                    width={chartWidth}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="10"
                    center={[5, 0]}
                    absolute
                  />
                </View>
              </View>

              {/* Bar chart */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Per Chapter</Text>

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
                Play some quizzes to see your progress here!
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
    backgroundColor: '#F3F4F6', // light gray, no black
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#111827',
  },
  mainCard: {
    borderRadius: 16,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
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
    backgroundColor: '#FFFFFF',
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loginCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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
