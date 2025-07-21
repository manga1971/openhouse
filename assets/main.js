// START linia 1
// --- Referințe inițiale la elementele DOM ---
const appContainer = document.getElementById('app-container');
const journalPage = document.getElementById('journal-page');
const reportsPage = document.getElementById('reports-page');
const mygoalsPage = document.getElementById('mygoals-page');
const historyPage = document.getElementById('history-page');
const accountPage = document.getElementById('account-page');
const backgroundMedia = document.getElementById('backgroundMedia');

const pages = {
  'journal': journalPage,
  'reports': reportsPage,
  'mygoals': mygoalsPage,
  'history': historyPage,
  'account': accountPage
};

const pageOrder = ['account', 'history', 'journal', 'reports', 'mygoals'];
let currentPageIndex = pageOrder.indexOf('journal');

// Elemente din Journal Page
const sun = document.getElementById('sun');
const sunText = document.getElementById('sun-text');
const recSection = document.getElementById('rec-section');
const welcomeMessage = document.getElementById('welcomeMessage');
const transcriptArea = document.getElementById('transcriptArea');
const inspirationModal = document.getElementById('inspirationModal');
const closeModalButton = document.getElementById('closeModalButton');
const inspirationText = document.getElementById('inspirationText');
const loadingSpinner = document.getElementById('loadingSpinner');

let isRecording = false;
let recognition;
let startTime;
const maxRecordingTime = 120;
let recordingInterval;
let currentTranscript = '';
let silenceTimeout;

// Elemente din MyGoals
const goalForm = document.getElementById('goal-form');
const goalInput = document.getElementById('goal-input');
const goalsList = document.getElementById('goals-list');
const refineGoalButton = document.getElementById('refineGoalButton');
const refineGoalModal = document.getElementById('refineGoalModal');
const closeRefineModalButton = document.getElementById('closeRefineModalButton');
const refineGoalText = document.getElementById('refineGoalText');
const refineLoadingSpinner = document.getElementById('refineLoadingSpinner');
let savedGoals = JSON.parse(localStorage.getItem('myGoals') || '[]');

// Elemente din Reports
const sessionPeriod = document.getElementById('sessionPeriod');
const emotionalScore = document.getElementById('emotionalScore');
const scoreEmoji = document.getElementById('scoreEmoji');
const transcriptContent = document.getElementById('transcriptContent');
const highWordsUl = document.getElementById('highWordsUl');
const lowWordsUl = document.getElementById('lowWordsUl');
const intentiiList = document.getElementById('intentiiList');
const breathingAnalysis = document.getElementById('breathingAnalysis');

// Elemente din History
const historyList = document.getElementById('historyList');

// Variabile swipe
let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;
let isSwiping = false;

// Funcție de analiză NLP simplificată
function analyzeText(text) {
  const positiveWords = ['bucurie', 'speranță', 'fericit', 'mulțumit', 'recunoștință', 'curaj', 'potențial', 'vreau', 'succes'];
  const negativeWords = ['nu pot', 'blocat', 'singur', 'eșec', 'trist', 'copleșit', 'stres', 'îndoieli', 'obosit'];

  let positives = 0;
  let negatives = 0;
  const lowerCaseText = text.toLowerCase();

  positiveWords.forEach(word => { if (lowerCaseText.includes(word)) positives++; });
  negativeWords.forEach(word => { if (lowerCaseText.includes(word)) negatives++; });

  let intentii = [];
  if (lowerCaseText.includes('nu mai vreau să fiu')) intentii.push(`"nu mai vreau să fiu..." → evitare`);
  if (lowerCaseText.includes('vreau să devin')) intentii.push(`"vreau să devin..." → progres`);
  return { positives, negatives, intentii };
}
// END linia 100
// START linia 101
// Analiză respirație pe baza textului și duratei
function analyzeBreathing(text, durationInSeconds) {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const wpm = durationInSeconds > 0 ? (wordCount / durationInSeconds) * 60 : 0;
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  const averageSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;

  let breathingFeedback = '';
  if (wpm > 180) breathingFeedback = 'Ai vorbit într-un ritm rapid azi.';
  else if (wpm < 80 && wpm > 0) breathingFeedback = 'Ai un ritm de vorbire calm.';

  if (sentences.length > 1 && averageSentenceLength < 5) breathingFeedback += ' Pauzele scurte pot semnala agitație.';
  else if (sentences.length > 1 && averageSentenceLength > 15) breathingFeedback += ' Fluxul coerent al vorbirii.';

  return { wpm: wpm.toFixed(0), breathingFeedback };
}

// Calculează scor emoțional + emoji
function getEmotionalScore(positives, negatives) {
  if (positives === 0 && negatives === 0) return { score: 'Neutru', emoji: '😐' };
  const total = positives + negatives;
  const percentagePositive = (positives / total) * 100;

  if (percentagePositive >= 75) return { score: 'Foarte Pozitiv', emoji: '😊' };
  else if (percentagePositive >= 50) return { score: 'Pozitiv', emoji: '🙂' };
  else if (percentagePositive >= 25) return { score: 'Echilibrat', emoji: '😌' };
  else return { score: 'Mai degrabă Negativ', emoji: '😔' };
}

// Actualizează pozițiile paginilor
function updatePagePositions() {
  document.querySelectorAll('.page-label').forEach(label => label.style.opacity = '0');
  document.querySelectorAll('.app-page').forEach(page => page.style.pointerEvents = 'none');

  for (let i = 0; i < pageOrder.length; i++) {
    const pageId = pageOrder[i];
    const pageElement = pages[pageId];
    pageElement.classList.remove('page-center', 'page-top', 'page-bottom', 'page-left', 'page-right');

    if (i === currentPageIndex) {
      pageElement.classList.add('page-center');
      pageElement.style.pointerEvents = 'auto';
    } else {
      const relativeIndex = (i - currentPageIndex + pageOrder.length) % pageOrder.length;

      if (relativeIndex === 1) {
        if (pageId === 'reports') pageElement.classList.add('page-right');
        else if (pageId === 'mygoals') pageElement.classList.add('page-bottom');
        else if (pageId === 'history') pageElement.classList.add('page-left');
        else if (pageId === 'account') pageElement.classList.add('page-top');
      } else if (relativeIndex === pageOrder.length - 1) {
        if (pageId === 'account') pageElement.classList.add('page-top');
        else if (pageId === 'history') pageElement.classList.add('page-left');
        else if (pageId === 'mygoals') pageElement.classList.add('page-bottom');
        else if (pageId === 'reports') pageElement.classList.add('page-right');
      }

      if (relativeIndex === 1 || relativeIndex === pageOrder.length - 1) {
        pageElement.querySelectorAll('.page-label').forEach(label => label.style.opacity = '1');
      }
    }
  }
}
// END linia 200
// START linia 201
// Navigare între pagini
function navigateTo(targetPageId) {
  if (isSwiping) return;
  isSwiping = true;

  const targetPageIndex = pageOrder.indexOf(targetPageId);
  if (targetPageIndex === -1 || targetPageIndex === currentPageIndex) {
    isSwiping = false;
    return;
  }

  const currentPageElement = pages[pageOrder[currentPageIndex]];
  const targetPageElement = pages[targetPageId];

  currentPageElement.querySelectorAll('.page-label').forEach(label => label.style.opacity = '0');
  currentPageElement.style.pointerEvents = 'none';

  currentPageElement.style.transform = 'scale(0.8)';
  targetPageElement.style.transform = 'scale(0.8)';
  setTimeout(() => {
    currentPageElement.style.transform = 'translateX(0) translateY(0)';
    targetPageElement.style.transform = 'translateX(0) translateY(0)';
  }, 250);

  currentPageIndex = targetPageIndex;

  setTimeout(() => {
    updatePagePositions();
    if (targetPageId === 'reports') populateReport(JSON.parse(localStorage.getItem('current_session_data')));
    if (targetPageId === 'history') loadHistory();
    if (targetPageId === 'mygoals') {
      goalsList.innerHTML = '';
      savedGoals.forEach(addGoalToDOM);
    }
    if (targetPageId === 'journal') {
      resetJournalUI();
    }
    isSwiping = false;
  }, 500);
}

// Resetează UI-ul Journal
function resetJournalUI() {
  welcomeMessage.classList.remove('hidden-element');
  sunText.textContent = '🎙️ Începe Sesiunea';
  sun.classList.remove('active');
  backgroundMedia.classList.remove('pulsating-background', 'speaking-background');
  recSection.style.display = 'none';
  transcriptArea.style.display = 'none';
  for (const id in pages) {
    if (id !== 'journal') pages[id].classList.remove('hidden-element');
  }
  updatePagePositions();
}

// Start înregistrare
function startRecording() {
  if (!('webkitSpeechRecognition' in window)) {
    document.getElementById('status-msg').textContent = 'API-ul de recunoaștere vocală nu este suportat.';
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'ro-RO';

  let finalTranscript = '';

  recognition.onstart = () => {
    isRecording = true;
    startTime = Date.now();
    sunText.textContent = '🎙️';
    sun.classList.add('active');
    backgroundMedia.classList.add('pulsating-background');
    recSection.style.display = 'flex';
    welcomeMessage.classList.add('hidden-element');
    transcriptArea.style.display = 'block';
    transcriptArea.innerHTML = '<p class="text-gray-500 text-center italic">Vorbește liber. LumiYE te ascultă...</p>';
    currentTranscript = '';

    document.querySelectorAll('.page-label').forEach(label => label.style.opacity = '0');
    for (const id in pages) {
      if (id !== 'journal') pages[id].classList.add('hidden-element');
    }

    resetSilenceTimeout();
  };
// END linia 300
// START linia 301
  recognition.onresult = (event) => {
    let hasSpeech = false;
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + '. ';
        const p = document.createElement('p');
        p.textContent = event.results[i][0].transcript;
        p.classList.add('sentence-pop-in');
        transcriptArea.appendChild(p);
        transcriptArea.scrollTop = transcriptArea.scrollHeight;
        currentTranscript = finalTranscript;
        hasSpeech = true;
      }
    }

    if (hasSpeech) {
      backgroundMedia.classList.remove('pulsating-background');
      backgroundMedia.classList.add('speaking-background');
      resetSilenceTimeout();
    } else {
      backgroundMedia.classList.remove('speaking-background');
      backgroundMedia.classList.add('pulsating-background');
    }
  };

  recognition.onend = () => {
    if (isRecording) {
      isRecording = false;
      clearTimeout(silenceTimeout);
      backgroundMedia.classList.remove('pulsating-background', 'speaking-background');
      sun.classList.remove('active');
      recSection.style.display = 'none';
      transcriptArea.style.display = 'none';
      processSession(currentTranscript);
    }
  };

  recognition.onerror = (event) => {
    console.error('Eroare recunoaștere vocală:', event.error);
    document.getElementById('status-msg').textContent = `Eroare: ${event.error}. Te rugăm să încerci din nou.`;
    isRecording = false;
    clearTimeout(silenceTimeout);
    backgroundMedia.classList.remove('pulsating-background', 'speaking-background');
    sun.classList.remove('active');
    recSection.style.display = 'none';
    transcriptArea.style.display = 'none';
    resetJournalUI();
  };

  recognition.start();

  recordingInterval = setTimeout(() => {
    if (isRecording) stopRecording();
  }, maxRecordingTime * 1000);
}

// Stop înregistrare
function stopRecording() {
  if (isRecording) {
    recognition.stop();
    isRecording = false;
    clearTimeout(silenceTimeout);
    clearTimeout(recordingInterval);
    backgroundMedia.classList.remove('pulsating-background', 'speaking-background');
    sun.classList.remove('active');
    recSection.style.display = 'none';
    transcriptArea.style.display = 'none';
    processSession(currentTranscript);
  }
}

function resetSilenceTimeout() {
  clearTimeout(silenceTimeout);
  backgroundMedia.classList.remove('speaking-background');
  backgroundMedia.classList.add('pulsating-background');
  silenceTimeout = setTimeout(() => {
    if (isRecording) stopRecording();
    console.log("Înregistrare oprită din cauza liniștii prelungite.");
  }, 10000);
}
// END linia 400
// START linia 401
// Procesare finală a sesiunii înregistrate
function processSession(transcript) {
  const duration = (Date.now() - startTime) / 1000;
  const cleanTranscript = DOMPurify.sanitize(transcript); // asigură securitate

  const { positives, negatives, intentii } = analyzeText(cleanTranscript);
  const { wpm, breathingFeedback } = analyzeBreathing(cleanTranscript, duration);

  const sessionData = {
    time: new Date().toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }),
    transcript: cleanTranscript,
    duration: duration.toFixed(0),
    analysis: { positives, negatives, highWords: [], lowWords: [], intentii, wpm, breathingFeedback }
  };

  localStorage.setItem('current_session_data', JSON.stringify(sessionData));
  navigateTo('reports');
  resetJournalUI();
}

// Generare inspirație cu Gemini API
async function generateInspiration() {
  inspirationText.textContent = '';
  loadingSpinner.style.display = 'block';
  inspirationModal.style.display = 'flex';

  try {
    let chatHistory = [];
    const prompt = "Generează o frază scurtă, pozitivă și inspirațională despre auto-reflecție, creștere personală sau liniște interioară. Fraza să fie concisă și să inspire calm.";
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      inspirationText.textContent = result.candidates[0].content.parts[0].text;
    } else {
      inspirationText.textContent = "Nu am putut genera inspirație. Te rugăm să încerci din nou.";
      console.error("Structura răspunsului API este neașteptată:", result);
    }
  } catch (error) {
    inspirationText.textContent = "Eroare la generarea inspirației.";
    console.error("Eroare la apelul Gemini API:", error);
  } finally {
    loadingSpinner.style.display = 'none';
  }
}
// END linia 500
// START linia 501
// Adaugă un obiectiv în DOM
function addGoalToDOM(goal) {
  const cleanGoal = DOMPurify.sanitize(goal);
  const div = document.createElement('div');
  div.className = 'glass p-3 flex items-center justify-between';
  div.innerHTML = `<span class="block text-gray-800">📝 ${cleanGoal}</span><button class="delete-goal-button text-red-500 hover:text-red-700 ml-4 text-xl">&times;</button>`;
  goalsList.appendChild(div);
  div.querySelector('.delete-goal-button').addEventListener('click', () => removeGoalFromDOM(goal, div));
}

// Șterge obiectivul din DOM + localStorage
function removeGoalFromDOM(goalToRemove, element) {
  const index = savedGoals.indexOf(goalToRemove);
  if (index > -1) {
    savedGoals.splice(index, 1);
    localStorage.setItem('myGoals', JSON.stringify(savedGoals));
    element.remove();
  }
}

// Rafinează ultimul obiectiv cu Gemini API
async function refineGoal() {
  let goalToRefine = '';
  if (savedGoals.length > 0) {
    goalToRefine = savedGoals[savedGoals.length - 1];
  } else {
    refineGoalText.textContent = "Nu ai adăugat încă niciun obiectiv.";
    refineLoadingSpinner.style.display = 'none';
    refineGoalModal.style.display = 'flex';
    return;
  }

  refineGoalText.textContent = '';
  refineLoadingSpinner.style.display = 'block';
  refineGoalModal.style.display = 'flex';

  try {
    let chatHistory = [];
    const prompt = `Pentru obiectivul "${DOMPurify.sanitize(goalToRefine)}", oferă o sugestie de rafinare care să-l facă mai specific și acționabil.`;
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      refineGoalText.textContent = result.candidates[0].content.parts[0].text;
    } else {
      refineGoalText.textContent = "Nu am putut genera sugestii.";
    }
  } catch (error) {
    refineGoalText.textContent = "Eroare la generarea sugestiilor.";
    console.error("Eroare refineGoal:", error);
  } finally {
    refineLoadingSpinner.style.display = 'none';
  }
}
// END linia 600
// START linia 601
// Populează pagina de rapoarte
function populateReport(session) {
  if (!session) {
    sessionPeriod.textContent = 'Perioadă: N/A';
    transcriptContent.textContent = 'Nicio sesiune salvată recent.';
    emotionalScore.textContent = 'N/A';
    scoreEmoji.textContent = '🤷';
    highWordsUl.innerHTML = '<li>Niciun cuvânt "High" detectat.</li>';
    lowWordsUl.innerHTML = '<li>Niciun cuvânt "Low" detectat.</li>';
    intentiiList.innerHTML = '<li>Nicio intenție detectată.</li>';
    breathingAnalysis.textContent = 'Fără analiză disponibilă.';
    return;
  }

  sessionPeriod.textContent = `Perioadă: ${session.time || 'Timp necunoscut'} (Durată: ${session.duration || 'N/A'} secunde)`;
  transcriptContent.textContent = session.transcript || 'Fără transcriere disponibilă.';

  highWordsUl.innerHTML = '';
  lowWordsUl.innerHTML = '';

  if (session.analysis.positives > 0) {
    const li = document.createElement('li');
    li.textContent = `(Au fost detectate ${session.analysis.positives} cuvinte pozitive)`;
    highWordsUl.appendChild(li);
  } else {
    highWordsUl.innerHTML = '<li>Niciun cuvânt "High" detectat.</li>';
  }

  if (session.analysis.negatives > 0) {
    const li = document.createElement('li');
    li.textContent = `(Au fost detectate ${session.analysis.negatives} cuvinte negative)`;
    lowWordsUl.appendChild(li);
  } else {
    lowWordsUl.innerHTML = '<li>Niciun cuvânt "Low" detectat.</li>';
  }

  intentiiList.innerHTML = '';
  if (session.analysis.intentii?.length > 0) {
    session.analysis.intentii.forEach(intentie => {
      const li = document.createElement('li');
      li.textContent = intentie;
      li.classList.add('intent-text');
      intentiiList.appendChild(li);
    });
  } else {
    intentiiList.innerHTML = '<li>Nicio intenție detectată.</li>';
  }

  breathingAnalysis.textContent = session.analysis.breathingFeedback || 'Fără analiză disponibilă.';

  const { score, emoji } = getEmotionalScore(session.analysis.positives, session.analysis.negatives);
  emotionalScore.textContent = score;
  scoreEmoji.textContent = emoji;
}
// END linia 700
// START linia 701
// Încarcă istoricul sesiunilor
function loadHistory() {
  const rawData = localStorage.getItem('lumiye_sessions');
  if (!rawData) {
    historyList.innerHTML = '<p class="text-gray-500 text-center">Nicio sesiune salvată încă.</p>';
    return;
  }

  const sessions = JSON.parse(rawData);
  if (!sessions.length) {
    historyList.innerHTML = '<p class="text-gray-500 text-center">Nicio sesiune salvată încă.</p>';
    return;
  }

  historyList.innerHTML = '';
  sessions.reverse().forEach((session, index) => {
    const item = document.createElement('div');
    item.className = 'session-card';
    const isFirstSession = (sessions.length - 1 - index) === 0;

    item.innerHTML = `
      <h2 class="text-lg font-semibold text-gray-800">Sesiune #${sessions.length - index} ${isFirstSession ? '<span class="text-blue-500 text-sm">(Origine)</span>' : ''}</h2>
      <p class="text-sm text-gray-600">🕒 ${session.time || 'Timp necunoscut'} (Durată: ${session.duration || 'N/A'} secunde)</p>
      <p class="mt-2 text-gray-700 line-clamp-3">${session.transcript || 'Fără transcriere disponibilă.'}</p>
      <div class="mt-2 text-sm">
        <span class="text-green-600">Pozitive: ${session.analysis.positives || 0}</span> |
        <span class="text-red-600">Negative: ${session.analysis.negatives || 0}</span> |
        <span class="text-blue-500">WPM: ${session.analysis.wpm || 'N/A'}</span>
      </div>
    `;
    historyList.appendChild(item);
  });
}

// --- Inițializare și evenimente ---
document.addEventListener('DOMContentLoaded', () => {
  updatePagePositions();
  loadHistory();
  savedGoals.forEach(addGoalToDOM);

  const currentSessionData = localStorage.getItem('current_session_data');
  if (currentSessionData) {
    populateReport(JSON.parse(currentSessionData));
  } else {
    populateReport(null);
  }
});

// Soare apăsat
sun.addEventListener('mousedown', () => {
  if (!isRecording) {
    isSwiping = true;
    holdTimeout = setTimeout(() => {
      sun.classList.add('expanding');
      sunText.textContent = 'Inspiră profund';
      setTimeout(() => {
        sun.classList.remove('expanding');
        startRecording();
        isSwiping = false;
      }, 2000);
    }, 1200);
  } else {
    stopRecording();
  }
});
sun.addEventListener('mouseup', () => {
  if (!isRecording) {
    clearTimeout(holdTimeout);
    isSwiping = false;
  }
});
sun.addEventListener('mouseleave', () => {
  if (!isRecording) {
    clearTimeout(holdTimeout);
    isSwiping = false;
  }
});

// Modal inspirație
closeModalButton.addEventListener('click', () => { inspirationModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target == inspirationModal) inspirationModal.style.display = 'none'; });

// Modal rafinare obiectiv
closeRefineModalButton.addEventListener('click', () => { refineGoalModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target == refineGoalModal) refineGoalModal.style.display = 'none'; });

// Adaugă obiectiv nou
goalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const goal = goalInput.value.trim();
  if (goal) {
    addGoalToDOM(goal);
    savedGoals.push(goal);
    localStorage.setItem('myGoals', JSON.stringify(savedGoals));
    goalInput.value = '';
  }
});
refineGoalButton.addEventListener('click', refineGoal);

// Swipe tactil
appContainer.addEventListener('touchstart', e => {
  if (isRecording || isSwiping) return;
  touchstartX = e.changedTouches[0].screenX;
  touchstartY = e.changedTouches[0].screenY;
});
appContainer.addEventListener('touchend', e => {
  if (isRecording || isSwiping) return;
  touchendX = e.changedTouches[0].screenX;
  touchendY = e.changedTouches[0].screenY;
  handleGesture();
});

function handleGesture() {
  const swipeThreshold = 75;
  const deltaX = touchendX - touchstartX;
  const deltaY = touchendY - touchstartY;
  const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

  if (isHorizontalSwipe && Math.abs(deltaX) > swipeThreshold) {
    if (deltaX < 0) {
      if (currentPageIndex === pageOrder.indexOf('journal')) navigateTo('reports');
      else if (currentPageIndex === pageOrder.indexOf('history')) navigateTo('journal');
    } else {
      if (currentPageIndex === pageOrder.indexOf('journal')) navigateTo('history');
      else if (currentPageIndex === pageOrder.indexOf('reports')) navigateTo('journal');
    }
  } else if (!isHorizontalSwipe && Math.abs(deltaY) > swipeThreshold) {
    if (deltaY < 0) {
      if (currentPageIndex === pageOrder.indexOf('journal')) navigateTo('mygoals');
      else if (currentPageIndex === pageOrder.indexOf('account')) navigateTo('journal');
    } else {
      if (currentPageIndex === pageOrder.indexOf('journal')) navigateTo('account');
      else if (currentPageIndex === pageOrder.indexOf('mygoals')) navigateTo('journal');
    }
  }
}
// END linia 814
