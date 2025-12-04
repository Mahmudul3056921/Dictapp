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

const chapters = Array.from({ length: 12 }, (_, i) => i + 1);

type Role = 'admin' | 'customer' | 'customer2' | 'customer3' | string | null;

const roleToLevel = (role: Role): 'A1' | 'A2' | 'B1' => {
  if (role === 'customer3') return 'B1';
  if (role === 'customer2') return 'A2';
  return 'A1';
};

const PAGE_SIZE = 6;

const QuizScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

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

  // ১) user বদলালে একবার role লোড করো
  useEffect(() => {
    if (user) {
      fetchRole();
    } else {
      setRole(null);
    }
  }, [user, fetchRole]);

  // ২) QuizScreen ফোকাসে এলেই fresh role লোড করো
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
      <Text style={styles.title}>Quiz – Chapters ({level})</Text>

      {/* no "আপনার level জানা হচ্ছে…" */}

      {!loadingRole && !user && (
        <Text style={styles.subtitle}>
          Chapter 1 ফ্রি, অন্য কুইজ দিতে লগইন ও subscription লাগবে।
        </Text>
      )}

      {!loadingRole && user && role && role !== 'admin' && (
        <Text style={styles.subtitle}>
          আপনার বর্তমান level: {level} ({role})
        </Text>
      )}

      <Text style={styles.smallInfo}>
        Showing quiz chapters {firstChapter}–{lastChapter} of {chapters.length}
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
              <Text style={styles.cardText}>Chapter {item}</Text>
              {!allowed && item > 1 && (
                <Text style={styles.lockText}>Locked</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Professional pagination (same style as LearnScreen) */}
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
