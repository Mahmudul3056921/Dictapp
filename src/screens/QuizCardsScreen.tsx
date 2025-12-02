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

const QuizCardsScreen = () => {
  const route = useRoute<any>();
  const { number, level = 'A1' } = route.params || { number: 1 };
  const chapterNum = Number(number) || 1;

  const [data, setData] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        setError(null);
        setIndex(0);
        setShowAnswer(false);

        const res = await api.get(`/chapter/${chapterNum}?level=${level}`);
        setData(res.data || []);
      } catch (e: any) {
        console.log('Quiz words error:', e?.response?.data || e.message);
        setError('শব্দ লোড করতে সমস্যা হচ্ছে।');
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [chapterNum, level]);

  const goNext = () => {
    if (!data.length) return;
    setIndex((prev) => (prev + 1) % data.length);
    setShowAnswer(false);
  };

  const saveResult = async (result: 'correct' | 'wrong') => {
    if (!data.length) return;
    const vocab = data[index];

    try {
      setSaving(true);
      await api.put('/quiz-results', {
        chapter: chapterNum,
        level,
        word: vocab.word,
        bangla: vocab.bangla,
        english: vocab.english,
        sentence: vocab.sentence,
        result,
      });
    } catch (e: any) {
      console.log('Quiz save error:', e?.response?.data || e.message);
      // আপাতত শুধু লগ রাখছি, UI-তে error দেখাচ্ছি না
    } finally {
      setSaving(false);
      goNext();
    }
  };

  const handleIKnow = () => {
    saveResult('correct');
  };

  const handleDontKnow = () => {
    saveResult('wrong');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>
          Chapter {chapterNum} কুইজ শব্দ লোড হচ্ছে…
        </Text>
      </View>
    );
  }

  if (error || !data.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || 'এই অধ্যায়ের জন্য কোনও শব্দ পাওয়া যায়নি।'}
        </Text>
      </View>
    );
  }

  const vocab = data[index];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Chapter {chapterNum} – {level} Quiz
      </Text>
      <Text style={styles.subtitle}>
        কার্ডে ট্যাপ করলে অর্থ/English দেখা যাবে।
      </Text>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => setShowAnswer((prev) => !prev)}
      >
        <Text style={styles.word}>{vocab.word}</Text>

        {showAnswer ? (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Bangla:</Text>
            <Text style={styles.value}>{vocab.bangla || '—'}</Text>

            <Text style={[styles.label, { marginTop: 8 }]}>English:</Text>
            <Text style={styles.value}>{vocab.english}</Text>

            <Text style={[styles.label, { marginTop: 8 }]}>Sentence:</Text>
            <Text style={styles.value}>{vocab.sentence}</Text>
          </View>
        ) : (
          <Text style={styles.hint}>উত্তর দেখতে কার্ডে ট্যাপ করুন</Text>
        )}
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnWrong, saving && { opacity: 0.7 }]}
          onPress={handleDontKnow}
          disabled={saving}
        >
          <Text style={styles.btnText}>জানি না</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnCorrect, saving && { opacity: 0.7 }]}
          onPress={handleIKnow}
          disabled={saving}
        >
          <Text style={styles.btnText}>জানি</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>
        {index + 1} / {data.length}
      </Text>
    </View>
  );
};

export default QuizCardsScreen;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
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
    backgroundColor: '#0ea5e9',
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
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: 'white',
    fontSize: 16,
  },
  hint: {
    color: '#e0f2fe',
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  btnWrong: {
    backgroundColor: '#ef4444',
  },
  btnCorrect: {
    backgroundColor: '#22c55e',
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
