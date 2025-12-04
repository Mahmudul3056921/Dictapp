// src/screens/QuizCardsScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
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

// 🔹 Optional: language-based UI texts
const QUIZ_CARD_TEXTS: Record<
  Language,
  {
    loading: (chapter: number) => string;
    errorNoData: string;
    subtitle: string;
    tapHint: string;
    btnDontKnow: string;
    btnKnow: string;
    counterPrefix: string; // just kept simple
  }
> = {
  bangla: {
    loading: (chapter) => `Chapter ${chapter} কুইজ শব্দ লোড হচ্ছে…`,
    errorNoData: 'এই অধ্যায়ের জন্য কোনও শব্দ পাওয়া যায়নি।',
    subtitle: 'কার্ডে ট্যাপ করলে অর্থ/English দেখা যাবে।',
    tapHint: 'উত্তর দেখতে কার্ডে ট্যাপ করুন',
    btnDontKnow: 'জানি না',
    btnKnow: 'জানি',
    counterPrefix: '',
  },
  english: {
    loading: (chapter) => `Loading quiz words for chapter ${chapter}…`,
    errorNoData: 'No words found for this chapter.',
    subtitle: 'Tap on the card to see meaning / English.',
    tapHint: 'Tap the card to reveal the answer',
    btnDontKnow: "Don't know",
    btnKnow: 'I know',
    counterPrefix: '',
  },
  hindi: {
    loading: (chapter) => `Chapter ${chapter} के क्विज शब्द लोड हो रहे हैं…`,
    errorNoData: 'इस अध्याय के लिए कोई शब्द नहीं मिला।',
    subtitle: 'कार्ड पर टैप करने पर अर्थ/English दिखेगा।',
    tapHint: 'उत्तर देखने के लिए कार्ड पर टैप करें',
    btnDontKnow: 'नहीं पता',
    btnKnow: 'पता है',
    counterPrefix: '',
  },
  urdu: {
    loading: (chapter) => `Chapter ${chapter} کے کوئز الفاظ لوڈ ہو رہے ہیں…`,
    errorNoData: 'اس باب کے لیے کوئی الفاظ نہیں ملے۔',
    subtitle: 'کارڈ پر ٹیپ کرنے سے معنی/English نظر آئے گا۔',
    tapHint: 'جواب دیکھنے کے لیے کارڈ پر ٹیپ کریں',
    btnDontKnow: 'نہیں آتا',
    btnKnow: 'آتا ہے',
    counterPrefix: '',
  },
  tamil: {
    loading: (chapter) => `Chapter ${chapter} க்கான quiz சொற்கள் load ஆகிறது…`,
    errorNoData: 'இந்த அத்தியாயத்திற்கு சொற்கள் எதுவும் இல்லை.',
    subtitle: 'கார்டை தட்டினால் அர்த்தம்/English தெரியும்.',
    tapHint: 'பதிலை பார்க்க கார்டை தட்டவும்',
    btnDontKnow: 'தெரியாது',
    btnKnow: 'தெரியும்',
    counterPrefix: '',
  },
  malayalam: {
    loading: (chapter) => `Chapter ${chapter} ക്വിസ് വാക്കുകൾ ലോഡ് ചെയ്യുന്നു…`,
    errorNoData: 'ഈ അധ്യായത്തിന് വാക്കുകൾ ഒന്നും ലഭിച്ചില്ല.',
    subtitle: 'കാർഡിൽ ടാപ്പ് ചെയ്താൽ അർത്ഥം/English കാണാം.',
    tapHint: 'ഉത്തരം കാണാൻ കാർഡിൽ ടാപ്പ് ചെയ്യുക',
    btnDontKnow: 'അറിയില്ല',
    btnKnow: 'അറിയാം',
    counterPrefix: '',
  },
  nepali: {
    loading: (chapter) => `Chapter ${chapter} को क्विज शब्द लोड हुँदै…`,
    errorNoData: 'यो अध्यायका लागि कुनै शब्द भेटिएन।',
    subtitle: 'कार्डमा ट्याप गर्दा अर्थ/English देखिन्छ।',
    tapHint: 'उत्तर हेर्न कार्डमा ट्याप गर्नुहोस्',
    btnDontKnow: 'थाहा छैन',
    btnKnow: 'थाहा छ',
    counterPrefix: '',
  },
  arabic: {
    loading: (chapter) => `جاري تحميل كلمات الكويز للفصل ${chapter}…`,
    errorNoData: 'لا توجد كلمات لهذا الفصل.',
    subtitle: 'اضغط على البطاقة لرؤية المعنى / English.',
    tapHint: 'اضغط على البطاقة لإظهار الإجابة',
    btnDontKnow: 'لا أعرف',
    btnKnow: 'أعرف',
    counterPrefix: '',
  },
};

const QuizCardsScreen = () => {
  const route = useRoute<any>();
  const { number, level = 'A1' } = route.params || { number: 1, level: 'A1' };
  const chapterNum = Number(number) || 1;

  const { language } = useContext(LanguageContext);
  const t = QUIZ_CARD_TEXTS[language] || QUIZ_CARD_TEXTS.bangla;

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

        const res = await api.get(
          `/chapter/${chapterNum}?level=${level}`
        );
        setData(res.data || []);
      } catch (e: any) {
        console.log('Quiz words error:', e?.response?.data || e.message);
        setError('শব্দ লোড করতে সমস্যা হচ্ছে।'); // can also localize if you want
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
        bangla: vocab.bangla, // keeping API payload same as before
        english: vocab.english,
        sentence: vocab.sentence,
        result,
      });
    } catch (e: any) {
      console.log('Quiz save error:', e?.response?.data || e.message);
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
          {t.loading(chapterNum)}
        </Text>
      </View>
    );
  }

  if (error || !data.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || t.errorNoData}
        </Text>
      </View>
    );
  }

  const vocab = data[index];
  const translationLabel =
    LANGUAGE_LABELS[language] || LANGUAGE_LABELS.bangla;
  const translationValue = getTranslationForLanguage(vocab, language);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Chapter {chapterNum} – {level} Quiz
      </Text>
      <Text style={styles.subtitle}>{t.subtitle}</Text>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => setShowAnswer((prev) => !prev)}
      >
        <Text style={styles.word}>{vocab.word}</Text>

        {showAnswer ? (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>{translationLabel}:</Text>
            <Text style={styles.value}>{translationValue}</Text>

            <Text style={[styles.label, { marginTop: 8 }]}>
              English:
            </Text>
            <Text style={styles.value}>{vocab.english}</Text>

            <Text style={[styles.label, { marginTop: 8 }]}>
              Sentence:
            </Text>
            <Text style={styles.value}>{vocab.sentence}</Text>
          </View>
        ) : (
          <Text style={styles.hint}>{t.tapHint}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnWrong, saving && { opacity: 0.7 }]}
          onPress={handleDontKnow}
          disabled={saving}
        >
          <Text style={styles.btnText}>{t.btnDontKnow}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnCorrect, saving && { opacity: 0.7 }]}
          onPress={handleIKnow}
          disabled={saving}
        >
          <Text style={styles.btnText}>{t.btnKnow}</Text>
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
