// START linia 1
// vision-test.js – Logica completă pentru pagina vision-test.html

// === DOM ELEMENTS ===
const rawVideoFeed = document.getElementById("raw_video_feed");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const statusMessage = document.getElementById("status-message");
const liveFeedback = document.getElementById("live-feedback");
const offlineStatus = document.getElementById("offline-status");

const startCameraBtn = document.getElementById("start-camera-btn");
const durationSelectionContainer = document.getElementById("duration-selection-container");
const radioButtonsMonitorDuration = document.querySelectorAll('input[name="monitorDuration"]');

const privacyWarning = document.getElementById("privacy-warning");
const hidePrivacyWarningCheckbox = document.getElementById("hide-privacy-warning");
const instructionsDiv = document.getElementById("instructions");
const hideInstructionsCheckbox = document.getElementById("hide-instructions");

const timeLeftEl = document.getElementById("time-left");
const progressBar = document.getElementById("progress-bar");
const testUI = document.getElementById("test-ui");
const testResult = document.getElementById("test-result");
const restartBtn = document.getElementById("restart-btn");
const relaxLink = document.getElementById("relax-link");
const backgroundMusic = document.getElementById("background-music");
const startSound = document.getElementById("start-sound");
const endSound = document.getElementById("end-sound");
const badgeSuccess = document.getElementById("badge-success");

const scoreVisual = document.getElementById("score-visual");
const scoreBar = document.getElementById("score-bar");
const scoreEmoji = document.getElementById("score-emoji");

const stopContinueBtn = document.getElementById("stop-continue-btn");

// === Landmark Indici ===
const LEFT_EYE_TOP = 159;
const LEFT_EYE_BOTTOM = 145;
const RIGHT_EYE_TOP = 386;
const RIGHT_EYE_BOTTOM = 374;
const LEFT_IRIS_CENTER = 468;
const RIGHT_IRIS_CENTER = 473;

// === Config & State ===
const EAR_THRESHOLD = 0.015;
const BLINK_HOLD_FRAMES = 2;
const BLINK_RESET_FRAMES = 5;
const MAX_FACE_LOST_FRAMES = 150;

let blinkCount = 0;
let isBlinking = false;
let framesBelowThreshold = 0;
let framesAboveThreshold = 0;
let monitoringActive = false;
let monitoringPaused = false;
let monitoringTimer;
let monitoringDuration = 60;
let currentSecond = 0;
let faceLostCounter = 0;
window.lastProcessedLandmarks = null;

// === SCORE FUNCTIONS ===
function calculateEyeVerticalDistance(top, bottom) {
  return Math.hypot(top.y - bottom.y);
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
      console.warn("Error extracting imageData:", e);
    }
  });

  if (count === 0) return 0;
  const avg = total / count;
  const minB = 70, maxB = 220;
  let normalized = (avg - minB) / (maxB - minB) * 100;
  return Math.round(Math.min(100, Math.max(0, normalized)));
}

function calculateIndiceLumina(blinkScore, luminosityScore, w_blink = 0.6, w_lum = 0.4) {
  return Math.round(w_blink * blinkScore + w_lum * luminosityScore);
}

function interpretIndiceLumina(score) {
  if (score >= 80) return "✨ Your gaze is radiant! Perfect for creative activities.";
  if (score >= 60) return "😊 Your gaze is clear. A short break would maintain your focus.";
  if (score >= 40) return "😟 Your gaze seems tired. We recommend 3 minutes of eye exercises.";
  return "😩 Your gaze is strained. Stop for 5 minutes, breathe deeply, and look into the distance.";
}
// END linia 1
// START linia 101
// === START MONITORING ===
function startMonitoring() {
  monitoringActive = true;
  monitoringPaused = false;
  blinkCount = 0;
  currentSecond = 0;
  monitoringDuration = parseInt(document.querySelector('input[name="monitorDuration"]:checked').value);
  timeLeftEl.textContent = monitoringDuration;

  startCameraBtn.classList.add("hidden");
  durationSelectionContainer.classList.add("hidden");
  testUI.classList.remove("hidden");
  testResult.classList.add("hidden");
  restartBtn.classList.remove("hidden");
  stopContinueBtn.classList.remove("hidden");
  relaxLink.classList.add("hidden");
  badgeSuccess.classList.add("hidden", "opacity-0");
  scoreVisual.classList.add("hidden");

  statusMessage.textContent = "Monitoring in progress...";
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
  startSound.currentTime = 0;
  startSound.play().catch(e => console.log("Start sound error:", e));
  liveFeedback.textContent = "";

  monitoringTimer = setInterval(() => {
    if (!monitoringPaused) {
      currentSecond++;
      timeLeftEl.textContent = monitoringDuration - currentSecond;
      const progress = (currentSecond / monitoringDuration) * 100;
      progressBar.style.width = `${progress}%`;
      if (currentSecond >= monitoringDuration) endMonitoring();
    }
  }, 1000);
}

// === STOP / FINALIZARE MONITORIZARE ===
function endMonitoring() {
  clearInterval(monitoringTimer);
  backgroundMusic.pause();
  endSound.currentTime = 0;
  endSound.play().catch(e => console.log("End sound error:", e));

  testUI.classList.add("hidden");
  testResult.classList.remove("hidden");
  restartBtn.classList.remove("hidden");
  stopContinueBtn.classList.add("hidden");
  liveFeedback.textContent = "";

  const blinksPerMinute = (blinkCount / monitoringDuration) * 60;
  const blinkScore = calculateBlinkScore(blinksPerMinute);
  let luminosityScore = 0;
  if (window.lastProcessedLandmarks) {
    luminosityScore = calculateLuminosityScore(canvasCtx, window.lastProcessedLandmarks, canvasElement.width, canvasElement.height);
  }

  const indiceLumina = calculateIndiceLumina(blinkScore, luminosityScore);
  const feedback = interpretIndiceLumina(indiceLumina);
  testResult.textContent = `Blinks: ${blinksPerMinute.toFixed(1)}/min – Light Index: ${indiceLumina} – ${feedback}`;
  saveTestResult(blinkCount, feedback, indiceLumina, blinkScore, luminosityScore);

  scoreVisual.classList.remove("hidden");
  let barText = "", barColor = "", emoji = "";

  if (indiceLumina >= 80) {
    barText = "Radiant"; barColor = "bg-blue-500"; emoji = "✨";
  } else if (indiceLumina >= 60) {
    barText = "Clear"; barColor = "bg-green-500"; emoji = "😊";
  } else if (indiceLumina >= 40) {
    barText = "Tired"; barColor = "bg-yellow-500"; emoji = "😟";
  } else {
    barText = "Strained"; barColor = "bg-red-500"; emoji = "😩";
  }

  scoreBar.style.width = `${indiceLumina}%`;
  scoreBar.textContent = barText;
  scoreBar.className = `h-6 text-sm font-bold text-white text-center leading-6 rounded ${barColor}`;
  scoreEmoji.textContent = emoji;

  if (indiceLumina >= 60) {
    badgeSuccess.classList.remove("hidden");
    setTimeout(() => badgeSuccess.classList.remove("opacity-0"), 10);
    setTimeout(() => badgeSuccess.classList.add("hidden", "opacity-0"), 6000);
  }
  if (indiceLumina < 60) {
    relaxLink.classList.remove("hidden");
  }
}
// END linia 101
// START linia 201
// === STOP / CONTINUE BUTTON ===
function toggleMonitoringPause() {
  if (monitoringPaused) {
    monitoringPaused = false;
    stopContinueBtn.textContent = "Stop Monitoring";
    statusMessage.textContent = "Monitoring resumed...";
    backgroundMusic.play();
  } else {
    monitoringPaused = true;
    stopContinueBtn.textContent = "Continue Monitoring";
    statusMessage.textContent = "Monitoring paused. Click to resume.";
    backgroundMusic.pause();
  }
}

// === SAVE RESULTS TO LOCAL STORAGE ===
function saveTestResult(blinks, feedback, indice, blinkScore, luminosityScore) {
  const entry = {
    date: new Date().toLocaleString(),
    blinks, feedback, indiceLumina: indice, blinkScore, luminosityScore
  };
  const history = JSON.parse(localStorage.getItem("vh_history") || "[]");
  history.push(entry);
  localStorage.setItem("vh_history", JSON.stringify(history));
  localStorage.setItem("liye_last_test", JSON.stringify(entry));
}

// === MEDIAPIPE DRAWING + LOGIC ===
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (results.image) {
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  }

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    window.lastProcessedLandmarks = landmarks;
    faceLostCounter = 0;

    if (monitoringActive && !monitoringPaused) {
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
    }

  } else {
    window.lastProcessedLandmarks = null;
    if (monitoringActive) {
      faceLostCounter++;
      if (faceLostCounter >= MAX_FACE_LOST_FRAMES) {
        clearInterval(monitoringTimer);
        backgroundMusic.pause();
        statusMessage.textContent = "Face lost. Monitoring stopped.";
        monitoringActive = false;
        restartBtn.classList.remove("hidden");
        stopContinueBtn.classList.add("hidden");
        liveFeedback.textContent = "";
      } else {
        const remaining = Math.floor((MAX_FACE_LOST_FRAMES - faceLostCounter) / 30);
        statusMessage.textContent = `Face lost. ${remaining}s left to recover...`;
      }
    } else {
      statusMessage.textContent = "No face detected. Align your face with the camera.";
      faceLostCounter = 0;
    }
  }

  canvasCtx.restore();
}
// END linia 201
// START linia 301
// === INIT MEDIAPIPE ===
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

// === CAMERA STREAM SETUP ===
async function initCameraAndMediaPipeStream() {
  startCameraBtn.classList.add("hidden");
  durationSelectionContainer.classList.add("hidden");
  statusMessage.textContent = "Initializing camera...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    rawVideoFeed.srcObject = stream;
    await rawVideoFeed.play();

    const camera = new Camera({
      videoElement: rawVideoFeed,
      onFrame: async () => {
        await new Promise(requestAnimationFrame);
        await faceMesh.send({ image: rawVideoFeed });
      },
      width: 640,
      height: 480
    });
    camera.start();

    startCameraBtn.textContent = "Start Monitoring";
    startCameraBtn.classList.remove("hidden");
    durationSelectionContainer.classList.remove("hidden");
    statusMessage.textContent = "Camera ready. Click Start Monitoring.";

    startCameraBtn.removeEventListener('click', initialCameraClick);
    startCameraBtn.addEventListener('click', startMonitoringClick);
  } catch (err) {
    statusMessage.textContent = `Camera error: ${err.name} - ${err.message}`;
    startCameraBtn.classList.remove("hidden");
    durationSelectionContainer.classList.remove("hidden");
  }
}

// === START MONITORING WRAPPER ===
function initialCameraClick() {
  initCameraAndMediaPipeStream();
}
function startMonitoringClick() {
  startMonitoring();
  startCameraBtn.removeEventListener('click', startMonitoringClick);
}

// === RESTART BUTTON ===
restartBtn.addEventListener("click", () => {
  monitoringActive = false;
  monitoringPaused = false;
  faceLostCounter = 0;
  testResult.classList.add("hidden");
  restartBtn.classList.add("hidden");
  stopContinueBtn.classList.add("hidden");
  relaxLink.classList.add("hidden");
  badgeSuccess.classList.add("hidden", "opacity-0");
  scoreVisual.classList.add("hidden");
  statusMessage.textContent = "Awaiting camera initialization...";
  liveFeedback.textContent = "";
  blinkCount = 0;
  isBlinking = false;
  framesBelowThreshold = 0;
  framesAboveThreshold = 0;
  testUI.classList.add("hidden");

  startCameraBtn.classList.remove("hidden");
  durationSelectionContainer.classList.remove("hidden");

  if (rawVideoFeed.srcObject) {
    const tracks = rawVideoFeed.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    rawVideoFeed.srcObject = null;
  }

  startCameraBtn.addEventListener('click', initialCameraClick);
  startCameraBtn.textContent = "Start Camera";
});
// END linia 301
// START linia 401
// === DOM READY ===
document.addEventListener("DOMContentLoaded", () => {
  // PRIVACY WARNING
  const privacyHidden = localStorage.getItem('liye_privacy_warning_hidden');
  if (privacyHidden === 'true') {
    privacyWarning.classList.add('hidden');
    hidePrivacyWarningCheckbox.checked = true;
  }
  hidePrivacyWarningCheckbox.addEventListener('change', () => {
    const checked = hidePrivacyWarningCheckbox.checked;
    localStorage.setItem('liye_privacy_warning_hidden', checked);
    privacyWarning.classList.toggle('hidden', checked);
  });

  // INSTRUCȚIUNI
  const instrHidden = localStorage.getItem('liye_instructions_hidden');
  if (instrHidden === 'true') {
    instructionsDiv.classList.add('hidden');
    hideInstructionsCheckbox.checked = true;
  }
  hideInstructionsCheckbox.addEventListener('change', () => {
    const checked = hideInstructionsCheckbox.checked;
    localStorage.setItem('liye_instructions_hidden', checked);
    instructionsDiv.classList.toggle('hidden', checked);
  });

  // OFFLINE STATUS
  if (!navigator.onLine) {
    offlineStatus.classList.remove("hidden");
  }
  window.addEventListener('online', () => offlineStatus.classList.add("hidden"));
  window.addEventListener('offline', () => offlineStatus.classList.remove("hidden"));

  // LISTENERE PENTRU START ȘI STOP
  startCameraBtn.addEventListener('click', initialCameraClick);
  stopContinueBtn.addEventListener('click', toggleMonitoringPause);
});
// END linia 401

