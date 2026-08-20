import type {TranslationKey} from './en';

/**
 * Turkish strings. Typed as Record<TranslationKey, string> so the compiler
 * rejects the build if any key from en.ts is missing here.
 *
 * Turkish has no plural inflection after a number ("5 kelime", not "5 kelimeler"),
 * so the _one / _other variants are usually identical - kept as separate keys only
 * to satisfy the shared shape.
 */
export const tr: Record<TranslationKey, string> = {
  // ---- Navigation chrome ----------------------------------------------------
  'nav.course': 'Kurs',
  'nav.review': 'Tekrar',
  'nav.settings': 'Ayarlar',
  'nav.loading': 'Synapse yükleniyor…',

  'tab.brain': 'Beyin',
  'tab.tasks': 'Görevler',
  'tab.practice': 'Alıştırma',
  'tab.profile': 'Profil',

  // ---- Welcome --------------------------------------------------------------
  'welcome.tagline': 'Beynini İngilizce düşünecek şekilde eğit',
  'welcome.point1': 'Günde beş dakikalık odaklı çalışma',
  'welcome.point2': 'Hafızanın unutma ritmine göre ayarlı aralıklı tekrar',
  'welcome.point3': 'İstikrarlı bir tempo, böylece alışkanlık yerleşir',
  'welcome.getStarted': 'Başla',
  'welcome.haveAccount': 'Zaten hesabım var',

  // ---- Home -----------------------------------------------------------------
  'home.greetingMorning': 'Günaydın',
  'home.greetingAfternoon': 'İyi günler',
  'home.greetingEvening': 'İyi akşamlar',
  'home.greetingNamed': '{greeting}, {name}',
  'home.streak': 'seri',
  'home.streakValue': '{count} gün',
  'home.neuralStrength': 'nöral güç',
  'home.brainToday': 'Bugün beynin',
  'home.tapRegion': 'Bir bölgeye dokun',
  'home.strongest': 'En güçlü',
  'home.focusNext': 'Sıradaki odak',
  'home.todaysGoal': 'Bugünkü hedef',
  'home.goalMet': 'Bugünkü hedef tamamlandı',
  'home.goalProgress': '{done} / {goal}',
  'home.continueLearning': 'Öğrenmeye devam et',
  'home.lessonMeta': '{unit} · {minutes} dk · +{xp} XP',
  'home.memoryCheck': 'Hafıza kontrolü',
  'home.dueBadge': '{count} bekliyor',
  'home.wordsFading_one': '{count} kelime unutulmak üzere. Hızlı bir tekrar onu korur.',
  'home.wordsFading_other': '{count} kelime unutulmak üzere. Hızlı bir tekrar onları korur.',
  'home.moreCourses': 'Diğer kurslar',
  'home.start': 'Başla →',
  'home.errorLoading': 'Kursların yüklenemedi.',

  // ---- Tasks ----------------------------------------------------------------
  'tasks.today': 'Bugün',
  'tasks.allDone': 'Listedeki her yolak bu sabahkinden daha güçlü.',
  'tasks.balanced': 'Bölgelere dengeli dağıtıldı · yaklaşık {minutes} kaldı',
  'tasks.done': '{completed} / {total} tamamlandı',
  'tasks.goalSuffix': '{minutes} hedef',
  'tasks.doneBadge': 'Bitti',
  'tasks.strengthens': '{region} bölgesini güçlendirir',
  'tasks.nothingTitle': 'Henüz çalışılacak bir şey yok',
  'tasks.nothingDesc':
    'Seviyende kalan ders yok ve tekrarı gereken kelime yok. Yeni içerik burada görünecek.',
  'tasks.building': 'Bugünkü plan hazırlanıyor…',

  // ---- Practice -------------------------------------------------------------
  'practice.title': 'Alıştırma',
  'practice.vocabReview': 'Kelime tekrarı',
  'practice.srsBlurb': 'Aralıklı tekrar, kelimeleri tam unutmadan önce yeniden karşına getirir.',
  'practice.dueNow': 'şimdi',
  'practice.new': 'yeni',
  'practice.reviewWords_one': '{count} kelime tekrar et',
  'practice.reviewWords_other': '{count} kelime tekrar et',
  'practice.nothingDue': 'Henüz tekrar yok',
  'practice.addNewWords': 'Yeni kelimeler ekle',
  'practice.wordsReady_one': '{level} seviyesinde öğrenmeye hazır {count} kelime.',
  'practice.wordsReady_other': '{level} seviyesinde öğrenmeye hazır {count} kelime.',
  'practice.allStarted':
    'Seviyendeki tüm kelimelere başladın. Yeni içerik burada görünecek.',
  'practice.addToReview_one': 'Tekrara {count} kelime ekle',
  'practice.addToReview_other': 'Tekrara {count} kelime ekle',
  'practice.nothingToAdd': 'Eklenecek bir şey yok',
  'practice.addError': 'Kelimeler eklenemedi. Lütfen tekrar dene.',

  // ---- Profile --------------------------------------------------------------
  'profile.fallback': 'Profil',
  'profile.level': 'Seviye {level}',
  'profile.dayStreak': 'günlük seri',
  'profile.neuralStrength': 'nöral güç',
  'profile.thisWeek': 'Bu hafta',
  'profile.longestStreak': 'En uzun seri',
  'profile.longestStreakValue_one': '{count} gün',
  'profile.longestStreakValue_other': '{count} gün',
  'profile.lessonsCompleted': 'Tamamlanan dersler',
  'profile.wordsLearned': 'Öğrenilen kelimeler',
  'profile.wordsDue': 'Tekrarı gereken kelimeler',
  'profile.dailyGoal': 'Günlük hedef',
  'profile.targetLevel': 'Hedef seviye',
  'profile.settings': 'Ayarlar',

  // ---- Settings -------------------------------------------------------------
  'settings.learning': 'Öğrenme',
  'settings.learningFooter':
    'Bugün sadece İngilizce derslerine sahip. Diğer diller, neyin geleceğini görebilmen için listelendi.',
  'settings.imLearning': 'Öğrendiğim dil',
  'settings.myLanguage': 'Benim dilim',
  'settings.myLanguageDesc': 'Çeviriler ve ipuçları için kullanılır',
  'settings.dailyGoal': 'Günlük hedef',
  'settings.goalPerDay': 'Günde {minutes}',
  'settings.level': 'Seviye',
  'settings.currentLevel': 'Mevcut seviye',
  'settings.currentLevelDesc': 'Katıldığında ayarlandı. Bir seviye belirleme testi yolda.',
  'settings.reminders': 'Hatırlatıcılar',
  'settings.remindersFooter':
    'Hafıza, hatırlanmadan solar. Nazik bir dürtme yolaklarını aydınlık tutar.',
  'settings.dailyReminder': 'Günlük hatırlatıcı',
  'settings.reminderAt': 'Saat {time}',
  'settings.reminderOff': 'Kapalı - hatırlatıcı ayarlı değil',
  'settings.app': 'Uygulama',
  'settings.interfaceLanguage': 'Arayüz dili',
  'settings.appearance': 'Görünüm',
  'settings.themeDeepSpace': 'Derin Uzay',
  'settings.themeDeepSpaceDesc': 'Marka teması. Önerilir.',
  'settings.themeLight': 'Açık',
  'settings.themeLightDesc': 'Aydınlık ortamlar için daha açık bir varyant.',
  'settings.themeSystem': 'Cihazla eşleştir',
  'settings.themeSystemDesc': 'Sistem görünümünü takip et.',
  'settings.sound': 'Ses efektleri',
  'settings.haptics': 'Titreşim',
  'settings.account': 'Hesap',
  'settings.signedInAs': 'Giriş yapılan hesap',
  'settings.signOut': 'Çıkış yap',
  'settings.version': '{name} v{version}',
  'settings.learningPickerTitle': 'Ne öğreniyorsun?',
  'settings.nativePickerTitle': 'Senin dilin',
  'settings.uiPickerTitle': 'Arayüz dili',
  'settings.signOutTitle': 'Çıkış yap',
  'settings.signOutBody': 'İstediğin zaman kaldığın yerden devam edebilirsin.',
  'settings.signOutCancel': 'Vazgeç',
  'settings.signOutConfirm': 'Çıkış yap',
  'settings.signOutFailed': 'Çıkış yapılamadı',
  'settings.couldNotSave': 'Kaydedilemedi',
  'settings.tryAgain': 'Lütfen tekrar dene.',

  // ---- Units ----------------------------------------------------------------
  'units.minutes': '{count} dk',
  'units.hours': '{count} sa',
  'units.hoursMinutes': '{hours} sa {minutes} dk',
};
