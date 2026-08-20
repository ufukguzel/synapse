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

  // ---- Auth (shared) --------------------------------------------------------
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.invalidEmail': 'Enter a valid email address.',
  'auth.enterPassword': 'Enter your password.',
  'auth.couldNotSignIn': 'Could not sign in.',
  'auth.couldNotCreate': 'Could not create the account.',
  'auth.backendSignIn': 'Backend is not configured yet, so sign-in is unavailable.',
  'auth.backendSignUp': 'Backend is not configured yet, so accounts cannot be created.',

  'signin.title': 'Welcome back',
  'signin.subtitle': 'Pick up where you left off.',
  'signin.signIn': 'Sign in',
  'signin.forgot': 'Forgot password?',

  'signup.title': 'Create your account',
  'signup.subtitle': 'Five minutes a day is all it takes to start.',
  'signup.name': 'Name',
  'signup.namePlaceholder': 'Your name',
  'signup.passwordPlaceholder': 'At least 8 characters',
  'signup.passwordHint': '8+ characters, with a letter and a number.',
  'signup.create': 'Create account',

  'forgot.title': 'Reset password',
  'forgot.subtitle': "We'll email you a link to choose a new password.",
  'forgot.inboxHint': 'Check your inbox.',
  'forgot.sent': 'Sent',
  'forgot.send': 'Send reset link',

  // ---- Onboarding -----------------------------------------------------------
  'onb.continue': 'Continue',
  'onb.lang.title': 'Which language?',
  'onb.lang.subtitle': 'Pick what you want to learn, and the language we should explain things in.',
  'onb.lang.wantToLearn': 'I want to learn',
  'onb.lang.myLanguage': 'My language',
  'onb.lang.comingSoon': 'Content coming soon',
  'onb.lang.notAvailable': 'Not available yet',
  'onb.level.title': "What's your level?",
  'onb.level.subtitle': 'Pick the one that feels closest. You can change it any time.',
  'onb.goal.title': 'Daily goal',
  'onb.goal.subtitle': 'Consistency beats intensity. Start small.',
  'onb.goal.hint5': 'One short session - easiest to keep up.',
  'onb.goal.hint10': 'The sweet spot for most learners.',
  'onb.goal.hint15': 'Steady progress without a big time commitment.',
  'onb.goal.hint20': 'Two sessions a day, or one longer one.',
  'onb.goal.hint30': 'Serious pace. Best if you already have a routine.',
  'onb.reminder.title': 'Stay on track',
  'onb.reminder.subtitle':
    'Daily reminders keep your streak alive. You can turn them on later in Settings.',
  'onb.reminder.start': 'Start learning',

  // ---- CEFR levels ----------------------------------------------------------
  'level.a1.title': 'Beginner',
  'level.a1.desc': 'Can understand and use basic everyday expressions.',
  'level.a2.title': 'Elementary',
  'level.a2.desc': 'Can communicate in simple, routine tasks.',
  'level.b1.title': 'Intermediate',
  'level.b1.desc': 'Can handle most travel and work situations.',
  'level.b2.title': 'Upper Intermediate',
  'level.b2.desc': 'Can interact with fluency and spontaneity.',
  'level.c1.title': 'Advanced',
  'level.c1.desc': 'Can express ideas fluently and precisely.',
  'level.c2.title': 'Proficient',
  'level.c2.desc': 'Can understand virtually everything with ease.',

  // ---- Lesson ---------------------------------------------------------------
  'lesson.noExercisesTitle': 'No exercises',
  'lesson.noExercisesDesc': 'This lesson has no content yet.',
  'lesson.goBack': 'Go back',
  'lesson.question': 'Question {current} of {total}',

  // ---- Lesson result --------------------------------------------------------
  'result.sessionEnded': 'Session ended',
  'result.practiceRound': 'Practice round',
  'result.pathwayStrengthened': 'Pathway strengthened',
  'result.outOfHearts': 'Out of hearts',
  'result.alreadyMastered': 'Already mastered',
  'result.thatStuck': 'That one stuck',
  'result.forming': 'Pathway is forming',
  'result.failedSub': 'Nothing lost — the lesson stays open. Come back when you are ready.',
  'result.repeatSub':
    'XP for this lesson was already earned — great for practice, no extra XP this time.',
  'result.goodSub': 'Nice — that pathway just got stronger. One more and it sticks.',
  'result.formingSub': 'Some of it landed. A second pass will do the rest.',
  'result.xpEarned': 'XP earned',
  'result.accuracy': 'Accuracy',
  'result.backToLessons': 'Back to lessons',
  'result.done': 'Done',

  // ---- Vocabulary review ----------------------------------------------------
  'vocab.allCaughtTitle': 'All caught up',
  'vocab.allCaughtDesc': 'No words are due for review right now. Come back later.',
  'vocab.goBack': 'Go back',
  'vocab.finishedTitle': 'Review finished',
  'vocab.finishedDesc_one': 'You reviewed {count} word.',
  'vocab.finishedDesc_other': 'You reviewed {count} words.',
  'vocab.done': 'Done',
  'vocab.showAnswer': 'Show answer',
  'vocab.again': 'Again',
  'vocab.hard': 'Hard',
  'vocab.good': 'Good',
  'vocab.easy': 'Easy',

  // ---- Error view -----------------------------------------------------------
  'error.title': 'That did not go through',
  'error.generic': 'Something went wrong. Please try again.',
  'error.retry': 'Try again',

  // ---- Weekday initials (indexed 0=Sunday, matching Date.getDay) ------------
  'day.0': 'S',
  'day.1': 'M',
  'day.2': 'T',
  'day.3': 'W',
  'day.4': 'T',
  'day.5': 'F',
  'day.6': 'S',

  // ---- Units (locale-aware formatting fallbacks) ----------------------------
  'units.minutes': '{count} min',
  'units.hours': '{count} h',
  'units.hoursMinutes': '{hours} h {minutes} min',
};

export type TranslationKey = keyof typeof en;
