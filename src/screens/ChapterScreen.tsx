// উপরে একই imports থাকবে
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../api/client';

type VocabItem = {
  word: string;
  bangla?: string;
  english: string;
  sentence: string;
  [key: string]: any;
};

const ChapterScreen = () => {
  const route = useRoute<any>();
  const { number, level = 'A1' } = route.params || { number: 1, level: 'A1' };
  const chapterNum = Number(number) || 1;

  const [data, setData] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentIndex(0);

        // 🔹 এখন level ব্যবহার করছি
        const res = await api.get(`/chapter/${chapterNum}?level=${level}`);
        setData(res.data || []);
      } catch (e: any) {
        console.log('Chapter fetch error:', e?.response?.data || e.message);
        setError('ডেটা লোড করতে সমস্যা হচ্ছে।');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterNum, level]);

  // বাকি কোড আগের মতোই…
  const handleNext = () => {
    if (!data.length) return;
    setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const handlePrev = () => {
    if (!data.length) return;
    setCurrentIndex((prev) =>
      prev === 0 ? data.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>
          Chapter {chapterNum} ({level}) লোড হচ্ছে…
        </Text>
      </View>
    );
  }

  if (error || !data.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || 'কোনও শব্দ পাওয়া যায়নি।'}
        </Text>
      </View>
    );
  }

  const vocab = data[currentIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Chapter {chapterNum} – {level}
      </Text>
      <Text style={styles.subtitle}>
        Previous / Next দিয়ে শব্দগুলো ঘোরাতে পারো।
      </Text>

      <View style={styles.card}>
        <Text style={styles.word}>{vocab.word}</Text>

        <Text style={styles.label}>Bangla:</Text>
        <Text style={styles.value}>{vocab.bangla || '—'}</Text>

        <Text style={styles.label}>English:</Text>
        <Text style={styles.value}>{vocab.english}</Text>

        <Text style={styles.label}>Sentence:</Text>
        <Text style={styles.value}>{vocab.sentence}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btn} onPress={handlePrev}>
          <Text style={styles.btnText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleNext}>
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>
        {currentIndex + 1} / {data.length}
      </Text>
    </View>
  );
};

export default ChapterScreen;

// styles নিচে আগের মতোই থাকবে


const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  error: {
    color: '#b91c1c',
    fontSize: 15,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 20,
  },
  word: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  label: {
    color: '#bfdbfe',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: 'white',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btn: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 999,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
  },
  counter: {
    marginTop: 10,
    textAlign: 'center',
    color: '#4b5563',
  },
});
