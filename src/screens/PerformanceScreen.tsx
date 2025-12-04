import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import { PieChart, BarChart } from 'react-native-chart-kit';

type Level = 'A1' | 'A2' | 'B1';

type QuizResult = {
  level: string;
  chapter: number;
  result: 'correct' | 'wrong' | string;
};

type PerformanceTexts = {
  title: (level: Level) => string;
  loading: string;
  noDataTitle: (level: Level) => string;
  noDataSub: string;
  donutCorrect: string;
  donutWrong: string;
  barCorrect: string;
  barWrong: string;
  loginTitle: string;
  loginSub: string;
};

// 🔹 You can paste your full PERFORMANCE_TEXTS object here if you want all languages.
// For now I’ll keep it simple (Bangla + English as example).
const PERFORMANCE_TEXTS: Record<string, PerformanceTexts> = {
  bangla: {
    title: (level) => `আপনার ${level} পারফরম্যান্স`,
    loading: '⏳ লোড হচ্ছে...',
    noDataTitle: (level) => `${level} লেভেলে এখনো কোনো কুইজ ডেটা নেই।`,
    noDataSub: 'কুইজ খেলুন, তারপর এখানে আপনার অগ্রগতি দেখতে পাবেন!',
    donutCorrect: 'সঠিক',
    donutWrong: 'ভুল',
    barCorrect: '✅ সঠিক',
    barWrong: '❌ ভুল',
    loginTitle: 'আপনার পারফরম্যান্স দেখতে লগইন করুন',
    loginSub: 'পারফরম্যান্স পেজ শুধুমাত্র নিবন্ধিত ব্যবহারকারীদের জন্য।',
  },
  english: {
    title: (level) => `Your ${level} Performance`,
    loading: '⏳ Loading...',
    noDataTitle: (level) => `No quiz data for ${level} yet.`,
    noDataSub: 'Play some quizzes to see your progress here!',
    donutCorrect: 'Correct',
    donutWrong: 'Wrong',
    barCorrect: '✅ Correct',
    barWrong: '❌ Wrong',
    loginTitle: 'Please login to see your performance.',
    loginSub: 'The performance page is only available for registered users.',
  },
};

const getTexts = (lang: string): PerformanceTexts =>
  PERFORMANCE_TEXTS[lang] || PERFORMANCE_TEXTS.bangla;

// 🔹 Helper: role → level (same logic as Learn/Quiz)
const roleToLevel = (role: string | null | undefined): Level => {
  if (role === 'customer3') return 'B1';
  if (role === 'customer2') return 'A2';
  return 'A1';
};

const { width } = Dimensions.get('window');
const chartWidth = width - 32; // padding

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // blue
  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`, // slate-700
  barPercentage: 0.6,
};

const PerformanceScreen = () => {
  const { user } = useContext(AuthContext);

  // later you can take this from a LanguageContext
  const [language] = useState<string>('bangla');
  const t = getTexts(language);

  const [level, setLevel] = useState<Level>('A1');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loadingRole, setLoadingRole] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Fetch role → derive level (A1/A2/B1)
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

  // 2️⃣ Fetch quiz data (secure)
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
      } catch (e: any) {
        console.log('quiz results fetch error:', e?.response?.data || e.message);
        setError('Failed to load performance data.');
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    };

    fetchQuizResults();
  }, [user]);

  // 3️⃣ Filter to this level
  const filtered = useMemo(
    () => results.filter((q) => q.level === level),
    [results, level]
  );

  const totalCorrect = filtered.filter((q) => q.result === 'correct').length;
  const totalWrong = filtered.filter((q) => q.result !== 'correct').length;
  const total = filtered.length;
  const percent = total ? Math.round((totalCorrect / total) * 100) : 0;

  // Donut / Pie data
  const pieData = [
    {
      name: t.donutCorrect,
      population: totalCorrect,
      color: '#22c55e', // green
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: t.donutWrong,
      population: totalWrong,
      color: '#ef4444', // red
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
  ];

  // 4️⃣ Aggregate per chapter for bar chart
  const chaptersMap: Record<
    number,
    { correct: number; wrong: number }
  > = {};

  filtered.forEach((item) => {
    const ch = Number(item.chapter);
    if (!chaptersMap[ch]) {
      chaptersMap[ch] = { correct: 0, wrong: 0 };
    }
    if (item.result === 'correct') chaptersMap[ch].correct += 1;
    else chaptersMap[ch].wrong += 1;
  });

  const sortedChapterNumbers = Object.keys(chaptersMap)
    .map((x) => Number(x))
    .sort((a, b) => a - b);

  const barLabels = sortedChapterNumbers.map((ch) => `Ch ${ch}`);
  const barCorrectData = sortedChapterNumbers.map(
    (ch) => chaptersMap[ch].correct
  );
  const barWrongData = sortedChapterNumbers.map(
    (ch) => chaptersMap[ch].wrong
  );

  const hasData = total > 0;

  // 🔐 if user not logged in → login message
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.loginCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.loginTitle}>
              {t.loginTitle}
            </Text>
            <Text variant="bodySmall" style={styles.loginSubtitle}>
              {t.loginSub}
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const isLoading = loadingRole || loadingResults;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Title */}
      <View style={styles.titleWrapper}>
        <Text variant="headlineMedium" style={styles.titleText}>
          {t.title(level)}
        </Text>
      </View>

      {/* Main Card */}
      <Card style={styles.mainCard} mode="elevated">
        <Card.Content>
          {isLoading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator animating />
              <Text style={styles.loadingText}>{t.loading}</Text>
            </View>
          ) : error ? (
            <View style={styles.noDataWrapper}>
              <Text style={styles.noDataTitle}>⚠ {error}</Text>
            </View>
          ) : hasData ? (
            <>
              {/* Summary row */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>{t.donutCorrect}</Text>
                  <Text style={styles.summaryValue}>{totalCorrect}</Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>{t.donutWrong}</Text>
                  <Text style={styles.summaryValue}>{totalWrong}</Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Accuracy</Text>
                  <Text style={styles.summaryValue}>{percent}%</Text>
                </View>
              </View>

              {/* Charts grid */}
              <View style={styles.chartsWrapper}>
                {/* Donut / Pie */}
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Overall</Text>
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

                {/* Bar chart */}
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Per Chapter</Text>
                  {sortedChapterNumbers.length > 0 ? (
                    <BarChart
                      data={{
                        labels: barLabels,
                        datasets: [
                          {
                            data: barCorrectData,
                            color: (opacity = 1) =>
                              `rgba(34, 197, 94, ${opacity})`, // green
                          },
                          {
                            data: barWrongData,
                            color: (opacity = 1) =>
                              `rgba(239, 68, 68, ${opacity})`, // red
                          },
                        ],
                        legend: [t.barCorrect, t.barWrong],
                      }}
                      width={chartWidth}
                      height={250}
                      chartConfig={chartConfig}
                      fromZero
                      withInnerLines={false}
                      style={styles.barChart}
                    />
                  ) : (
                    <Text style={styles.noChapterText}>
                      {t.noDataSub}
                    </Text>
                  )}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noDataWrapper}>
              <Text style={styles.noDataTitle}>{t.noDataTitle(level)}</Text>
              <Text style={styles.noDataSubtitle}>{t.noDataSub}</Text>
              <Button
                mode="contained-tonal"
                style={styles.noDataButton}
                onPress={() => {
                  // quick shortcut → go to Quiz tab
                  // (adjust route name if needed)
                  // @ts-ignore
                  // navigation?.navigate('Quiz');
                }}
              >
                Go to Quizzes
              </Button>
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
    backgroundColor: '#F3F4F6',
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
    fontWeight: 'bold',
  },
  mainCard: {
    borderRadius: 16,
  },
  loadingWrapper: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
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
    color: '#4b5563',
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  chartsWrapper: {
    marginTop: 8,
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
  barChart: {
    marginTop: 4,
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
    color: '#4b5563',
  },
  noDataSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 12,
  },
  noDataButton: {
    marginTop: 8,
    borderRadius: 999,
  },
  noChapterText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
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
  },
  loginTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  loginSubtitle: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
  },
});
