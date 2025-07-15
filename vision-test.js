// START vision-test.js

// === GLOBAL CONFIGURATION ===
// Object to hold messages for different page sections
const pageContent = {
  "/index.html": {
    mottoMessages: [
      "Motto: strive for progress not perfection",
      "Goal: cultivate light in your eyes every day",
      "Lum: your daily partner for eye well-being",
    ],
    permanentDisclaimer: "Disclaimer: Always consult a healthcare professional for medical advice. This app is for informational purposes only and not a diagnostic tool.",
    initialDisclaimer: "Welcome to Lum! Please note: This app is for informational purposes only and not a medical diagnostic tool. Always consult a healthcare professional for any medical concerns."
  },
  "/vision-test.html": {
    mottoMessages: [
      "Motto: cultivate light in your eyes every day",
      "Goal: consistent eye care for digital well-being",
      "Lum: enhance your visual comfort today",
    ],
    permanentDisclaimer: "Important: Camera images are processed exclusively on your device. Nothing is stored or sent. Always consult a healthcare professional for medical advice. This app is for informational purposes only.",
    initialDisclaimer: "Welcome to Lum's Vision Test! Your privacy is paramount: camera images are processed exclusively on your device. Nothing is stored or sent. This test is for informational purposes only and not a medical diagnostic tool."
  },
  // Add entries for other pages (e.g., /reports.html, /recommends.html) as needed
  // Example for Reports page:
  "/reports.html": {
    mottoMessages: [
      "Insights: understand your eye health patterns",
      "Action: transform data into better habits",
      "Lum Reports: track your journey to visual well-being"
    ],
    permanentDisclaimer: "Disclaimer: Report data is for informational tracking and personal insight only. Consult a healthcare professional for diagnosis or treatment. This app does not provide medical advice.",
    initialDisclaimer: "Welcome to your Lum Reports! Dive into your eye health journey. Remember, these reports are for informational purposes only and do not constitute medical advice."
  },
  // Example for Recommends page:
  "/recommends.html": {
    mottoMessages: [
      "Recommendations: personalized exercises for your eyes",
      "Guidance: cultivate healthy visual habits daily",
      "Lum Recommends: tailored support for your eye well-being"
    ],
    permanentDisclaimer: "Disclaimer: Recommended exercises and tips are for general well-being. Consult a healthcare professional before starting any new eye care routine. This app does not provide medical advice.",
    initialDisclaimer: "Explore Lum's personalized recommendations! These suggestions are for general well-being and do not replace professional medical advice. Always consult a healthcare professional."
  },
  // Default fallback if page is not found
  "default": {
    mottoMessages: ["Motto: strive for progress not perfection"],
    permanentDisclaimer: "Disclaimer: This application is for informational purposes only and does not provide medical advice. Always consult a healthcare professional.",
    initialDisclaimer: "This app is for informational purposes only and not a medical diagnostic tool. Always consult a healthcare professional for any medical concerns."
  }
};

const currentPageContent = pageContent[window.location.pathname] || pageContent["default"];

// === TEXT SLIDER (Motto) ===
let currentMessageIndex = 0;
const textSliderElement = document.getElementById("textSlider");

function updateTextSlider() {
  const messages = currentPageContent.mottoMessages;
  textSliderElement.classList.remove("opacity-100");
  textSliderElement.classList.add("opacity-0");
  setTimeout(() => {
    currentMessageIndex = (currentMessageIndex + 1) % messages.length;
    textSliderElement.textContent = messages[currentMessageIndex];
    textSliderElement.classList.remove("opacity-0");
    textSliderElement.classList.add("opacity-100");
  }, 500);
}
setInterval(updateTextSlider, 4000);
updateTextSlider();

// === PERMANENT DISCLAIMER ===
const permanentDisclaimerElement = document.getElementById("permanent-disclaimer");
if (permanentDisclaimerElement) {
    permanentDisclaimerElement.textContent = currentPageContent.permanentDisclaimer;
}

// === NAVBAR ACTIVATION ===
const navItems = document.querySelectorAll('.nav-item');
function setActiveNavItem(id) {
  navItems.forEach(item => {
    item.classList.remove('active', 'font-semibold', 'text-orange-500', 'text-blue-600');
    item.classList.add('text-gray-700');
  });
  const activeItem = document.getElementById(id);
  if (activeItem) {
    activeItem.classList.add('active', 'font-semibold');
    if (id === 'nav-lum-test') activeItem.classList.add('text-orange-500');
    activeItem.classList.remove('text-gray-700');
  }
}
// Set active nav item based on current page path
// Simplified for this context, in a full app you'd parse window.location.pathname
if (window.location.pathname.includes("vision-test.html")) {
    setActiveNavItem('nav-lum-test');
} else if (window.location.pathname.includes("index.html")) {
    setActiveNavItem('nav-home');
} else if (window.location.pathname.includes("recommends.html")) {
    setActiveNavItem('nav-recommends');
} else if (window.location.pathname.includes("reports.html")) {
    setActiveNavItem('nav-reports');
} else if (window.location.pathname.includes("resources.html")) {
    setActiveNavItem('nav-resources');
}


// === DOM ELEMENTS (vision-test.html specific) ===
const rawVideoFeed = document.getElementById("raw_video_feed");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement ? canvasElement.getContext("2d") : null;

const videoOverlay = document.getElementById("video-overlay");
const videoControls = document.getElementById("video-controls");
const stopRecordingBtn = document.getElementById("stop-recording-btn");
const timeAccumulatedEl = document.getElementById("time-accumulated");
const timeRemainingEl = document.getElementById("time-remaining");
const progressBar = document.getElementById("progress-bar");
const statusMessage = document.getElementById("status-message");
const liveFeedback = document.getElementById("live-feedback");

// Notification/Modal elements
const testFinishedNotification = document.getElementById("test-finished-notification");
const hideTestFinishedNotificationBtn = document.getElementById("hide-test-finished-notification");
const dontShowTestFinishedAgainCheckbox = document.getElementById("dont-show-test-finished-again");
const navigationConfirmModal = document.getElementById("navigation-confirm-modal");
const confirmNavigationYesBtn = document.getElementById("confirm-navigation-yes");
const confirmNavigationNoBtn = document.getElementById("confirm-navigation-no");
const initialDisclaimerPopup = document.getElementById('initial-disclaimer-popup');
const hideInitialDisclaimerBtn = document.getElementById('hide-initial-disclaimer');
const dontShowInitialDisclaimerAgainCheckbox = document.getElementById('dont-show-initial-disclaimer-again');


const offlineStatus = document.getElementById("offline-status");

const backgroundMusic = document.getElementById("background-music");
const startSound = document.getElementById("start-sound");
const endSound = document.getElementById("end-sound");

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
let monitoringActive = false;
let monitoringPaused = false; // True if face is lost for too long
let monitoringTimer;
const TOTAL_MONITORING_DURATION = 120; // 120 secunde pentru testul calitativ
let accumulatedMonitoringTime = 0; // Timpul acumulat efectiv de monitorizare calitativă (în secunde)
let faceLostCounter = 0; // Counts frames where face is lost
let facePresentThisSecond = false; // Flag to check if face was present in any frame during the last second

window.lastProcessedLandmarks = null;
let pendingNavigation = null;

// === HELPER FUNCTIONS ===
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// === SCORING FUNCTIONS ===
function calculateEyeVerticalDistance(top, bottom) {
  return Math.hypot(top.x - bottom.x, top.y - bottom.y);
}

function calculateBlinkScore(blinksPerMinute) {
  const OPTIMAL_MIN = 12, OPTIMAL_MAX = 22;
  const EXTREME_LOW = 5, EXTREME_HIGH = 30;
  if (blinksPerMinute >= OPTIMAL_MIN && blinksPerMinute <= OPTIMAL_MAX) return 100;
  if (blinksPerMinute < EXTREME_LOW || blinksPerMinute > EXTREME_HIGH) return Math.round(20 + (blinksPerMinute - EXTREME_LOW) / (OPTIMAL_MIN - EXTREME_LOW) * 80);
  if (blinksPerMinute > OPTIMAL_MAX) return Math.round(20 + (EXTREME_HIGH - blinksPerMinute) / (EXTREME_HIGH - OPTIMAL_MAX) * 80);
  return 0; // Should not be reached
}

function calculateLuminosityScore(ctx, landmarks, w, h) {
  if (!landmarks || !ctx) return 0;
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
  const minB = 70, maxB = 220;
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

// Function to start monitoring, triggered by click on overlay
async function startMonitoring() {
  if (monitoringActive) return;

  // Ensure camera stream is active and FaceMesh is processing
  if (!rawVideoFeed.srcObject || rawVideoFeed.paused) {
    await initCameraAndMediaPipeStream();
  }

  monitoringActive = true;
  monitoringPaused = false;
  blinkCount = 0;
  accumulatedMonitoringTime = 0;
  faceLostCounter = 0;
  window.lastProcessedLandmarks = null;
  facePresentThisSecond = false; // Reset flag for new test

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

  toggleNavbarReportsRecommends(false); // Disable Reports/Recommends during test

  // The setInterval is responsible for incrementing accumulatedMonitoringTime per second
  monitoringTimer = setInterval(() => {
    if (monitoringActive) { // Ensure timer only runs if test is active
      if (facePresentThisSecond && !monitoringPaused) { // Increment only if face was detected this second AND not paused
        accumulatedMonitoringTime++;
        // Update UI elements for time and progress bar
        const remaining = Math.max(0, TOTAL_MONITORING_DURATION - accumulatedMonitoringTime);
        timeAccumulatedEl.textContent = formatTime(accumulatedMonitoringTime);
        timeRemainingEl.textContent = formatTime(remaining);
        progressBar.style.width = `${(accumulatedMonitoringTime / TOTAL_MONITORING_DURATION) * 100}%`;

        if (accumulatedMonitoringTime >= TOTAL_MONITORING_DURATION) {
          endMonitoring();
        }
      } else if (monitoringPaused) {
          // Just update visual status if paused, but don't increment time
          statusMessage.textContent = `Monitoring paused. Re-center face to resume.`;
      }
      // Reset the flag for the next second's check
      facePresentThisSecond = false;
    }
  }, 1000); // This runs every second
}

function endMonitoring() {
  if (!monitoringActive) return;

  clearInterval(monitoringTimer);
  monitoringActive = false;
  monitoringPaused = false;

  backgroundMusic.pause();
  endSound.currentTime = 0;
  endSound.play().catch(e => console.log("End sound error:", e));

  videoControls.classList.add("hidden");
  videoOverlay.classList.remove("hidden"); // Re-display overlay to re-start
  statusMessage.textContent = "Test finished. See your reports!";
  liveFeedback.textContent = "";

  // Calculate final scores and save result
  const blinksPerMinute = accumulatedMonitoringTime > 0 ? (blinkCount / accumulatedMonitoringTime) * 60 : 0;
  const blinkScore = calculateBlinkScore(blinksPerMinute);
  let luminosityScore = 0;
  if (window.lastProcessedLandmarks && canvasCtx) { // Ensure canvasCtx exists
    luminosityScore = calculateLuminosityScore(canvasCtx, window.lastProcessedLandmarks, canvasElement.width, canvasElement.height);
  }
  const indiceLumina = calculateIndiceLumina(blinkScore, luminosityScore);
  const feedback = interpretIndiceLumina(indiceLumina);

  saveTestResult(blinkCount, feedback, indiceLumina, blinkScore, luminosityScore, accumulatedMonitoringTime);

  showTestFinishedNotification(); // Show test finished notification

  toggleNavbarReportsRecommends(true); // Enable Reports/Recommends in navbar
}

function stopAndResetMonitoring() {
  clearInterval(monitoringTimer);
  monitoringActive = false;
  monitoringPaused = false;
  blinkCount = 0;
  accumulatedMonitoringTime = 0;
  faceLostCounter = 0;
  window.lastProcessedLandmarks = null;
  facePresentThisSecond = false; // Reset flag

  // Stop camera if active
  if (rawVideoFeed && rawVideoFeed.srcObject) {
    const tracks = rawVideoFeed.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    rawVideoFeed.srcObject = null;
    if (canvasCtx) canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Clear canvas
  }

  videoControls.classList.add("hidden");
  videoOverlay.classList.remove("hidden"); // Re-display "Start Recording" overlay
  progressBar.style.width = `0%`;
  timeAccumulatedEl.textContent = formatTime(0);
  timeRemainingEl.textContent = formatTime(TOTAL_MONITORING_DURATION);

  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;

  statusMessage.textContent = "Test stopped. Tap to start a new recording.";
  liveFeedback.textContent = "";

  toggleNavbarReportsRecommends(false); // Disable Reports/Recommends if test was stopped prematurely
}

function saveTestResult(blinks, feedback, indice, blinkScore, luminosityScore, duration) {
  const entry = {
    date: new Date().toLocaleString(),
    blinks, feedback,
    indiceLumina: indice,
    blinkScore,
    luminosityScore,
    duration: duration // Effective accumulated test duration
  };
  const history = JSON.parse(localStorage.getItem("lum_history") || "[]"); // Changed to lum_history
  history.push(entry);
  localStorage.setItem("lum_history", JSON.stringify(history)); // Changed to lum_history
  localStorage.setItem("lum_last_test", JSON.stringify(entry)); // Changed to lum_last_test
}

// Enable/disable Reports and Recommends links in navbar
function toggleNavbarReportsRecommends(enable) {
    const reportsLink = document.getElementById('nav-reports');
    const recommendsLink = document.getElementById('nav-recommends');

    if (reportsLink && recommendsLink) { // Ensure elements exist
        if (enable) {
            reportsLink.classList.remove('pointer-events-none', 'opacity-50');
            recommendsLink.classList.remove('pointer-events-none', 'opacity-50');
        } else {
            reportsLink.classList.add('pointer-events-none', 'opacity-50');
        }
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

    if (camera) camera.stop();
    camera = new Camera(rawVideoFeed, {
      onFrame: async () => {
        await faceMesh.send({ image: rawVideoFeed });
      },
      width: 640,
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
  if (!canvasCtx) return; // Ensure canvas context exists before drawing

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.image) {
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  }

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    window.lastProcessedLandmarks = landmarks;
    facePresentThisSecond = true; // Flag for second-based time accumulation
    faceLostCounter = 0; // Reset frame counter for face loss
    monitoringPaused = false; // Resume if face is back

    if (monitoringActive) {
      // ONLY blink detection logic here (no time accumulation)
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
    facePresentThisSecond = false; // No face detected this frame

    if (monitoringActive) {
      faceLostCounter++;
      if (faceLostCounter >= MAX_FACE_LOST_FRAMES) {
        monitoringPaused = true;
        statusMessage.textContent = `Face lost. Monitoring paused. Please re-center.`;
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

// === NOTIFICATION HANDLERS (for Test Finished) ===
function showTestFinishedNotification() {
    const dontShowAgain = localStorage.getItem('lum_test_finished_notification_hidden'); // Changed to lum_
    if (dontShowAgain === 'true') {
        return;
    }
    if (testFinishedNotification) { // Ensure element exists
        testFinishedNotification.classList.add('show');
        setTimeout(() => {
            testFinishedNotification.classList.remove('show');
        }, 5000);
    }
}

if (hideTestFinishedNotificationBtn) { // Ensure element exists
    hideTestFinishedNotificationBtn.addEventListener('click', () => {
        if (testFinishedNotification) testFinishedNotification.classList.remove('show');
    });
}

if (dontShowTestFinishedAgainCheckbox) { // Ensure element exists
    dontShowTestFinishedAgainCheckbox.addEventListener('change', () => {
        localStorage.setItem('lum_test_finished_notification_hidden', dontShowTestFinishedAgainCheckbox.checked); // Changed to lum_
    });
}

// === NAVIGATION CONFIRMATION MODAL HANDLERS ===
function showNavigationConfirmModal(targetUrl) {
    pendingNavigation = targetUrl;
    if (navigationConfirmModal) navigationConfirmModal.classList.add('show');
}

function hideNavigationConfirmModal() {
    if (navigationConfirmModal) navigationConfirmModal.classList.remove('show');
    pendingNavigation = null;
}

if (confirmNavigationYesBtn) { // Ensure element exists
    confirmNavigationYesBtn.addEventListener('click', () => {
        stopAndResetMonitoring(); // Stop and reset the test
        hideNavigationConfirmModal();
        if (pendingNavigation) {
            window.location.href = pendingNavigation; // Navigate after confirmation
        }
    });
}

if (confirmNavigationNoBtn) { // Ensure element exists
    confirmNavigationNoBtn.addEventListener('click', () => {
        hideNavigationConfirmModal();
    });
}

// === INITIAL DISCLAIMER POPUP HANDLERS ===
const initialDisclaimerKey = 'lum_initial_disclaimer_hidden'; // Key for localStorage

function showInitialDisclaimerPopup() {
    const hiddenPreference = localStorage.getItem(initialDisclaimerKey);
    // Only show if it hasn't been hidden before AND this is the first page load for this session/user
    if (hiddenPreference !== 'true' && initialDisclaimerPopup) {
        initialDisclaimerPopup.classList.add('show');
    }
}

if (hideInitialDisclaimerBtn) { // Ensure element exists
    hideInitialDisclaimerBtn.addEventListener('click', () => {
        if (initialDisclaimerPopup) initialDisclaimerPopup.classList.remove('show');
        if (dontShowInitialDisclaimerAgainCheckbox.checked) {
            localStorage.setItem(initialDisclaimerKey, 'true');
        }
    });
}

if (dontShowInitialDisclaimerAgainCheckbox) { // Ensure element exists
    dontShowInitialDisclaimerAgainCheckbox.addEventListener('change', () => {
        localStorage.setItem(initialDisclaimerKey, dontShowInitialDisclaimerAgainCheckbox.checked);
    });
}


// === DOMContentLoaded: setup și evenimente inițiale ===
document.addEventListener("DOMContentLoaded", () => {
  // === OFFLINE / ONLINE STATUS ===
  if (offlineStatus) { // Ensure element exists
    if (!navigator.onLine) {
      offlineStatus.classList.remove("hidden");
    }
    window.addEventListener('online', () => offlineStatus.classList.add("hidden"));
    window.addEventListener('offline', () => offlineStatus.classList.remove("hidden"));
  }

  // === Initial Camera Initialization (if video feed exists) ===
  if (rawVideoFeed) {
    initCameraAndMediaPipeStream();
  }

  // === Event for START RECORDING (on video overlay) ===
  if (videoOverlay) { // Ensure element exists
    videoOverlay.addEventListener('click', () => {
        startMonitoring();
    });
  }

  // === Event for STOP RECORDING (on controls button) ===
  if (stopRecordingBtn) { // Ensure element exists
    stopRecordingBtn.addEventListener('click', () => {
        stopAndResetMonitoring();
    });
  }

  // === Intercept navigation clicks during test ===
  document.querySelectorAll('a[href], button').forEach(element => {
    // Exclude internal control buttons that manage test state or popup
    if (element.id === 'stop-recording-btn' ||
        element.id === 'confirm-navigation-yes' ||
        element.id === 'confirm-navigation-no' ||
        element.id === 'hide-test-finished-notification' ||
        element.id === 'dont-show-test-finished-again' ||
        element.id === 'hide-initial-disclaimer' ||
        element.id === 'dont-show-initial-disclaimer-again' ||
        element.closest('header') // Exclude header buttons for simpler logic here
    ) {
        return;
    }

    // Handle clicks for navbar items and other links
    element.addEventListener('click', (event) => {
      // Check if it's a navbar item and test is active or if it's any other navigation link
      const isNavbarItem = element.closest('nav');
      // If it's a navbar item AND Reports/Recommends are DISABLED (meaning test is ongoing), OR if it's any other link and test is active
      if (monitoringActive && (isNavbarItem && element.classList.contains('pointer-events-none') || !isNavbarItem)) {
        event.preventDefault(); // Stop default navigation
        const targetUrl = element.getAttribute('href') || '#';
        showNavigationConfirmModal(targetUrl);
      }
    });
  });

  // Also handle header button clicks for navigation confirmation
  document.querySelectorAll('header button').forEach(button => {
    button.addEventListener('click', (event) => {
      if (monitoringActive) {
        event.preventDefault(); // Prevent default button action if test is ongoing
        // Since header buttons don't have href, we can define a dummy target or just stop the test
        showNavigationConfirmModal('#'); // Use # or special value if button has no nav function
      }
    });
  });


  // Initial activation status for Reports and Recommends based on last test result or empty history
  const lastTest = localStorage.getItem("lum_last_test");
  if (lastTest) {
      toggleNavbarReportsRecommends(true); // If there's a last test, assume reports are ready
  } else {
      toggleNavbarReportsRecommends(false); // No tests done yet, disable reports/recommends
  }

  // Show initial disclaimer popup on DOMContentLoaded for this page
  showInitialDisclaimerPopup();
});

// END vision-test.js
