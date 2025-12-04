// src/screens/ChapterScreen.tsx
import React, {
  useEffect,
  useState,
  useContext,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Tts from 'react-native-tts';

import api from '../api/client';
import {
  LanguageContext,
  Language,
} from '../context/LanguageContext';

type VocabItem = {
  word: string;
  bangla?: string;
  english: string;
  sentence: string;
  hindi?: string;
  urdu?: string;
  tamil?: string;
  malayalam?: string;
  nepali?: string;
  arabic?: string;
  [key: string]: any;
};

const LANGUAGE_LABELS: Record<Language, string> = {
  bangla: 'Bangla',
  english: 'English',
  hindi: 'हिन्दी',
  urdu: 'اردو',
  tamil: 'தமிழ்',
  malayalam: 'മലയാളം',
  nepali: 'नेपाली',
  arabic: 'العربية',
};

const getTranslationForLanguage = (
  vocab: VocabItem,
  lang: Language
): string => {
  switch (lang) {
    case 'bangla':
      return vocab.bangla ?? '—';
    case 'hindi':
      return vocab.hindi ?? '—';
    case 'urdu':
      return vocab.urdu ?? '—';
    case 'tamil':
      return vocab.tamil ?? '—';
    case 'malayalam':
      return vocab.malayalam ?? '—';
    case 'nepali':
      return vocab.nepali ?? '—';
    case 'arabic':
      return vocab.arabic ?? '—';
    case 'english':
    default:
      return vocab.english ?? '—';
  }
};

const ChapterScreen = () => {
  const route = useRoute<any>();
  const { number, level = 'A1' } = route.params || {
    number: 1,
    level: 'A1',
  };
  const chapterNum = Number(number) || 1;

  const { language } = useContext(LanguageContext);

  const [data, setData] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch chapter data
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentIndex(0);

        const res = await api.get(
          `/chapter/${chapterNum}?level=${level}`
        );
        setData(res.data || []);
      } catch (e: any) {
        console.log(
          'Chapter fetch error:',
          e?.response?.data || e.message
        );
        setError('ডেটা লোড করতে সমস্যা হচ্ছে।');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterNum, level]);

  // Setup TTS
  useEffect(() => {
    (async () => {
      try {
        const voices = await Tts.voices();
        const germanVoices = voices.filter(
          (v) => v.language === 'de-DE' && !v.notInstalled
        );

        if (germanVoices.length > 0) {
          await Tts.setDefaultVoice(germanVoices[0].id);
        }

        await Tts.setDefaultLanguage('de-DE');
        await Tts.setDefaultRate(0.75, true);
        await Tts.setDefaultPitch(1.0);
      } catch (err) {
        console.log('TTS setup error:', err);
      }
    })();
  }, []);

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

  const handleSpeak = () => {
    const vocab = data[currentIndex];
    if (!vocab?.word) return;
    Tts.stop();
    Tts.speak(vocab.word);
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
  const translationLabel =
    LANGUAGE_LABELS[language] || LANGUAGE_LABELS.bangla;
  const translationValue = getTranslationForLanguage(vocab, language);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Chapter {chapterNum} – {level}
      </Text>
      <Text style={styles.subtitle}>
        Previous / Next দিয়ে শব্দগুলো ঘোরাতে পারো।
      </Text>

      <View style={styles.card}>
        <View style={styles.wordRow}>
          <Text style={styles.word}>{vocab.word}</Text>

          {/* 🔊 Play button */}
          <TouchableOpacity style={styles.speakBtn} onPress={handleSpeak}>
            <Text style={styles.speakBtnText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Selected language */}
        <Text style={styles.label}>{translationLabel}:</Text>
        <Text style={styles.value}>{translationValue}</Text>

        {/* English always */}
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
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  word: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  speakBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakBtnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
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
