/**
 * English strings - the source of truth for the whole app.
 *
 * The keys defined here become the TranslationKey type, so every other locale is
 * forced by the compiler to translate exactly this set: a missing or misspelt key
 * is a build error, not a silent English fallback at runtime.
 *
 * Tokens in braces (`{name}`) are filled by t()/tc(). A key ending in `_one` /
 * `_other` is a counted string picked by tc() based on the count.
 */
export const en = {
  // ---- Navigation chrome ----------------------------------------------------
  'nav.course': 'Course',
  'nav.review': 'Review',
  'nav.settings': 'Settings',
  'nav.loading': 'Loading Synapse…',

  'tab.brain': 'Brain',
  'tab.tasks': 'Tasks',
  'tab.practice': 'Practice',
  'tab.profile': 'Profile',

  // ---- Welcome --------------------------------------------------------------
  'welcome.tagline': 'Train your brain to think in English',
  'welcome.point1': 'Five focused minutes a day',
  'welcome.point2': 'Spaced repetition timed to how memory fades',
  'welcome.point3': 'A steady rhythm, so the habit holds',
  'welcome.getStarted': 'Get started',
  'welcome.haveAccount': 'I already have an account',

  // ---- Home -----------------------------------------------------------------
  'home.greetingMorning': 'Good morning',
  'home.greetingAfternoon': 'Good afternoon',
  'home.greetingEvening': 'Good evening',
  'home.greetingNamed': '{greeting}, {name}',
  'home.streak': 'streak',
  'home.streakValue': '{count}-day',
  'home.neuralStrength': 'neural strength',
  'home.brainToday': 'Your brain today',
  'home.tapRegion': 'Tap a region',
  'home.strongest': 'Strongest',
  'home.focusNext': 'Focus next',
  'home.todaysGoal': "Today's goal",
  'home.goalMet': "Today's goal met",
  'home.goalProgress': '{done} / {goal}',
  'home.continueLearning': 'Continue learning',
  'home.lessonMeta': '{unit} · {minutes} min · +{xp} XP',
  'home.memoryCheck': 'Memory check',
  'home.dueBadge': '{count} due',
  'home.wordsFading_one': '{count} word about to fade. A quick pass keeps it.',
  'home.wordsFading_other': '{count} words about to fade. A quick pass keeps them.',
  'home.moreCourses': 'More courses',
  'home.start': 'Start →',
  'home.errorLoading': 'Could not load your courses.',

  // ---- Tasks ----------------------------------------------------------------
  'tasks.today': 'Today',
  'tasks.allDone': 'Every pathway on the list is stronger than it was this morning.',
  'tasks.balanced': 'Balanced across regions · about {minutes} left',
  'tasks.done': '{completed} / {total} done',
  'tasks.goalSuffix': '{minutes} goal',
  'tasks.doneBadge': 'Done',
  'tasks.strengthens': 'Strengthens {region}',
  'tasks.nothingTitle': 'Nothing to train yet',
  'tasks.nothingDesc':
    'There are no lessons left at your level and no words are due. New content will show up here.',
  'tasks.building': "Building today's plan…",

  // ---- Practice -------------------------------------------------------------
  'practice.title': 'Practice',
  'practice.vocabReview': 'Vocabulary review',
  'practice.srsBlurb': 'Spaced repetition brings words back right before you would forget them.',
  'practice.dueNow': 'due now',
  'practice.new': 'new',
  'practice.reviewWords_one': 'Review {count} word',
  'practice.reviewWords_other': 'Review {count} words',
  'practice.nothingDue': 'Nothing due yet',
  'practice.addNewWords': 'Add new words',
  'practice.wordsReady_one': '{count} word at level {level} ready to start learning.',
  'practice.wordsReady_other': '{count} words at level {level} ready to start learning.',
  'practice.allStarted':
    'You have started every word available at your level. New content will show up here.',
  'practice.addToReview_one': 'Add {count} word to review',
  'practice.addToReview_other': 'Add {count} words to review',
  'practice.nothingToAdd': 'Nothing to add',
  'practice.addError': 'Could not add the words. Please try again.',

  // ---- Profile --------------------------------------------------------------
  'profile.fallback': 'Profile',
  'profile.level': 'Level {level}',
  'profile.dayStreak': 'day streak',
  'profile.neuralStrength': 'neural strength',
  'profile.thisWeek': 'This week',
  'profile.longestStreak': 'Longest streak',
  'profile.longestStreakValue_one': '{count} day',
  'profile.longestStreakValue_other': '{count} days',
  'profile.lessonsCompleted': 'Lessons completed',
  'profile.wordsLearned': 'Words learned',
  'profile.wordsDue': 'Words due for review',
  'profile.dailyGoal': 'Daily goal',
  'profile.targetLevel': 'Target level',
  'profile.settings': 'Settings',

  // ---- Settings -------------------------------------------------------------
  'settings.learning': 'Learning',
  'settings.learningFooter':
    'Only English has lessons today. The other languages are listed so you can see what is coming.',
  'settings.imLearning': "I'm learning",
  'settings.myLanguage': 'My language',
  'settings.myLanguageDesc': 'Used for translations and hints',
  'settings.dailyGoal': 'Daily goal',
  'settings.goalPerDay': '{minutes} a day',
  'settings.level': 'Level',
  'settings.currentLevel': 'Current level',
  'settings.currentLevelDesc': 'Set when you joined. A placement check is coming.',
  'settings.reminders': 'Reminders',
  'settings.remindersFooter': 'Memory fades without recall. A gentle nudge keeps your pathways lit.',
  'settings.dailyReminder': 'Daily reminder',
  'settings.reminderAt': 'At {time}',
  'settings.reminderOff': 'Off - no reminder scheduled',
  'settings.app': 'App',
  'settings.interfaceLanguage': 'Interface language',
  'settings.appearance': 'Appearance',
  'settings.themeDeepSpace': 'Deep Space',
  'settings.themeDeepSpaceDesc': 'The brand theme. Recommended.',
  'settings.themeLight': 'Light',
  'settings.themeLightDesc': 'A lighter variant for bright rooms.',
  'settings.themeSystem': 'Match device',
  'settings.themeSystemDesc': 'Follow your system appearance.',
  'settings.sound': 'Sound effects',
  'settings.haptics': 'Haptics',
  'settings.account': 'Account',
  'settings.signedInAs': 'Signed in as',
  'settings.signOut': 'Sign out',
  'settings.version': '{name} v{version}',
  'settings.learningPickerTitle': 'What are you learning?',
  'settings.nativePickerTitle': 'Your language',
  'settings.uiPickerTitle': 'Interface language',
  'settings.signOutTitle': 'Sign out',
  'settings.signOutBody': 'You can pick up where you left off any time.',
  'settings.signOutCancel': 'Cancel',
  'settings.signOutConfirm': 'Sign out',
  'settings.signOutFailed': 'Sign out failed',
  'settings.couldNotSave': 'Could not save',
  'settings.tryAgain': 'Please try again.',

  // ---- Units (locale-aware formatting fallbacks) ----------------------------
  'units.minutes': '{count} min',
  'units.hours': '{count} h',
  'units.hoursMinutes': '{hours} h {minutes} min',
};

export type TranslationKey = keyof typeof en;
