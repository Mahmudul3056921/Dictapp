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
import Tts from 'react-native-tts';          // 🔹 NEW: TTS import

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

  // 🔹 OPTIONAL: একবার ডিফল্ট জার্মান language সেট করা
useEffect(() => {
  (async () => {
    try {
      const voices = await Tts.voices();
      const germanVoices = voices.filter(
        v => v.language === 'de-DE' && !v.notInstalled
      );

      if (germanVoices.length > 0) {
        await Tts.setDefaultVoice(germanVoices[0].id);
      }

      await Tts.setDefaultLanguage('de-DE');

      // ⭐ STRONG + CLEAR + FAST (not too fast)
      await Tts.setDefaultRate(0.75, true);  // 0.65–0.75 is natural-fast
      await Tts.setDefaultPitch(1.0);       // deeper + stronger tone

    } catch (err) {
      console.log('TTS setup error:', err);
    }
  })();
}, []);



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

  // 🔊 এই ফাংশন বাটন চাপলে জার্মান word টা বলবে
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
