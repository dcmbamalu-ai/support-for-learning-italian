const lessons = [
  {
    title: "A warm hello",
    description: "Start a conversation with a few friendly greetings.",
    icon: "👋",
    phrases: ["ciao", "buongiorno", "buonasera"],
    category: "Greetings",
  },
  {
    title: "Nice to meet you",
    description: "Introduce yourself and make a new connection.",
    icon: "🤝",
    phrases: ["mi chiamo", "piacere", "come ti chiami"],
    category: "Greetings",
  },
  {
    title: "The little courtesies",
    description: "A please, a thank you, and a little kindness.",
    icon: "🙏",
    phrases: ["per favore", "grazie", "scusa"],
    category: "Everyday",
  },
  {
    title: "Everyday moments",
    description: "Handle the small, useful things in your day.",
    icon: "☕",
    phrases: ["sì", "no", "non capisco"],
    category: "Everyday",
  },
  {
    title: "At the table",
    description: "Order something delicious and enjoy the moment.",
    icon: "🍽️",
    phrases: ["un caffè, per favore", "il conto, per favore", "acqua"],
    category: "Food",
  },
  {
    title: "Off we go",
    description: "Find your way and explore somewhere new.",
    icon: "🧭",
    phrases: ["dov'è il bagno?", "a destra", "quanto costa?"],
    category: "Travel",
  },
];

const phrases = [
  { italian: "Ciao", pronunciation: "chow", translation: "Hello / Goodbye", category: "Greetings" },
  { italian: "Buongiorno", pronunciation: "bwon-JOR-noh", translation: "Good morning / Good day", category: "Greetings" },
  { italian: "Buonasera", pronunciation: "bwoh-nah-SEH-rah", translation: "Good evening", category: "Greetings" },
  { italian: "Mi chiamo…", pronunciation: "mee kee-AH-moh", translation: "My name is…", category: "Greetings" },
  { italian: "Piacere", pronunciation: "pyah-CHEH-reh", translation: "Nice to meet you", category: "Greetings" },
  { italian: "Come ti chiami?", pronunciation: "KOH-meh tee KYAH-mee", translation: "What is your name?", category: "Greetings" },
  { italian: "Come stai?", pronunciation: "KOH-meh stye", translation: "How are you?", category: "Greetings" },
  { italian: "Per favore", pronunciation: "pehr fah-VOH-reh", translation: "Please", category: "Everyday" },
  { italian: "Grazie", pronunciation: "GRAHT-tsee-eh", translation: "Thank you", category: "Everyday" },
  { italian: "Prego", pronunciation: "PREH-goh", translation: "You're welcome", category: "Everyday" },
  { italian: "Scusa", pronunciation: "SKOO-zah", translation: "Excuse me / Sorry", category: "Everyday" },
  { italian: "Sì", pronunciation: "see", translation: "Yes", category: "Everyday" },
  { italian: "No", pronunciation: "noh", translation: "No", category: "Everyday" },
  { italian: "Non capisco", pronunciation: "nohn kah-PEES-koh", translation: "I don't understand", category: "Everyday" },
  { italian: "Un caffè, per favore", pronunciation: "oon kahf-FEH, pehr fah-VOH-reh", translation: "A coffee, please", category: "Food" },
  { italian: "Il conto, per favore", pronunciation: "eel KOHN-toh, pehr fah-VOH-reh", translation: "The bill, please", category: "Food" },
  { italian: "Acqua", pronunciation: "AHK-kwah", translation: "Water", category: "Food" },
  { italian: "È delizioso!", pronunciation: "eh deh-lee-TSYOH-zoh", translation: "It's delicious!", category: "Food" },
  { italian: "Dov'è il bagno?", pronunciation: "doh-VEH eel BAHN-yoh", translation: "Where is the bathroom?", category: "Travel" },
  { italian: "A destra", pronunciation: "ah DEH-strah", translation: "To the right", category: "Travel" },
  { italian: "A sinistra", pronunciation: "ah see-NEE-strah", translation: "To the left", category: "Travel" },
  { italian: "Quanto costa?", pronunciation: "KWAHN-toh KOH-stah", translation: "How much does it cost?", category: "Travel" },
  { italian: "Dov'è la stazione?", pronunciation: "doh-VEH lah stah-TSYOH-neh", translation: "Where is the station?", category: "Travel" },
  { italian: "La vita è bella", pronunciation: "lah VEE-tah eh BEHL-lah", translation: "Life is beautiful", category: "Everyday" },
];

const storageKeys = {
  saved: "parla-saved-phrases",
  completed: "parla-completed-lessons",
  practice: "parla-daily-practice",
};

const savedPhrases = new Set(readStorage(storageKeys.saved, []));
const completedLessons = new Set(readStorage(storageKeys.completed, []));
const todayKey = new Date().toLocaleDateString("en-CA");
const savedPractice = readStorage(storageKeys.practice, { date: todayKey, minutes: 0 });
const dailyPractice = savedPractice.date === todayKey ? savedPractice : { date: todayKey, minutes: 0 };
let activeView = "home";
let activeCategory = "All";
let showSavedOnly = false;
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let listenQuestions = [];
let listenIndex = 0;
let listenScore = 0;
let memoryCards = [];
let memorySelection = [];
let memoryMoves = 0;
let memoryLocked = false;
let memoryResetTimer;
let toastTimer;

const toast = document.querySelector("#toast");
const speechAvailable = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from local storage.`, error);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save ${key} to local storage.`, error);
    showToast("Your browser couldn't save this progress.");
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function speak(text) {
  if (!speechAvailable) {
    showToast("Audio isn't available in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";
  utterance.rate = 0.88;
  const italianVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("it"));
  if (italianVoice) utterance.voice = italianVoice;
  utterance.onerror = (event) => {
    if (event.error !== "interrupted" && event.error !== "canceled") {
      showToast("Audio couldn't be played. Please try again.");
    }
  };
  window.speechSynthesis.speak(utterance);
}

function updateStats() {
  const learnedWords = new Set(
    [...completedLessons].flatMap((lessonIndex) => lessons[lessonIndex]?.phrases ?? []),
  );
  document.querySelector("#words-learned").textContent = learnedWords.size;
  document.querySelector("#lessons-done").innerHTML =
    `${completedLessons.size}<span class="stat-total"> / ${lessons.length}</span>`;
  document.querySelector("#saved-count").textContent = savedPhrases.size;
  document.querySelector("#streak-count").textContent = dailyPractice.minutes > 0 ? "1" : "1";
  const minutes = Math.min(dailyPractice.minutes, 10);
  const goal = document.querySelector("#goal-ring");
  document.querySelector("#goal-minutes").textContent = minutes;
  goal.style.background = `conic-gradient(#769175 ${minutes * 10}%, #e8e9de 0)`;
  goal.setAttribute("aria-label", `Daily goal: ${minutes} of 10 minutes`);
}

function addPracticeMinutes(minutes) {
  dailyPractice.minutes = Math.min(10, dailyPractice.minutes + minutes);
  saveStorage(storageKeys.practice, dailyPractice);
  updateStats();
}

function showView(viewName) {
  activeView = viewName;
  document.querySelectorAll(".view").forEach((view) => {
    const isCurrent = view.id === `${viewName}-view`;
    view.classList.toggle("is-visible", isCurrent);
    view.hidden = !isCurrent;
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.view === viewName);
  });
  document.querySelector("#breadcrumb-current").textContent =
    viewName === "home" ? "HOME" : viewName === "phrases" ? "PHRASEBOOK" : "QUICK PRACTICE";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openLesson(index) {
  const lesson = lessons[index];
  if (!lesson) return;
  document.querySelector("#lesson-dialog-title").textContent = lesson.title;
  document.querySelector("#lesson-dialog-description").textContent = lesson.description;
  const phraseContainer = document.querySelector("#dialog-phrases");
  phraseContainer.replaceChildren();

  lesson.phrases.forEach((italian) => {
    const phrase = phrases.find((item) => item.italian.toLowerCase().startsWith(italian.toLowerCase()));
    if (!phrase) return;
    const row = document.createElement("div");
    row.className = "dialog-phrase";
    const text = document.createElement("div");
    const italianText = document.createElement("strong");
    italianText.textContent = phrase.italian;
    const translation = document.createElement("span");
    translation.textContent = phrase.translation;
    text.append(italianText, translation);
    const audio = document.createElement("button");
    audio.className = "round-audio";
    audio.type = "button";
    audio.textContent = "♫";
    audio.setAttribute("aria-label", `Listen to ${phrase.italian}`);
    audio.addEventListener("click", () => speak(phrase.italian));
    row.append(text, audio);
    phraseContainer.append(row);
  });

  const completeButton = document.querySelector("#lesson-complete");
  completeButton.dataset.lessonIndex = index;
  completeButton.disabled = completedLessons.has(index);
  completeButton.innerHTML = completedLessons.has(index)
    ? "Lesson completed <span aria-hidden=\"true\">✓</span>"
    : "Mark lesson complete <span aria-hidden=\"true\">✓</span>";
  completeButton.classList.toggle("is-completed", completedLessons.has(index));
  document.querySelector("#lesson-overlay").hidden = false;
  document.querySelector("#lesson-close").focus();
}

function renderLessons() {
  const grid = document.querySelector("#lesson-grid");
  grid.replaceChildren();
  lessons.forEach((lesson, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "lesson-card";
    card.setAttribute("aria-label", `Open lesson: ${lesson.title}`);
    const top = document.createElement("span");
    top.className = "lesson-top";
    const icon = document.createElement("span");
    icon.className = "lesson-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = lesson.icon;
    const status = document.createElement("span");
    status.className = "lesson-status";
    status.textContent = completedLessons.has(index) ? "COMPLETED" : "5 MIN";
    status.classList.toggle("is-done", completedLessons.has(index));
    top.append(icon, status);
    const title = document.createElement("strong");
    title.textContent = lesson.title;
    const copy = document.createElement("span");
    copy.className = "lesson-card-copy";
    copy.textContent = lesson.description;
    const arrow = document.createElement("span");
    arrow.className = "lesson-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    card.append(top, title, copy, arrow);
    card.addEventListener("click", () => openLesson(index));
    grid.append(card);
  });
}

function renderPhrases() {
  const grid = document.querySelector("#phrase-grid");
  const search = document.querySelector("#phrase-search").value.trim().toLowerCase();
  const filtered = phrases.filter((phrase) => {
    const matchesCategory = activeCategory === "All" || phrase.category === activeCategory;
    const matchesSaved = !showSavedOnly || savedPhrases.has(phrase.italian);
    const matchesSearch = `${phrase.italian} ${phrase.translation} ${phrase.pronunciation} ${phrase.category}`
      .toLowerCase()
      .includes(search);
    return matchesCategory && matchesSaved && matchesSearch;
  });
  grid.replaceChildren();
  document.querySelector("#phrase-count").textContent =
    `${filtered.length} ${filtered.length === 1 ? "phrase" : "phrases"} to make your own`;
  document.querySelector("#phrase-empty").hidden = filtered.length !== 0;

  filtered.forEach((phrase) => {
    const card = document.createElement("article");
    card.className = "phrase-card";
    const top = document.createElement("div");
    top.className = "phrase-card-top";
    const category = document.createElement("span");
    category.className = "phrase-category";
    category.textContent = phrase.category;
    const actions = document.createElement("span");
    actions.className = "phrase-actions";

    const audio = document.createElement("button");
    audio.className = "round-audio";
    audio.type = "button";
    audio.textContent = "♫";
    audio.setAttribute("aria-label", `Listen to ${phrase.italian}`);
    audio.addEventListener("click", () => speak(phrase.italian));

    const save = document.createElement("button");
    save.className = `save-phrase${savedPhrases.has(phrase.italian) ? " is-saved" : ""}`;
    save.type = "button";
    save.textContent = savedPhrases.has(phrase.italian) ? "♥" : "♡";
    save.setAttribute("aria-label", `${savedPhrases.has(phrase.italian) ? "Remove saved phrase" : "Save phrase"}: ${phrase.italian}`);
    save.setAttribute("aria-pressed", String(savedPhrases.has(phrase.italian)));
    save.addEventListener("click", () => {
      if (savedPhrases.has(phrase.italian)) {
        savedPhrases.delete(phrase.italian);
      } else {
        savedPhrases.add(phrase.italian);
      }
      saveStorage(storageKeys.saved, [...savedPhrases]);
      updateStats();
      renderPhrases();
    });

    actions.append(audio, save);
    top.append(category, actions);
    const italian = document.createElement("h2");
    italian.className = "phrase-italian";
    italian.textContent = phrase.italian;
    const pronunciation = document.createElement("p");
    pronunciation.className = "phrase-pronunciation";
    pronunciation.textContent = phrase.pronunciation;
    const translation = document.createElement("p");
    translation.className = "phrase-translation";
    translation.textContent = phrase.translation;
    card.append(top, italian, pronunciation, translation);
    grid.append(card);
  });
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function startGame(gameName) {
  document.querySelector("#game-picker").hidden = true;
  document.querySelectorAll(".game-panel").forEach((panel) => {
    panel.hidden = panel.id !== `${gameName}-game`;
  });
  if (gameName === "match") startMemoryGame();
  if (gameName === "listen") startListenGame();
  if (gameName === "quiz") startQuiz();
}

function showGamePicker() {
  document.querySelector("#game-picker").hidden = false;
  document.querySelectorAll(".game-panel").forEach((panel) => {
    panel.hidden = true;
  });
}

function startMemoryGame() {
  window.clearTimeout(memoryResetTimer);
  const pairs = shuffle(phrases).slice(0, 6);
  memoryCards = shuffle(pairs.flatMap((phrase, pairId) => [
    { pairId, text: phrase.italian, kind: "italian" },
    { pairId, text: phrase.translation, kind: "translation" },
  ]));
  memorySelection = [];
  memoryMoves = 0;
  memoryLocked = false;
  document.querySelector("#match-moves").textContent = "0 moves";
  document.querySelector("#match-feedback").textContent = "Ready when you are!";
  document.querySelector("#match-finished").hidden = true;
  const grid = document.querySelector("#memory-grid");
  grid.replaceChildren();

  memoryCards.forEach((card, index) => {
    const button = document.createElement("button");
    button.className = "memory-card";
    button.type = "button";
    button.dataset.cardIndex = index;
    button.textContent = "?";
    button.setAttribute("aria-label", `Card ${index + 1}, face down`);
    button.addEventListener("click", () => revealMemoryCard(button, card, index));
    grid.append(button);
  });
}

function revealMemoryCard(button, card, index) {
  if (memoryLocked || button.classList.contains("is-matched") || button.classList.contains("is-flipped")) return;
  button.classList.add("is-flipped");
  button.textContent = card.text;
  button.setAttribute("aria-label", `${card.kind === "italian" ? "Italian" : "Meaning"}: ${card.text}`);
  memorySelection.push({ button, card, index });
  if (memorySelection.length !== 2) return;

  memoryMoves += 1;
  document.querySelector("#match-moves").textContent = `${memoryMoves} ${memoryMoves === 1 ? "move" : "moves"}`;
  const [first, second] = memorySelection;
  if (first.card.pairId === second.card.pairId && first.card.kind !== second.card.kind) {
    first.button.classList.add("is-matched");
    second.button.classList.add("is-matched");
    first.button.setAttribute("aria-label", `Matched: ${first.card.text}`);
    second.button.setAttribute("aria-label", `Matched: ${second.card.text}`);
    memorySelection = [];
    const matchedCount = document.querySelectorAll(".memory-card.is-matched").length;
    if (matchedCount === memoryCards.length) {
      document.querySelector("#match-feedback").textContent = `You found all the pairs in ${memoryMoves} moves.`;
      document.querySelector("#match-finished").hidden = false;
      addPracticeMinutes(1);
    } else {
      document.querySelector("#match-feedback").textContent = "Perfetto! That's a match.";
    }
    return;
  }

  memoryLocked = true;
  document.querySelector("#match-feedback").textContent = "Not a pair this time. Try again!";
  memoryResetTimer = window.setTimeout(() => {
    [first, second].forEach(({ button: cardButton }) => {
      cardButton.classList.remove("is-flipped");
      cardButton.textContent = "?";
      cardButton.setAttribute("aria-label", `Card ${cardButton.dataset.cardIndex}, face down`);
    });
    memorySelection = [];
    memoryLocked = false;
  }, 850);
}

function startListenGame() {
  listenQuestions = shuffle(phrases).slice(0, 5);
  listenIndex = 0;
  listenScore = 0;
  document.querySelector("#listen-question").hidden = false;
  document.querySelector("#listen-complete").hidden = true;
  renderListenQuestion();
}

function renderListenQuestion() {
  const phrase = listenQuestions[listenIndex];
  const options = shuffle([
    phrase.translation,
    ...shuffle([...new Set(phrases.filter((item) => item.translation !== phrase.translation).map((item) => item.translation))]).slice(0, 3),
  ]);
  document.querySelector("#listen-progress").textContent = `ROUND ${listenIndex + 1} OF ${listenQuestions.length}`;
  document.querySelector("#listen-feedback").textContent = "";
  document.querySelector("#listen-feedback").classList.remove("is-wrong");
  document.querySelector("#listen-next").hidden = true;
  const optionContainer = document.querySelector("#listen-options");
  optionContainer.replaceChildren();
  document.querySelector("#listen-play").onclick = () => speak(phrase.italian);

  options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.type = "button";
    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);
    const label = document.createElement("span");
    label.textContent = option;
    button.append(letter, label);
    button.addEventListener("click", () => answerListenQuestion(button, option, phrase.translation));
    optionContainer.append(button);
  });
  speak(phrase.italian);
}

function answerListenQuestion(selectedButton, answer, correctAnswer) {
  document.querySelectorAll("#listen-options .quiz-option").forEach((option) => {
    option.disabled = true;
    if (option.lastElementChild.textContent === correctAnswer) option.classList.add("is-correct");
  });
  const feedback = document.querySelector("#listen-feedback");
  if (answer === correctAnswer) {
    listenScore += 1;
    feedback.textContent = "Bravissima! Your ears are getting sharper.";
  } else {
    selectedButton.classList.add("is-wrong");
    feedback.textContent = `Not quite — it means “${correctAnswer}.”`;
    feedback.classList.add("is-wrong");
  }
  document.querySelector("#listen-next").hidden = false;
}

function finishListenGame() {
  document.querySelector("#listen-question").hidden = true;
  document.querySelector("#listen-complete").hidden = false;
  document.querySelector("#listen-result-copy").textContent =
    `You understood ${listenScore} out of ${listenQuestions.length} phrases. Every listen helps!`;
  addPracticeMinutes(1);
}

function startQuiz() {
  quizQuestions = shuffle(phrases).slice(0, 5);
  quizIndex = 0;
  quizScore = 0;
  document.querySelector("#quiz-card").hidden = false;
  document.querySelector("#quiz-complete").hidden = true;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const phrase = quizQuestions[quizIndex];
  const distractors = shuffle(
    [...new Set(phrases.filter((item) => item.translation !== phrase.translation).map((item) => item.translation))],
  ).slice(0, 3);
  const options = shuffle([phrase.translation, ...distractors]);
  document.querySelector("#quiz-progress").textContent = `QUESTION ${quizIndex + 1} OF ${quizQuestions.length}`;
  document.querySelector("#quiz-progress-bar").style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;
  document.querySelector("#quiz-italian").textContent = phrase.italian;
  document.querySelector("#quiz-feedback").textContent = "";
  document.querySelector("#quiz-feedback").classList.remove("is-wrong");
  document.querySelector("#quiz-next").hidden = true;
  const optionContainer = document.querySelector("#quiz-options");
  optionContainer.replaceChildren();

  document.querySelector("#quiz-audio").onclick = () => speak(phrase.italian);
  options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.type = "button";
    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);
    const label = document.createElement("span");
    label.textContent = option;
    button.append(letter, label);
    button.addEventListener("click", () => answerQuiz(button, option, phrase.translation));
    optionContainer.append(button);
  });
}

function answerQuiz(selectedButton, answer, correctAnswer) {
  const options = [...document.querySelectorAll(".quiz-option")];
  options.forEach((option) => {
    option.disabled = true;
    if (option.lastElementChild.textContent === correctAnswer) option.classList.add("is-correct");
  });
  const feedback = document.querySelector("#quiz-feedback");
  if (answer === correctAnswer) {
    quizScore += 1;
    feedback.textContent = "Bravissima! You got it.";
  } else {
    selectedButton.classList.add("is-wrong");
    feedback.textContent = `Not quite — it means “${correctAnswer}.”`;
    feedback.classList.add("is-wrong");
  }
  document.querySelector("#quiz-next").hidden = false;
}

function finishQuiz() {
  document.querySelector("#quiz-card").hidden = true;
  document.querySelector("#quiz-complete").hidden = false;
  document.querySelector("#quiz-result-copy").textContent =
    `You got ${quizScore} out of ${quizQuestions.length}. Every little bit of practice helps your Italian grow.`;
  addPracticeMinutes(1);
}

document.querySelector("#today-date").textContent = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date()).toLocaleUpperCase("it-IT");

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => showView(link.dataset.view));
});

document.querySelectorAll("[data-open-view]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.openView));
});

document.querySelector("#start-lesson").addEventListener("click", () => openLesson(0));
document.querySelectorAll(".quote-audio, [data-speak]").forEach((button) => {
  button.addEventListener("click", () => speak(button.dataset.speak));
});
document.querySelector("#phrase-search").addEventListener("input", renderPhrases);
document.querySelectorAll(".filter-chip[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    showSavedOnly = false;
    document.querySelector("#saved-filter").classList.remove("is-selected");
    document.querySelectorAll(".filter-chip[data-category]").forEach((chip) => {
      chip.classList.toggle("is-selected", chip === button);
    });
    renderPhrases();
  });
});
document.querySelector("#saved-filter").addEventListener("click", (event) => {
  showSavedOnly = !showSavedOnly;
  activeCategory = "All";
  document.querySelectorAll(".filter-chip[data-category]").forEach((chip) => {
    chip.classList.toggle("is-selected", chip.dataset.category === "All");
  });
  event.currentTarget.classList.toggle("is-selected", showSavedOnly);
  renderPhrases();
});
document.querySelector("#lesson-close").addEventListener("click", () => {
  document.querySelector("#lesson-overlay").hidden = true;
});
document.querySelector("#lesson-overlay").addEventListener("click", (event) => {
  if (event.target.id === "lesson-overlay") event.currentTarget.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") document.querySelector("#lesson-overlay").hidden = true;
});
document.querySelector("#lesson-complete").addEventListener("click", (event) => {
  const index = Number(event.currentTarget.dataset.lessonIndex);
  if (completedLessons.has(index)) return;
  completedLessons.add(index);
  saveStorage(storageKeys.completed, [...completedLessons]);
  renderLessons();
  updateStats();
  addPracticeMinutes(5);
  document.querySelector("#lesson-overlay").hidden = true;
  showToast("Lesson complete — bravissima!");
});
document.querySelector("#quiz-next").addEventListener("click", () => {
  quizIndex += 1;
  if (quizIndex >= quizQuestions.length) {
    finishQuiz();
  } else {
    renderQuizQuestion();
  }
});
document.querySelector("#quiz-restart").addEventListener("click", startQuiz);
document.querySelectorAll(".game-choice").forEach((button) => {
  button.addEventListener("click", () => startGame(button.dataset.game));
});
document.querySelectorAll("[data-game-back]").forEach((button) => {
  button.addEventListener("click", showGamePicker);
});
document.querySelector("#match-restart").addEventListener("click", startMemoryGame);
document.querySelector("#listen-next").addEventListener("click", () => {
  listenIndex += 1;
  if (listenIndex >= listenQuestions.length) {
    finishListenGame();
  } else {
    renderListenQuestion();
  }
});
document.querySelector("#listen-restart").addEventListener("click", startListenGame);
document.querySelector("#quiz-next").setAttribute("aria-label", "Continue to the next question");
document.querySelectorAll('[data-view="practice"], [data-open-view="practice"]').forEach((button) => {
  button.addEventListener("click", showGamePicker);
});

renderLessons();
renderPhrases();
updateStats();