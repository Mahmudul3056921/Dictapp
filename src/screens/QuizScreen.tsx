// src/screens/QuizScreen.tsx
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import api from '../api/client';
import {
  LanguageContext,
  Language,
} from '../context/LanguageContext';

const chapters = Array.from({ length: 12 }, (_, i) => i + 1);

type Role = 'admin' | 'customer' | 'customer2' | 'customer3' | string | null;

const roleToLevel = (role: Role): 'A1' | 'A2' | 'B1' => {
  if (role === 'customer3') return 'B1';
  if (role === 'customer2') return 'A2';
  return 'A1';
};

const PAGE_SIZE = 6;

// 🔹 Language-based texts (similar to web QUIZ_TEXTS)
const QUIZ_TEXTS: Record<
  Language,
  {
    title: (level: string) => string;
    freeInfo: string;
    currentLevel: (level: string, role: string | null) => string;
    showing: (first: number, last: number, total: number) => string;
    chapterLabel: string;
    locked: string;
  }
> = {
  bangla: {
    title: (level) => `Quiz – চ্যাপ্টারসমূহ (${level})`,
    freeInfo:
      'Chapter 1 ফ্রি, অন্য কুইজ দিতে লগইন ও subscription লাগবে।',
    currentLevel: (level, role) =>
      `আপনার বর্তমান level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing quiz chapters ${first}–${last} of ${total}`,
    chapterLabel: 'Chapter',
    locked: 'Locked',
  },
  english: {
    title: (level) => `Quiz – Chapters (${level})`,
    freeInfo:
      'Chapter 1 is free. To access other quizzes you need login & subscription.',
    currentLevel: (level, role) =>
      `Your current level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing quiz chapters ${first}–${last} of ${total}`,
    chapterLabel: 'Chapter',
    locked: 'Locked',
  },
  hindi: {
    title: (level) => `Quiz – अध्याय (${level})`,
    freeInfo:
      'Chapter 1 फ्री है, बाकी क्विज़ के लिए लॉगिन और subscription ज़रूरी है।',
    currentLevel: (level, role) =>
      `आपका वर्तमान level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing quiz chapters ${first}–${last} of ${total}`,
    chapterLabel: 'अध्याय',
    locked: 'Locked',
  },
  urdu: {
    title: (level) => `Quiz – ابواب (${level})`,
    freeInfo:
      'Chapter 1 فری ہے، باقی کوئز کے لیے لاگ اِن اور subscription درکار ہے۔',
    currentLevel: (level, role) =>
      `آپ کا موجودہ level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing quiz chapters ${first}–${last} of ${total}`,
    chapterLabel: 'Chapter',
    locked: 'Locked',
  },
  tamil: {
    title: (level) => `Quiz – அத்தியாயங்கள் (${level})`,
    freeInfo:
      'Chapter 1 free, மற்ற quiz களை பார்க்க login + subscription தேவை.',
    currentLevel: (level, role) =>
      `உங்கள் தற்போதைய level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing quiz chapters ${first}–${last} of ${total}`,
    chapterLabel: 'அத்தியாயம்',
    locked: 'Locked',
  },
  malayalam: {
    title: (level) => `Quiz – അധ്യായങ്ങൾ (${level})`,
    freeInfo:
      'Chapter 1 ഫ്രീ ആണ്, മറ്റു ക്വിസുകൾക്കായി login + subscription വേണം.',
    currentLevel: (level, role) =>
      `നിങ്ങളുടെ നിലവിലെ level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing quiz chapters ${first}–${last} of ${total}`,
    chapterLabel: 'അധ്യായം',
    locked: 'Locked',
  },
  nepali: {
    title: (level) => `Quiz – अध्यायहरू (${level})`,
    freeInfo:
      'Chapter 1 फ्री छ, अरू क्विजका लागि login र subscription चाहिन्छ।',
    currentLevel: (level, role) =>
      `तपाईंको level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing quiz chapters ${first}–${last} of ${total}`,
    chapterLabel: 'अध्याय',
    locked: 'Locked',
  },
  arabic: {
    title: (level) => `Quiz – الفصول (${level})`,
    freeInfo:
      'Chapter 1 مجاني، للوصول إلى بقية الاختبارات تحتاج إلى تسجيل الدخول واشتراك.',
    currentLevel: (level, role) =>
      `مستواك الحالي: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing quiz chapters ${first}–${last} of ${total}`,
    chapterLabel: 'الفصل',
    locked: 'Locked',
  },
};

const QuizScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);

  const t = QUIZ_TEXTS[language] || QUIZ_TEXTS.bangla;

  const [role, setRole] = useState<Role>(null);
  const [loadingRole, setLoadingRole] = useState(false);

  // pagination state
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(chapters.length / PAGE_SIZE);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      return;
    }
    try {
      setLoadingRole(true);
      const res = await api.get('/users/role/me');
      setRole(res.data?.role || null);
    } catch (e: any) {
      console.log('role fetch error (quiz):', e?.response?.data || e.message);
      setRole(null);
    } finally {
      setLoadingRole(false);
    }
  }, [user]);

  // user বদলালে একবার role লোড করো
  useEffect(() => {
    if (user) {
      fetchRole();
    } else {
      setRole(null);
    }
  }, [user, fetchRole]);

  // QuizScreen ফোকাসে এলেই fresh role লোড করো
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchRole();
      }
    }, [user, fetchRole])
  );

  const level = roleToLevel(role);

  const canAccess = (n: number) => {
    if (n === 1) return true; // Chapter 1 quiz always free
    if (!user) return false;
    if (role === 'admin') return true;
    if (level === 'A1' && role === 'customer') return true;
    if (level === 'A2' && role === 'customer2') return true;
    if (level === 'B1' && role === 'customer3') return true;
    return false;
  };

  const handleOpenQuiz = (number: number) => {
    if (!canAccess(number)) return;
    navigation.navigate('QuizCards', { number, level });
  };

  // current page chapters
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const visibleChapters = chapters.slice(startIndex, endIndex);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const renderPageNumbers = () => {
    return (
      <View style={styles.pageNumberWrapper}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          const isActive = p === page;
          return (
            <TouchableOpacity
              key={p}
              style={[
                styles.pageNumberBtn,
                isActive && styles.pageNumberBtnActive,
              ]}
              onPress={() => goToPage(p)}
            >
              <Text
                style={[
                  styles.pageNumberText,
                  isActive && styles.pageNumberTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const firstChapter = visibleChapters[0];
  const lastChapter = visibleChapters[visibleChapters.length - 1];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.title(level)}</Text>

      {!loadingRole && !user && (
        <Text style={styles.subtitle}>{t.freeInfo}</Text>
      )}

      {!loadingRole && user && role && role !== 'admin' && (
        <Text style={styles.subtitle}>{t.currentLevel(level, role)}</Text>
      )}

      <Text style={styles.smallInfo}>
        {t.showing(firstChapter, lastChapter, chapters.length)}
      </Text>

      <FlatList
        data={visibleChapters}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }) => {
          const allowed = canAccess(item);
          return (
            <TouchableOpacity
              style={[styles.card, !allowed && styles.cardDisabled]}
              onPress={() => handleOpenQuiz(item)}
              disabled={!allowed}
            >
              <Text style={styles.cardText}>
                {t.chapterLabel} {item}
              </Text>
              {!allowed && item > 1 && (
                <Text style={styles.lockText}>{t.locked}</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.pageArrowBtn,
            page === 1 && styles.pageArrowBtnDisabled,
          ]}
          onPress={() => goToPage(page - 1)}
          disabled={page === 1}
        >
          <Text style={styles.pageArrowText}>‹</Text>
        </TouchableOpacity>

        {renderPageNumbers()}

        <TouchableOpacity
          style={[
            styles.pageArrowBtn,
            page === totalPages && styles.pageArrowBtnDisabled,
          ]}
          onPress={() => goToPage(page + 1)}
          disabled={page === totalPages}
        >
          <Text style={styles.pageArrowText}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 4,
  },
  smallInfo: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: 'center',
  },
  cardDisabled: {
    backgroundColor: '#9ca3af',
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  lockText: {
    marginTop: 2,
    fontSize: 12,
    color: '#e5e7eb',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  pageArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: 'white',
  },
  pageArrowBtnDisabled: {
    opacity: 0.4,
  },
  pageArrowText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },
  pageNumberWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNumberBtn: {
    minWidth: 32,
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    backgroundColor: 'white',
  },
  pageNumberBtnActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  pageNumberText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  pageNumberTextActive: {
    color: 'white',
    fontWeight: '700',
  },
});
