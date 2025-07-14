// START vision-test.js

// === TEXT SLIDER ===
// Definirea mesajelor specifice pentru pagina vision-test
const pageMessages = {
  "/vision-test.html": [
    "Motto: cultivate light in your eyes every day",
    "Goal: consistent eye care for digital well-being",
    "Disclaimer: this is not a medical diagnostic tool"
  ],
  // Aici poți adăuga mesaje pentru alte pagini, de exemplu:
  // "/index.html": ["Motto: strive for progress not perfection", "Goal: happy eyes, happy life"],
  // "/reports.html": ["Insights: understand your eye health patterns", "Action: transform data into better habits"]
};

let currentMessageIndex = 0;
const textSliderElement = document.getElementById("textSlider");

function updateTextSlider() {
  const messages = pageMessages[window.location.pathname] || pageMessages["/vision-test.html"]; // Fallback
  textSliderElement.classList.remove("opacity-100");
  textSliderElement.classList.add("opacity-0");
  setTimeout(() => {
    currentMessageIndex = (currentMessageIndex + 1) % messages.length;
    textSliderElement.textContent = messages[currentMessageIndex];
    textSliderElement.classList.remove("opacity-0");
    textSliderElement.classList.add("opacity-100");
  }, 500);
}
setInterval(updateTextSlider, 4000); // Rulează la 4 secunde
updateTextSlider(); // Afișează primul mesaj imediat

// === NAVBAR ACTIVATION ===
const navItems = document.querySelectorAll('.nav-item');
function setActiveNavItem(id) {
  navItems.forEach(item => {
    item.classList.remove('active', 'text-orange-500', 'font-semibold');
    item.classList.add('text-gray-700');
  });
  const activeItem = document.getElementById(id);
  if (activeItem) {
    activeItem.classList.add('active', 'font-semibold', 'text-orange-500'); // Setează direct orange-500 pentru Lum Test
  }
}
setActiveNavItem('nav-liye-test'); // Actualizat la 'nav-liye-test' pentru Lum Test

// === DOM ELEMENTS ===
const rawVideoFeed = document.getElementById("raw_video_feed");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

const videoOverlay = document.getElementById("video-overlay");
const videoControls = document.getElementById("video-controls");
const stopRecordingBtn = document.getElementById("stop-recording-btn");
const timeAccumulatedEl = document.getElementById("time-accumulated");
const timeRemainingEl = document.getElementById("time-remaining");
const progressBar = document.getElementById("progress-bar");
const statusMessage = document.getElementById("status-message");
const liveFeedback = document.getElementById("live-feedback");

const privacyWarning = document.getElementById("privacy-warning");
const hidePrivacyWarningCheckbox = document.getElementById("hide-privacy-warning");

const backgroundMusic = document.getElementById("background-music");
const startSound = document.getElementById("start-sound");
const endSound = document.getElementById("end-sound");

const offlineStatus = document.getElementById("offline-status"); // Pentru starea offline

// Notificări și Modaluri
const testFinishedNotification = document.getElementById("test-finished-notification");
const hideTestFinishedNotificationBtn = document.getElementById("hide-test-finished-notification");
const dontShowTestFinishedAgainCheckbox = document.getElementById("dont-show-test-finished-again");
const navigationConfirmModal = document.getElementById("navigation-confirm-modal");
const confirmNavigationYesBtn = document.getElementById("confirm-navigation-yes");
const confirmNavigationNoBtn = document.getElementById("confirm-navigation-no");

// === CONFIG ===
const LEFT_EYE_TOP = 159, LEFT_EYE_BOTTOM = 145;
const RIGHT_EYE_TOP = 386, RIGHT_EYE_BOTTOM = 374;
const LEFT_IRIS_CENTER = 468, RIGHT_IRIS_CENTER = 473;

const EAR_THRESHOLD = 0.015;
const BLINK_HOLD_FRAMES = 2;
const BLINK_RESET_FRAMES = 5;
const MAX_FACE_LOST_FRAMES = 150; // Aproximativ 5 secunde la 30FPS

let blinkCount = 0;
let isBlinking = false;
let framesBelowThreshold = 0;
let framesAboveThreshold = 0;
let monitoringActive = false; // Indicator dacă înregistrarea este activă
let monitoringPaused = false; // Indicator dacă înregistrarea este în pauză (fără Uti în cadru)
let monitoringTimer;
const TOTAL_MONITORING_DURATION = 120; // 120 secunde pentru testul calitativ
let accumulatedMonitoringTime = 0; // Timpul acumulat efectiv de monitorizare calitativă
let faceLostCounter = 0;
window.lastProcessedLandmarks = null; // Stochează ultimele landmark-uri pentru calculul luminozității

// Variabile pentru controlul navigării în timpul testului
let pendingNavigation = null;

// === HELPER FUNCTIONS ===
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// === SCORING FUNCTIONS (Rămân aceleași, sunt utile pentru salvarea raportului) ===
function calculateEyeVerticalDistance(top, bottom) {
  return Math.hypot(top.x - bottom.x, top.y - bottom.y);
}

function calculateBlinkScore(blinksPerMinute) {
  const OPTIMAL_MIN = 12, OPTIMAL_MAX = 22;
  const EXTREME_LOW = 5, EXTREME_HIGH = 30;
  if (blinksPerMinute >= OPTIMAL_MIN && blinksPerMinute <= OPTIMAL_MAX) return 100;
  if (blinksPerMinute < EXTREME_LOW || blinksPerMinute > EXTREME_HIGH) return 20;
  if (blinksPerMinute < OPTIMAL_MIN) return Math.round(20 + (blinksPerMinute - EXTREME_LOW) / (OPTIMAL_MIN - EXTREME_LOW) * 80);
  if (blinksPerMinute > OPTIMAL_MAX) return Math.round(20 + (EXTREME_HIGH - blinksPerMinute) / (EXTREME_HIGH - OPTIMAL_MAX) * 80);
  return 0;
}

function calculateLuminosityScore(ctx, landmarks, w, h) {
  if (!landmarks) return 0;
  let total = 0, count = 0;
  const irisIndices = [LEFT_IRIS_CENTER, RIGHT_IRIS_CENTER];

  irisIndices.forEach(index => {
    const iris = landmarks[index];
    if (!iris) return;
    const r = Math.round(w * 0.015);
    const x = Math.round(iris.x * w);
    const y = Math.round(iris.y * h);
    try {
      const startX = Math.max(0, x - r);
      const startY = Math.max(0, y - r);
      const width = Math.min(r * 2, w - startX);
      const height = Math.min(r * 2, h - startY);
      if (width <= 0 || height <= 0) return;
      const imageData = ctx.getImageData(startX, startY, width, height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        total += (r + g + b) / 3;
        count++;
      }
    } catch (e) {
      console.warn("ImageData error:", e);
    }
  });

  if (count === 0) return 0;
  const avg = total / count;
  const minB = 70, maxB = 220; // Valori de calibrare pentru luminozitate
  let normalized = (avg - minB) / (maxB - minB) * 100;
  return Math.round(Math.min(100, Math.max(0, normalized)));
}

function calculateIndiceLumina(blinkScore, luminosityScore, w_blink = 0.6, w_lum = 0.4) {
  return Math.round(w_blink * blinkScore + w_lum * luminosityScore);
}

function interpretIndiceLumina(score) {
  if (score >= 80) return "radiant";
  if (score >= 60) return "clear";
  if (score >= 40) return "tired";
  return "strained";
}

// === TEST FLOW FUNCTIONS ===

// Funcția de pornire a monitorizării, declanșată de click pe overlay
async function startMonitoring() {
  if (monitoringActive) return; // Previne pornirea multiplă

  // Asigură-te că stream-ul camerei este activ și FaceMesh procesează
  if (!rawVideoFeed.srcObject || rawVideoFeed.paused) {
    await initCameraAndMediaPipeStream();
  }

  monitoringActive = true;
  monitoringPaused = false;
  blinkCount = 0;
  accumulatedMonitoringTime = 0;
  faceLostCounter = 0;
  window.lastProcessedLandmarks = null; // Resetează pentru un test nou

  videoOverlay.classList.add("hidden");
  videoControls.classList.remove("hidden");
  progressBar.style.width = `0%`;
  timeAccumulatedEl.textContent = formatTime(0);
  timeRemainingEl.textContent = formatTime(TOTAL_MONITORING_DURATION);

  statusMessage.textContent = "Monitoring in progress...";
  backgroundMusic.currentTime = 0;
  backgroundMusic.play().catch(e => console.log("Background music error:", e));
  startSound.currentTime = 0;
  startSound.play().catch(e => console.log("Start sound error:", e));
  liveFeedback.textContent = "";

  // Activează sau dezactivează butoanele Reports/Recommends din navbar
  toggleNavbarReportsRecommends(false);

  // Monitorizarea se face frame-by-frame în onResults, nu cu setInterval
  // setInterval-ul de aici este pentru update-ul timpului afișat dacă NU e în pauză
  monitoringTimer = setInterval(() => {
    if (monitoringActive && !monitoringPaused) {
      // Logică de update a timpului vizual
      // Timpul acumulat și progresul sunt actualizate în onResults
      const remaining = Math.max(0, TOTAL_MONITORING_DURATION - accumulatedMonitoringTime);
      timeAccumulatedEl.textContent = formatTime(accumulatedMonitoringTime);
      timeRemainingEl.textContent = formatTime(remaining);
      progressBar.style.width = `${(accumulatedMonitoringTime / TOTAL_MONITORING_DURATION) * 100}%`;

      if (accumulatedMonitoringTime >= TOTAL_MONITORING_DURATION) {
        endMonitoring();
      }
    }
  }, 1000); // Update la fiecare secundă
}

function endMonitoring() {
  if (!monitoringActive) return; // Evită apelarea multiplă

  clearInterval(monitoringTimer);
  monitoringActive = false;
  monitoringPaused = false;

  backgroundMusic.pause();
  endSound.currentTime = 0;
  endSound.play().catch(e => console.log("End sound error:", e));

  videoControls.classList.add("hidden");
  videoOverlay.classList.remove("hidden"); // Reafișează overlay-ul pentru a re-începe
  statusMessage.textContent = "Test finished. See your reports!";
  liveFeedback.textContent = "";

  // Calculează scorurile finale și salvează rezultatul
  const blinksPerMinute = (blinkCount / accumulatedMonitoringTime) * 60; // Calcul pe timpul efectiv acumulat
  const blinkScore = calculateBlinkScore(blinksPerMinute);
  let luminosityScore = 0;
  if (window.lastProcessedLandmarks) {
    luminosityScore = calculateLuminosityScore(canvasCtx, window.lastProcessedLandmarks, canvasElement.width, canvasElement.height);
  }
  const indiceLumina = calculateIndiceLumina(blinkScore, luminosityScore);
  const feedback = interpretIndiceLumina(indiceLumina);

  saveTestResult(blinkCount, feedback, indiceLumina, blinkScore, luminosityScore, accumulatedMonitoringTime);

  // Afișează notificarea de finalizare a testului
  showTestFinishedNotification();

  // Activează butoanele Reports/Recommends din navbar
  toggleNavbarReportsRecommends(true);
}

function stopAndResetMonitoring() {
  clearInterval(monitoringTimer);
  monitoringActive = false;
  monitoringPaused = false;
  blinkCount = 0;
  accumulatedMonitoringTime = 0;
  faceLostCounter = 0;
  window.lastProcessedLandmarks = null;

  // Oprește camera dacă este activă
  if (rawVideoFeed.srcObject) {
    const tracks = rawVideoFeed.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    rawVideoFeed.srcObject = null;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Curăță canvas-ul
  }

  videoControls.classList.add("hidden");
  videoOverlay.classList.remove("hidden"); // Reafișează overlay-ul "Start Recording"
  progressBar.style.width = `0%`;
  timeAccumulatedEl.textContent = formatTime(0);
  timeRemainingEl.textContent = formatTime(TOTAL_MONITORING_DURATION);

  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;

  statusMessage.textContent = "Test stopped. Tap to start a new recording.";
  liveFeedback.textContent = "";

  toggleNavbarReportsRecommends(false); // Dezactivează Reports/Recommends dacă s-a oprit prematur
}


function saveTestResult(blinks, feedback, indice, blinkScore, luminosityScore, duration) {
  const entry = {
    date: new Date().toLocaleString(),
    blinks, feedback,
    indiceLumina: indice,
    blinkScore,
    luminosityScore,
    duration: duration // Durata efectivă a testului acumulat
  };
  const history = JSON.parse(localStorage.getItem("vh_history") || "[]");
  history.push(entry);
  localStorage.setItem("vh_history", JSON.stringify(history));
  localStorage.setItem("liye_last_test", JSON.stringify(entry)); // Numele vechi, ar trebui schimbat în "lum_last_test"
}

// Activează/dezactivează link-urile Reports și Recommends din navbar
function toggleNavbarReportsRecommends(enable) {
    const reportsLink = document.getElementById('nav-reports');
    const recommendsLink = document.getElementById('nav-recommends');

    if (enable) {
        reportsLink.classList.remove('pointer-events-none', 'opacity-50');
        recommendsLink.classList.remove('pointer-events-none', 'opacity-50');
        // Poți adăuga și alte stiluri vizuale pentru activare
    } else {
        reportsLink.classList.add('pointer-events-none', 'opacity-50');
        recommendsLink.classList.add('pointer-events-none', 'opacity-50');
        // Poți adăuga și alte stiluri vizuale pentru dezactivare
    }
}


// === MEDIAPIPE & CAMERA FUNCTIONS ===
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

let camera = null;

async function initCameraAndMediaPipeStream() {
  statusMessage.textContent = "Initializing camera...";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    rawVideoFeed.srcObject = stream;
    await rawVideoFeed.play();

    if (camera) camera.stop(); // Oprește camera veche dacă există
    camera = new Camera(rawVideoFeed, {
      onFrame: async () => {
        await faceMesh.send({ image: rawVideoFeed });
      },
      width: 640, // Rezoluție internă pentru procesare
      height: 480
    });
    camera.start();

    statusMessage.textContent = "Camera ready. Tap the video to start recording.";
  } catch (err) {
    statusMessage.textContent = `Camera error: ${err.name} - ${err.message}. Please ensure camera access.`;
    console.error("Camera error:", err);
  }
}


function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.image) {
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  }

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    window.lastProcessedLandmarks = landmarks;
    faceLostCounter = 0; // Resetăm contorul de pierdere a feței
    monitoringPaused = false; // Dacă fața e detectată, nu mai e în pauză

    if (monitoringActive) { // Doar dacă monitorizarea este activă
        accumulatedMonitoringTime++; // Acumulăm timp de monitorizare calitativă
        const earLeft = calculateEyeVerticalDistance(landmarks[LEFT_EYE_TOP], landmarks[LEFT_EYE_BOTTOM]);
        const earRight = calculateEyeVerticalDistance(landmarks[RIGHT_EYE_TOP], landmarks[RIGHT_EYE_BOTTOM]);
        const ear = Math.min(earLeft, earRight);

        if (ear < EAR_THRESHOLD) {
            framesBelowThreshold++;
            framesAboveThreshold = 0;
        } else {
            framesAboveThreshold++;
            framesBelowThreshold = 0;
        }

        if (framesBelowThreshold >= BLINK_HOLD_FRAMES && !isBlinking) {
            blinkCount++;
            isBlinking = true;
        }
        if (framesAboveThreshold >= BLINK_RESET_FRAMES && isBlinking) {
            isBlinking = false;
        }

        const lumScore = calculateLuminosityScore(canvasCtx, landmarks, canvasElement.width, canvasElement.height);
        liveFeedback.textContent = `Blinks: ${blinkCount}, Luminosity: ${lumScore}`;

        // Update progress bar și timp afișat la fiecare frame procesat dacă nu e paused
        const remaining = Math.max(0, TOTAL_MONITORING_DURATION - accumulatedMonitoringTime);
        timeAccumulatedEl.textContent = formatTime(accumulatedMonitoringTime);
        timeRemainingEl.textContent = formatTime(remaining);
        progressBar.style.width = `${(accumulatedMonitoringTime / TOTAL_MONITORING_DURATION) * 100}%`;

        if (accumulatedMonitoringTime >= TOTAL_MONITORING_DURATION) {
            endMonitoring();
        }
    }

    // Desen landmark-uri ochi și iris (pentru debugging vizual)
    // canvasCtx.fillStyle = '#FF4136';
    // [LEFT_EYE_TOP, LEFT_EYE_BOTTOM, RIGHT_EYE_TOP, RIGHT_EYE_BOTTOM].forEach(i => {
    //   canvasCtx.beginPath();
    //   canvasCtx.arc(landmarks[i].x * canvasElement.width, landmarks[i].y * canvasElement.height, 3, 0, 2 * Math.PI);
    //   canvasCtx.fill();
    // });
    //
    // canvasCtx.fillStyle = '#FF851B';
    // [LEFT_IRIS_CENTER, RIGHT_IRIS_CENTER].forEach(i => {
    //   canvasCtx.beginPath();
    //   canvasCtx.arc(landmarks[i].x * canvasElement.width, landmarks[i].y * canvasElement.height, 2, 0, 2 * Math.PI);
    //   canvasCtx.fill();
    // });

  } else {
    window.lastProcessedLandmarks = null;
    if (monitoringActive) {
      faceLostCounter++;
      if (faceLostCounter >= MAX_FACE_LOST_FRAMES) {
        monitoringPaused = true; // Intră în pauză la pierderea feței
        statusMessage.textContent = `Face lost. Monitoring paused. Please re-center.`;
        liveFeedback.textContent = `Time remaining to resume: ${Math.floor((MAX_FACE_LOST_FRAMES - faceLostCounter) / 30)}s`;
      } else {
        const remainingTime = Math.floor((MAX_FACE_LOST_FRAMES - faceLostCounter) / 30);
        statusMessage.textContent = `Face lost. ${remainingTime}s to recover...`;
        liveFeedback.textContent = "";
      }
    } else {
      statusMessage.textContent = "No face detected. Align your face to start.";
      faceLostCounter = 0;
    }
  }
  canvasCtx.restore();
}

// === NOTIFICATION HANDLERS ===
function showTestFinishedNotification() {
    const dontShowAgain = localStorage.getItem('lum_test_finished_notification_hidden');
    if (dontShowAgain === 'true') {
        return; // Nu arăta dacă utilizatorul a bifat să nu mai vadă
    }
    testFinishedNotification.classList.add('show');
    // Ascunde notificarea automat după 5 secunde
    setTimeout(() => {
        testFinishedNotification.classList.remove('show');
    }, 5000);
}

hideTestFinishedNotificationBtn.addEventListener('click', () => {
    testFinishedNotification.classList.remove('show');
});

dontShowTestFinishedAgainCheckbox.addEventListener('change', () => {
    localStorage.setItem('lum_test_finished_notification_hidden', dontShowTestFinishedAgainCheckbox.checked);
});


// === NAVIGATION CONFIRMATION MODAL HANDLERS ===
function showNavigationConfirmModal(targetUrl) {
    pendingNavigation = targetUrl; // Salvează URL-ul unde voia să navigheze
    navigationConfirmModal.classList.add('show');
}

function hideNavigationConfirmModal() {
    navigationConfirmModal.classList.remove('show');
    pendingNavigation = null;
}

confirmNavigationYesBtn.addEventListener('click', () => {
    stopAndResetMonitoring(); // Oprește și resetează testul
    hideNavigationConfirmModal();
    if (pendingNavigation) {
        window.location.href = pendingNavigation; // Navighează după confirmare
    }
});

confirmNavigationNoBtn.addEventListener('click', () => {
    hideNavigationConfirmModal();
});


// === DOMContentLoaded: setup și evenimente inițiale ===
document.addEventListener("DOMContentLoaded", () => {
  // === NOTIFICARE PRIVACY ===
  const privacyHidden = localStorage.getItem('liye_privacy_warning_hidden'); // Poate redenumi în lum_privacy_warning_hidden
  if (privacyHidden === 'true') {
    privacyWarning.classList.add('hidden');
    hidePrivacyWarningCheckbox.checked = true;
  }
  hidePrivacyWarningCheckbox.addEventListener('change', () => {
    const checked = hidePrivacyWarningCheckbox.checked;
    localStorage.setItem('liye_privacy_warning_hidden', checked); // Poate redenumi în lum_privacy_warning_hidden
    privacyWarning.classList.toggle('hidden', checked);
  });

  // === OFFLINE / ONLINE ===
  if (!navigator.onLine) {
    offlineStatus.classList.remove("hidden");
  }
  window.addEventListener('online', () => offlineStatus.classList.add("hidden"));
  window.addEventListener('offline', () => offlineStatus.classList.remove("hidden"));

  // === Inițializare cameră la încărcarea paginii ===
  initCameraAndMediaPipeStream();

  // === Eveniment pentru START RECORDING (pe overlay-ul video) ===
  videoOverlay.addEventListener('click', () => {
      startMonitoring();
  });

  // === Eveniment pentru STOP RECORDING (pe butonul din controls) ===
  stopRecordingBtn.addEventListener('click', () => {
      stopAndResetMonitoring();
  });

  // === Interceptarea click-urilor pe link-uri/butoane de navigare ===
  document.querySelectorAll('a[href], button').forEach(element => {
    if (element.id === 'stop-recording-btn' || element.id === 'confirm-navigation-yes' || element.id === 'confirm-navigation-no' || element.id === 'hide-test-finished-notification' || element.id === 'dont-show-test-finished-again' || element.id === 'hide-privacy-warning') {
        // Exclude butoanele de control ale testului și modalului
        return;
    }

    element.addEventListener('click', (event) => {
      if (monitoringActive) {
        event.preventDefault(); // Oprește navigarea implicită
        // Construiește URL-ul de destinație. Pentru ancore interne (ex: #section), folosește id-ul.
        // Pentru link-uri externe sau pagini diferite, folosește href-ul.
        const targetUrl = element.getAttribute('href') || '#'; // Asigură-te că preia href-ul sau un '#' pentru butoane fără href
        showNavigationConfirmModal(targetUrl);
      }
    });
  });

    // Inițial dezactivează link-urile Reports și Recommends din navbar
    toggleNavbarReportsRecommends(false);
});

// END vision-test.js
