// src/screens/LearnScreen.tsx
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

// প্রতি পেজে কতগুলো chapter
const PAGE_SIZE = 6;

// 🔹 Language-based texts
const LEARN_TEXTS: Record<
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
    title: (level) => `Learn – চ্যাপ্টারসমূহ (${level})`,
    freeInfo:
      'Chapter 1 ফ্রি, অন্যগুলো দেখতে লগইন ও subscription দরকার।',
    currentLevel: (level, role) =>
      `আপনার বর্তমান level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing chapters ${first}–${last} of ${total}`,
    chapterLabel: 'Chapter',
    locked: 'Locked',
  },
  english: {
    title: (level) => `Learn – Chapters (${level})`,
    freeInfo:
      'Chapter 1 is free, to see others you need login & subscription.',
    currentLevel: (level, role) =>
      `Your current level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing chapters ${first}–${last} of ${total}`,
    chapterLabel: 'Chapter',
    locked: 'Locked',
  },
  hindi: {
    title: (level) => `Learn – अध्याय (${level})`,
    freeInfo:
      'Chapter 1 फ्री है, बाकी के लिए लॉगिन और subscription ज़रूरी है।',
    currentLevel: (level, role) =>
      `आपका वर्तमान level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing chapters ${first}–${last} of ${total}`,
    chapterLabel: 'अध्याय',
    locked: 'Locked',
  },
  urdu: {
    title: (level) => `Learn – ابواب (${level})`,
    freeInfo:
      'Chapter 1 فری ہے، باقی دیکھنے کے لیے لاگ اِن اور subscription ضروری ہے۔',
    currentLevel: (level, role) =>
      `آپ کا موجودہ level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing chapters ${first}–${last} of ${total}`,
    chapterLabel: 'Chapter',
    locked: 'Locked',
  },
  tamil: {
    title: (level) => `Learn – அத்தியாயங்கள் (${level})`,
    freeInfo:
      'Chapter 1 free, மற்ற chapter களை பார்க்க login + subscription தேவை.',
    currentLevel: (level, role) =>
      `உங்கள் தற்போதைய level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing chapters ${first}–${last} of ${total}`,
    chapterLabel: 'அத்தியாயம்',
    locked: 'Locked',
  },
  malayalam: {
    title: (level) => `Learn – അധ്യായങ്ങൾ (${level})`,
    freeInfo:
      'Chapter 1 ഫ്രീ ആണ്, മറ്റ് അധ്യായങ്ങൾക്കായി login + subscription വേണം.',
    currentLevel: (level, role) =>
      `നിങ്ങളുടെ നിലവിലെ level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing chapters ${first}–${last} of ${total}`,
    chapterLabel: 'അധ്യായം',
    locked: 'Locked',
  },
  nepali: {
    title: (level) => `Learn – अध्यायहरू (${level})`,
    freeInfo:
      'Chapter 1 फ्री छ, अरूका लागि login र subscription चाहिन्छ।',
    currentLevel: (level, role) =>
      `तपाईंको level: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing chapters ${first}–${last} of ${total}`,
    chapterLabel: 'अध्याय',
    locked: 'Locked',
  },
  arabic: {
    title: (level) => `Learn – الفصول (${level})`,
    freeInfo:
      'Chapter 1 مجاني، لرؤية الباقي تحتاج إلى تسجيل الدخول واشتراك.',
    currentLevel: (level, role) =>
      `مستواك الحالي: ${level} (${role ?? 'unknown'})`,
    showing: (first, last, total) =>
      `Showing chapters ${first}–${last} of ${total}`,
    chapterLabel: 'الفصل',
    locked: 'Locked',
  },
};

const LearnScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);

  const t = LEARN_TEXTS[language] || LEARN_TEXTS.bangla;

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
      console.log('role fetch error:', e?.response?.data || e.message);
      setRole(null);
    } finally {
      setLoadingRole(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRole();
    } else {
      setRole(null);
    }
  }, [user, fetchRole]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchRole();
      }
    }, [user, fetchRole])
  );

  const level = roleToLevel(role);

  const canAccess = (n: number) => {
    if (n === 1) return true; // Chapter 1 always free

    if (!user) return false;

    if (role === 'admin') return true;

    if (level === 'A1' && role === 'customer') return true;
    if (level === 'A2' && role === 'customer2') return true;
    if (level === 'B1' && role === 'customer3') return true;

    return false;
  };

  const handleOpenChapter = (number: number) => {
    if (!canAccess(number)) return;
    navigation.navigate('Chapter', { number, level });
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
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => {
          const allowed = canAccess(item);
          return (
            <TouchableOpacity
              style={[styles.card, !allowed && styles.cardDisabled]}
              onPress={() => handleOpenChapter(item)}
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

      {/* pagination */}
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

export default LearnScreen;

const styles = StyleSheet.create({
  flatListContent: {
    paddingVertical: 16,
  },
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
    backgroundColor: '#2563eb',
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
