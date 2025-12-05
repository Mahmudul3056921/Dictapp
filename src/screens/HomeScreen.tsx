// src/screens/HomeScreen.tsx
import React, { useEffect, useRef, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  StatusBar,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import MaterialButton from "../components/MaterialButton";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext, Language } from "../context/LanguageContext";
import { Icons } from "../components/Icons";
import Ionicons from "react-native-vector-icons/Ionicons";
import api from "../api/client";

/* ---------------- SVG ICON COMPONENTS (top-level) ---------------- */
const QuizIcon = () => <Icons.Icon8 width={30} height={30} />;
const ProgressIcon = () => <Icons.Icon21 width={30} height={30} />;
const BookIcon = () => <Icons.Icon18 width={30} height={30} />;
const UserIcon = () => <Icons.Icon14 width={26} height={26} />;

/* ---------------------------------------------------
   FULL HOME_TEXTS (ALL LANGUAGES REQUIRED BY TS)
--------------------------------------------------- */
const HOME_TEXTS: Record<
  Language,
  {
    heroBadge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroTitle3: string;
    heroParagraph: string;
    btnLearn: string;
    btnQuiz: string;
    studentsLine: string;
    feature1Title: string;
    feature1Text: string;
    feature2Title: string;
    feature2Text: string;
    feature3Title: string;
    feature3Text: string;
    partnersHeading: string;
  }
> = {
  bangla: {
    heroBadge: "জার্মান শিখুন • Quiz + Vocabulary",
    heroTitle1: "জার্মান",
    heroTitle2: "স্মার্টভাবে",
    heroTitle3: "শিখুন",
    heroParagraph:
      "যেখানে খুশি, যখন খুশি—মোবাইলে জার্মান শব্দ অনুশীলন করুন ও কুইজের মাধ্যমে দক্ষতা যাচাই করুন। অন্যদের তুলনায় দ্রুত শিখুন, শব্দগুলো স্থায়ীভাবে মনে রাখুন।",
    btnLearn: "শুরু করুন (LEARN)",
    btnQuiz: "কুইজ খেলুন",
    studentsLine: "100+ শিক্ষার্থী ইতিমধ্যে AusbildungFit দিয়ে অনুশীলন করছেন",
    feature1Title: "কুইজ খেলুন",
    feature1Text: "ঝটপট কুইজের মাধ্যমে নতুন শব্দ যাচাই করুন।",
    feature2Title: "আপনার অগ্রগতি",
    feature2Text: "অধ্যায় অনুযায়ী ফলাফল দেখে দুর্বল দিক বুঝে নিন।",
    feature3Title: "প্রয়োজনীয় শব্দভাণ্ডার",
    feature3Text: "A1/A2/B1 অনুযায়ী সাজানো দরকারি শব্দতালিকা।",
    partnersHeading: "আমাদের সহযোগী প্রতিষ্ঠান",
  },

  english: {
    heroBadge: "Learn German • Quiz + Vocabulary",
    heroTitle1: "Learn",
    heroTitle2: "German",
    heroTitle3: "smarter",
    heroParagraph:
      "Practice German words anytime, anywhere and test yourself with quizzes.",
    btnLearn: "Start Learning",
    btnQuiz: "Play Quiz",
    studentsLine: "100+ learners are already using AusbildungFit",
    feature1Title: "Play Quiz",
    feature1Text: "Quick quizzes help test new words.",
    feature2Title: "Track Progress",
    feature2Text: "Instant insights into weak areas.",
    feature3Title: "Essential Vocabulary",
    feature3Text: "A1/A2/B1 word lists sorted for you.",
    partnersHeading: "Our partner organisations",
  },

  hindi: {
    heroBadge: "जर्मन सीखें • Quiz + Vocabulary",
    heroTitle1: "जर्मन",
    heroTitle2: "स्मार्ट तरीके से",
    heroTitle3: "सीखें",
    heroParagraph:
      "जहाँ चाहें, जब चाहें – मोबाइल पर जर्मन शब्दों की प्रैक्टिस करें और क्विज़ से खुद को टेस्ट करें।",
    btnLearn: "शुरू करें (LEARN)",
    btnQuiz: "क्विज़ खेलें",
    studentsLine: "100+ विद्यार्थी पहले से ही अभ्यास कर रहे हैं",
    feature1Title: "क्विज़ खेलें",
    feature1Text: "तेज़ क्विज़ से तुरंत टेस्ट करें।",
    feature2Title: "आपकी प्रगति",
    feature2Text: "कमजोर भागों को पहचानें।",
    feature3Title: "ज़रूरी शब्दावली",
    feature3Text: "A1/A2/B1 स्तर के शब्द.",
    partnersHeading: "हमारे पार्टनर संस्थान",
  },

  urdu: {
    heroBadge: "جرمن سیکھیں • Quiz + Vocabulary",
    heroTitle1: "جرمن",
    heroTitle2: "سمارٹ طریقے سے",
    heroTitle3: "سیکھیں",
    heroParagraph:
      "کہیں بھی، کبھی بھی — موبائل پر الفاظ کی مشق کریں اور کوئز سے خود کو آزمائیں۔",
    btnLearn: "شروع کریں (LEARN)",
    btnQuiz: "کوئز کھیلیں",
    studentsLine: "100+ طلبہ पहले ही مشق कर रहे हैं",
    feature1Title: "کوئز کھیلیں",
    feature1Text: "تیز کوئز سے نئے الفاظ سیکھیں।",
    feature2Title: "آپ کی پیش رفت",
    feature2Text: "فوراً کمزور حصے معلوم کریں।",
    feature3Title: "اہم الفاظ",
    feature3Text: "A1/A2/B1 سطح کی لغت.",
    partnersHeading: "ہمارے پارٹنر ادارے",
  },

  tamil: {
    heroBadge: "ஜெர்மன் கற்போம் • Quiz + Vocabulary",
    heroTitle1: "ஜெர்மன்",
    heroTitle2: "ஸ்மார்டாக",
    heroTitle3: "கற்போம்",
    heroParagraph:
      "எங்கே இருந்தாலும் – மொபைலில் வார்த்தைகளைப் பயிற்சி செய்து க்விஸ் மூலம் டெஸ்ட் செய்யுங்கள்.",
    btnLearn: "தொடங்குங்கள் (LEARN)",
    btnQuiz: "க்விஸ் விளையாடுங்கள்",
    studentsLine: "100+ மாணவர்கள் ஏற்கனவே பயிற்சி செய்கிறார்கள்",
    feature1Title: "க்விஸ் விளையாடுங்கள்",
    feature1Text: "வேகமான க்விஸ்கள் மூலம் பரிசோதியுங்கள்.",
    feature2Title: "உங்கள் முன்னேற்றம்",
    feature2Text: "உங்கள் பலவீனங்களை கண்டறியுங்கள்.",
    feature3Title: "முக்கிய சொற்கள்",
    feature3Text: "A1/A2/B1 லெவல் சொல்லகங்கள்.",
    partnersHeading: "எங்கள் கூட்டாளர் நிறுவனங்கள்",
  },

  malayalam: {
    heroBadge: "ജർമ്മൻ പഠിക്കൂ • Quiz + Vocabulary",
    heroTitle1: "ജർമ്മൻ",
    heroTitle2: "സ്മാർട്ടായി",
    heroTitle3: "പഠിക്കൂ",
    heroParagraph:
      "എവിടെയിരുന്നാലും – മൊബൈലിൽ തന്നെ വാക്കുകൾ അഭ്യസിക്കൂ, ക്വിസ് പരീക്ഷിക്കൂ.",
    btnLearn: "തുടങ്ങൂ (LEARN)",
    btnQuiz: "ക്വിസ് കളിക്കൂ",
    studentsLine: "100+ വിദ്യാർത്ഥികൾ ഇതിനകം അഭ്യസിക്കുന്നു",
    feature1Title: "ക്വിസ് കളിക്കൂ",
    feature1Text: "പുതിയ വാക്കുകൾ പരിശോധിക്കൂ.",
    feature2Title: "നിങ്ങളുടെ പുരോഗതി",
    feature2Text: "ദുർബല ഭാഗങ്ങൾ കണ്ടുപിടിക്കൂ.",
    feature3Title: "പ്രധാന വാക്കുകൾ",
    feature3Text: "A1/A2/B1 ലെവൽ അടിസ്ഥാന വാക്കുകൾ.",
    partnersHeading: "ഞങ്ങളുടെ പങ്കാളികൾ",
  },

  nepali: {
    heroBadge: "जर्मन सिक्नुहोस् • Quiz + Vocabulary",
    heroTitle1: "जर्मन",
    heroTitle2: "स्मार्ट तरिकाले",
    heroTitle3: "सिक्नुहोस्",
    heroParagraph:
      "जहिले पनि, जहाँबाट पनि – मोबाइलमै जर्मन शब्द अभ्यास गर्नुहोस्।",
    btnLearn: "सुरु गर्नुहोस् (LEARN)",
    btnQuiz: "क्विज खेल्नुहोस्",
    studentsLine: "100+ विद्यार्थी अभ्यास गरिरहेका छन्",
    feature1Title: "क्विज खेल्नुहोस्",
    feature1Text: "छिटो क्विजले परीक्षण गर्छ।",
    feature2Title: "तपाईँको प्रगति",
    feature2Text: "कमजोर पक्ष पत्ता लगाउनुहोस्।",
    feature3Title: "महत्वपूर्ण शब्दहरू",
    feature3Text: "A1/A2/B1 शब्दसूची.",
    partnersHeading: "हाम्रा साझेदार संस्था",
  },

  arabic: {
    heroBadge: "تعلّم الألمانية • Quiz + Vocabulary",
    heroTitle1: "تعلّم",
    heroTitle2: "الألمانية",
    heroTitle3: "بذكاء",
    heroParagraph:
      "تدرّب على الكلمات الألمانية عبر هاتفك واختبر نفسك بالكوّيز.",
    btnLearn: "ابدأ الآن (LEARN)",
    btnQuiz: "العب الكويز",
    studentsLine: "أكثر من 100 متعلّم معنا",
    feature1Title: "العب الكويز",
    feature1Text: "اختبارات سريعة للكلمات الجديدة.",
    feature2Title: "تقدّمك الدراسي",
    feature2Text: "اكتشف نقاط ضعفك.",
    feature3Title: "المفردات الأساسية",
    feature3Text: "حسب المستويات A1/A2/B1.",
    partnersHeading: "شركاؤنا",
  },
};

/* ------------------ LANGUAGE LABELS ------------------ */
const LANGUAGE_LABELS: Record<Language, string> = {
  bangla: "বাংলা",
  english: "EN",
  hindi: "हिन्दी",
  urdu: "اردو",
  tamil: "தமிழ்",
  malayalam: "മലയാളം",
  nepali: "नेपाली",
  arabic: "عربي",
};

/* Which DB field to show as meaning, based on selected language */
const LANGUAGE_TO_MEANING_FIELD: Record<Language, string | null> = {
  bangla: "bangla",
  english: null, // only English meaning
  hindi: "hindi",
  urdu: "urdu",
  tamil: "tamil",
  malayalam: "malayalam",
  nepali: "nepali",
  arabic: "arabic",
};

/* Label for the local meaning line */
const LANGUAGE_MEANING_LABEL: Record<Language, string> = {
  bangla: "Bangla",
  english: "",
  hindi: "Hindi",
  urdu: "Urdu",
  tamil: "Tamil",
  malayalam: "Malayalam",
  nepali: "Nepali",
  arabic: "Arabic",
};

const LANGUAGE_ORDER: Language[] = [
  "bangla",
  "english",
  "hindi",
  "urdu",
  "tamil",
  "malayalam",
  "nepali",
  "arabic",
];

/* ------------------ LOGOS ------------------ */
const LOGOS = [
  require("../assets/logos/logo1.png"),
  require("../assets/logos/logo2.png"),
  require("../assets/logos/logo3.png"),
  require("../assets/logos/logo4.png"),
  require("../assets/logos/logo1.png"),
  require("../assets/logos/logo2.png"),
  require("../assets/logos/logo3.png"),
  require("../assets/logos/logo4.png"),
];

/* ---------------------------------------------------
   COMPONENT START
--------------------------------------------------- */

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const scrollX = useRef(new Animated.Value(0)).current;

  const { user } = useContext(AuthContext);
  const { language, setLanguage } = useContext(LanguageContext);

  const [showLangMenu, setShowLangMenu] = useState(false);

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const t = HOME_TEXTS[language];
  const profilePhoto = user?.photoURL ?? null;

  const meaningField = LANGUAGE_TO_MEANING_FIELD[language];
  const meaningLabel = LANGUAGE_MEANING_LABEL[language];

  // Only logged-in, non-basic users can search
  const canSearch =
    !!user && (user as any).role && (user as any).role !== "basic user";

  /* --- LOGO MARQUEE ANIMATION --- */
  useEffect(() => {
    const totalWidth = LOGOS.length * 80;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollX, {
          toValue: -totalWidth,
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(scrollX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [scrollX]);

  const duplicatedLogos = [...LOGOS, ...LOGOS];

  // 🔍 Search handler (called from debounce effect and search icon)
  const handleSearch = async (word: string) => {
    if (!word) return;
    try {
      setSearchLoading(true);
      setSearchError(null);
      setSearchResult(null);

      const res = await api.get("/search", {
        params: { word },
      });

      const data = res.data || {};
      if (!data || Object.keys(data).length === 0) {
        setSearchError("No result found for this word.");
        setSearchResult(null);
      } else {
        setSearchResult(data);
      }
    } catch (err: any) {
      console.log("Search error:", err?.response?.data || err.message);
      setSearchError("Search failed. Please try again.");
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // 🔁 Debounce: search automatically as user types (no need to press enter)
  useEffect(() => {
    if (!canSearch) return;

    const term = searchQuery.trim();

    if (!term) {
      setSearchResult(null);
      setSearchError(null);
      return;
    }

    const id = setTimeout(() => {
      handleSearch(term);
    }, 400); // 400ms after user stops typing

    return () => clearTimeout(id);
  }, [searchQuery, canSearch]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ---------------- APP BAR ---------------- */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <Image
            source={require("../assets/profile.png")}
            style={styles.appBarLogo}
          />
          <View>
            <Text style={styles.appBarTitle}>AusbildungFit</Text>
            <Text style={styles.appBarSubtitle}>German made simple</Text>
          </View>
        </View>

        <View style={styles.appBarRight}>
          <View style={styles.languageToggleWrapper}>
            <Pressable
              style={styles.languageButton}
              onPress={() => setShowLangMenu((prev) => !prev)}
            >
              <Text style={styles.languageButtonText}>
                {LANGUAGE_LABELS[language]}
              </Text>
            </Pressable>

            {showLangMenu && (
              <View style={styles.languageMenu}>
                {LANGUAGE_ORDER.map((lang) => {
                  const active = lang === language;
                  return (
                    <Pressable
                      key={lang}
                      onPress={() => {
                        setLanguage(lang);
                        setShowLangMenu(false);
                      }}
                      style={[
                        styles.languageMenuItem,
                        active && styles.languageMenuItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.languageMenuItemText,
                          active && styles.languageMenuItemTextActive,
                        ]}
                      >
                        {LANGUAGE_LABELS[lang]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <Pressable
            style={styles.appBarIconWrapper}
            onPress={() => navigation.navigate("Profile")}
          >
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.profileAvatarImage}
              />
            ) : (
              <View style={styles.profileAvatar}>
                <UserIcon />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* 🔍 SEARCH BAR (ONLY FOR ELIGIBLE LOGGED-IN USERS) */}
      {canSearch && (
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search your German words…"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Pressable
              style={styles.searchIconButton}
              onPress={() => handleSearch(searchQuery.trim())}
            >
              {searchLoading ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
              <Icons.Icon15 width={36} height={36} />
              )}
            </Pressable>
          </View>
          {searchError && (
            <Text style={styles.searchErrorText}>{searchError}</Text>
          )}
        </View>
      )}

      {/* ---------------- MAIN CONTENT ---------------- */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔍 SEARCH RESULT CARD (IF ANY) */}
        {canSearch && searchResult && (
          <View style={styles.searchResultCard}>
            <Text style={styles.searchResultWord}>{searchResult.word}</Text>

            {/* Always English */}
            {searchResult.english && (
              <Text style={styles.searchResultLine}>
                English: {searchResult.english}
              </Text>
            )}

            {/* Local language meaning based on toggle */}
            {meaningField &&
              searchResult[meaningField] && (
                <Text style={styles.searchResultLine}>
                  {meaningLabel}: {searchResult[meaningField]}
                </Text>
              )}

            {searchResult.sentence && (
              <Text style={styles.searchResultSentence}>
                {searchResult.sentence}
              </Text>
            )}
          </View>
        )}

        {/* ---------------- HERO CARD ---------------- */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.heroBadge}</Text>
            </View>

            <Text style={styles.heroTitle}>
              {t.heroTitle1}{" "}
              <Text style={styles.heroTitleHighlight}>{t.heroTitle2}</Text>{" "}
              {t.heroTitle3}
            </Text>

            <Text style={styles.heroParagraph}>{t.heroParagraph}</Text>

            <View style={styles.buttonRow}>
              <MaterialButton
                label={t.btnLearn}
                type="primary"
                onPress={() => navigation.navigate("Learn")}
              />
            <MaterialButton
                label={t.btnQuiz}
                type="secondary"
                onPress={() => navigation.navigate("Quiz")}
              />
            </View>

            <View style={styles.studentsRow}>
              <View style={styles.avatars}>
                <View style={[styles.avatarBubble, styles.avatarPurple]} />
                <View style={[styles.avatarBubble, styles.avatarOrange]} />
                <View style={[styles.avatarBubble, styles.avatarGreen]} />
              </View>
              <Text style={styles.studentsText}>{t.studentsLine}</Text>
            </View>
          </View>

          <View style={styles.heroImageWrapper}>
  <Image
    source={require("../assets/banner.png")}
    style={styles.heroImage}
    resizeMode="cover"
  />
</View>
        </View>

        {/* ---------------- COLORFUL FEATURE CARDS (with SVG icons) ---------------- */}
        <View style={styles.featuresSection}>
          <View style={[styles.featureCardNew, styles.featureCardPrimary]}>
            <View style={styles.featureIconWrapper}>
              <QuizIcon />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitleNew}>{t.feature1Title}</Text>
              <Text style={styles.featureTextNew}>{t.feature1Text}</Text>
            </View>
          </View>

          <View style={[styles.featureCardNew, styles.featureCardSecondary]}>
            <View style={styles.featureIconWrapper}>
              <ProgressIcon />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitleNew}>{t.feature2Title}</Text>
              <Text style={styles.featureTextNew}>{t.feature2Text}</Text>
            </View>
          </View>

          <View style={[styles.featureCardNew, styles.featureCardTertiary]}>
            <View style={styles.featureIconWrapper}>
              <BookIcon />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitleNew}>{t.feature3Title}</Text>
              <Text style={styles.featureTextNew}>{t.feature3Text}</Text>
            </View>
          </View>
        </View>

        {/* ---------------- PARTNER LOGOS ---------------- */}
        <View style={styles.partnersSection}>
          <Text style={styles.partnersHeading}>{t.partnersHeading}</Text>

          <View style={styles.logoMarqueeContainer}>
            <Animated.View
              style={[
                styles.logoMarqueeInner,
                { transform: [{ translateX: scrollX }] },
              ]}
            >
              {duplicatedLogos.map((logo, index) => (
                <View key={index} style={styles.logoWrapper}>
                  <Image
                    source={logo}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

/* ---------------------------------------------------
   STYLES
--------------------------------------------------- */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EEF2FF",
  },

  /* --- APP BAR --- */
  appBar: {
    height: 56,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    elevation: 4,
    zIndex: 20,
  },

  appBarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  appBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  appBarIconWrapper: {
    padding: 4,
  },

  appBarLogo: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  appBarSubtitle: {
    fontSize: 11,
    color: "#6B7280",
  },

  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    color: "#FFF",
    fontWeight: "700",
  },
  profileAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  /* --- LANGUAGE MENU --- */
  languageToggleWrapper: { position: "relative" },

  languageButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  languageButtonText: {
    fontSize: 11,
    fontWeight: "600",
  },

  languageMenu: {
    position: "absolute",
    top: 34,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 4,
    elevation: 4,
    minWidth: 90,
    zIndex: 30,
  },
  languageMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  languageMenuItemActive: {
    backgroundColor: "#EEF2FF",
  },
  languageMenuItemText: {
    fontSize: 12,
  },
  languageMenuItemTextActive: {
    fontWeight: "700",
    color: "#4F46E5",
  },

  /* 🔍 SEARCH BAR */
  searchBarWrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
    color: "#111827",
  },
  searchIconButton: {
    marginLeft: 6,
    padding: 4,
  },
  searchErrorText: {
    marginTop: 4,
    fontSize: 11,
    color: "#DC2626",
  },
  searchResultCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    elevation: 2,
  },
  searchResultWord: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  searchResultLine: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  searchResultSentence: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },

  /* --- HERO CARD --- */
  container: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },

  heroTextContainer: { marginBottom: 16 },

  badge: {
    backgroundColor: "#E0E7FF",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    color: "#4F46E5",
    fontWeight: "600",
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },
  heroTitleHighlight: {
    color: "#4F46E5",
  },

  heroParagraph: {
    marginTop: 6,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },

  buttonRow: {
    flexDirection: "row",
    columnGap: 10,
    marginTop: 14,
  },

  studentsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  avatars: {
    flexDirection: "row",
    marginRight: 8,
  },
  avatarBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarPurple: { backgroundColor: "#6366F1" },
  avatarOrange: { backgroundColor: "#F59E0B", marginLeft: -10 },
  avatarGreen: { backgroundColor: "#10B981", marginLeft: -10 },

  studentsText: {
    fontSize: 11,
    color: "#6B7280",
  },

  /* --- HERO IMAGE --- */
 heroImageWrapper: {
  marginTop: 10,
  borderRadius: 20,
  overflow: "hidden",      // 🔑 makes the image corners actually round
  width: "100%",           // full width of the hero card
  alignSelf: "center",
},
heroImage: {
  width: "100%",
  height: 180,
  borderRadius: 20,        // rounded corners
},
// (Optional) if not using circles anymore, you can delete heroCircleOne / heroCircleTwo

 

  /* --- NEW COLORFUL FEATURE CARDS --- */
  featuresSection: {
    marginBottom: 20,
    rowGap: 12,
  },

  featureCardNew: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 2,
  },

  featureCardPrimary: {
    backgroundColor: "#4F46E5",
  },
  featureCardSecondary: {
    backgroundColor: "#0EA5E9",
  },
  featureCardTertiary: {
    backgroundColor: "#16A34A",
  },

  featureIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  featureTextWrapper: { flex: 1 },

  featureTitleNew: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  featureTextNew: {
    fontSize: 12,
    lineHeight: 18,
    color: "#F1F5F9",
  },

  /* --- PARTNERS --- */
  partnersSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
  },
  partnersHeading: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  logoMarqueeContainer: {
    overflow: "hidden",
    height: 60,
  },
  logoMarqueeInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrapper: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 60,
    height: 40,
  },
});
