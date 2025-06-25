// script.js - Updated version for dynamic content and responsive logic

fetch("content.json")
  .then(res => res.json())
  .then(data => {

    // --- Utility Functions ---

    function getYouTubeVideoId(videoUrl) {
      if (!videoUrl) return null; // Return null if no URL provided
      // Handle full YouTube URLs (watch, embed) and direct IDs
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = videoUrl.match(regex);
      return match ? match[1] : (videoUrl.length === 11 ? videoUrl : null); // Return direct ID if 11 chars, else null
    }

    // Corrected setVideoIframeSrc to use valid YouTube embed URL
    function setVideoIframeSrc(elementId, videoUrl, controls = 0) {
      const videoId = getYouTubeVideoId(videoUrl);
      const el = document.getElementById(elementId);
      if (el && videoId) {
        el.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=${controls}&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
        el.style.display = 'block'; // Show iframe
      } else if (el) {
        el.src = ''; // Clear src if no valid video, potentially hide
        el.style.display = 'none'; // Hide iframe if no video
      }
    }

    // Corrected setThumbnailSrc to use valid YouTube thumbnail URL
    function setThumbnailSrc(imgElementId, videoUrl) {
      const videoId = getYouTubeVideoId(videoUrl);
      const el = document.getElementById(imgElementId);
      if (el && videoId) {
        el.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        el.style.display = 'block'; // Show thumbnail
      } else if (el) {
        el.src = ''; // Clear src if no valid video, potentially hide
        el.style.display = 'none'; // Hide thumbnail if no video
      }
    }

    // Function to set MP4 video background
    function setMp4VideoBackground(containerId, videoUrl) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const videoEl = container.querySelector('video');
        const imgEl = container.querySelector('img'); // Assuming an img for photo fallback

        if (videoUrl && videoUrl.endsWith('.mp4')) {
            // Use MP4 video
            if (videoEl) {
                videoEl.src = videoUrl;
                videoEl.load(); // Load the video
                videoEl.play().catch(e => console.log("Video play failed:", e)); // Autoplay, catch potential errors
                videoEl.style.display = 'block';
            }
            if (imgEl) imgEl.style.display = 'none'; // Hide image if video is playing
            container.style.backgroundImage = 'none'; // Clear CSS background image
        } else {
            // Fallback to image (either from JSON or default if needed)
            if (videoEl) {
                videoEl.pause();
                videoEl.currentTime = 0;
                videoEl.src = ''; // Clear video source
                videoEl.style.display = 'none';
            }
            // Assume the image background is set via safeSetBackground if videoUrl is not MP4
            // or directly set imgEl.src if imgEl exists
            if (imgEl && container.dataset.fallbackImage) { // Check for a data attribute for fallback image
                imgEl.src = container.dataset.fallbackImage;
                imgEl.style.display = 'block';
            }
        }
    }

    function formatTextForDisplay(text) {
      // If text is null, undefined, or empty, ensure the output is also empty
      if (!text || text.trim() === "") {
        return { title: "", content: "" };
      }
      const lines = text.split('\n');
      return {
        title: lines[0] ? lines[0].trim() : "",
        content: lines.slice(1).join('\n').trim()
      };
    }

    // safeSetText: Hides the element if the value is empty
    function safeSetText(id, value) {
      const el = document.getElementById(id);
      if (el) {
        if (value && value.trim() !== "") {
          el.innerText = value;
          el.style.display = ''; // Show element if it has content
        } else {
          el.innerText = ''; // Clear content
          el.style.display = 'none'; // Hide element if content is empty
        }
      }
    }

    function safeSetHref(id, value) {
      const el = document.getElementById(id);
      if (el && value) {
        el.href = value;
      }
    }

    // safeSetBackground: Sets CSS background-image
    function safeSetBackground(id, imageUrl) {
      const el = document.getElementById(id);
      if (el) {
        if (imageUrl && imageUrl.trim() !== "") {
          el.style.backgroundImage = `url(${imageUrl})`;
          el.style.display = ''; // Show container if it has background
        } else {
          el.style.backgroundImage = 'none';
          // Decide if you want to hide the whole container or just remove background
          // For now, it just removes the background.
        }
      }
    }

    // Function to manage video/image backgrounds for generic sections
    function setSectionBackground(containerId, dataObject, isMobile = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const videoPath = dataObject.video; // Could be YouTube ID or MP4 path
        const imagePath = dataObject.image;

        // Check if it's an MP4 video (assuming local MP4s vs YouTube IDs)
        if (videoPath && videoPath.endsWith('.mp4')) {
            // For local MP4 video
            let videoEl = container.querySelector('video');
            if (!videoEl) { // Create video element if it doesn't exist
                videoEl = document.createElement('video');
                videoEl.setAttribute('autoplay', '');
                videoEl.setAttribute('loop', '');
                videoEl.setAttribute('muted', '');
                videoEl.setAttribute('playsinline', ''); // For iOS autoplay
                videoEl.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;';
                container.prepend(videoEl); // Add video to the start
            }
            videoEl.src = videoPath;
            videoEl.style.display = 'block';
            container.style.backgroundImage = 'none'; // Clear CSS background image
        } else if (getYouTubeVideoId(videoPath)) {
            // For YouTube video (usually for the hero or specific video sections)
            // This case implies a specific iframe is already in HTML, handled by setVideoIframeSrc for hero
            // For other sections that might have a YouTube background, you'd need an iframe for them.
            // For now, this function primarily handles image/MP4. YouTube embeds are separate.
             container.style.backgroundImage = `url(${imagePath})`; // Default to image if YT not handled by dedicated iframe
        } else if (imagePath && imagePath.trim() !== "") {
            // If no valid video path or not an MP4, use image
            container.style.backgroundImage = `url(${imagePath})`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
            let videoEl = container.querySelector('video');
            if (videoEl) { // Hide any existing video element
                videoEl.pause();
                videoEl.currentTime = 0;
                videoEl.src = '';
                videoEl.style.display = 'none';
            }
        } else {
            container.style.backgroundImage = 'none';
            let videoEl = container.querySelector('video');
            if (videoEl) { // Hide any existing video element
                videoEl.pause();
                videoEl.currentTime = 0;
                videoEl.src = '';
                videoEl.style.display = 'none';
            }
        }
    }


    // --- Populate Content ---

    // Determine if we are on mobile (using screen width, should match CSS media query)
    const isMobileView = window.innerWidth <= 768;

    // HERO SECTION (Snap-scroll 1 Mobile & Desktop)
    const heroContent = formatTextForDisplay(data.hero.title);
    safeSetText("hero-title", heroContent.title);
    safeSetText("hero-content", heroContent.content);

    // Hero Background: Use YouTube video for both mobile and desktop as per content.json structure
    // If mobile hero needs MP4/image option, content.json needs 'mobileVideo', 'mobileImage' fields for hero.
    setVideoIframeSrc("hero-video", data.hero.videoBackground, 0); // Always set YouTube for desktop hero
    // For mobile hero, if it should always be YT, you'd apply it to the mobile video player here.
    // If you need distinct mobile video (MP4) vs desktop video (YouTube) for hero,
    // you'd need `hero.mobileVideoPath` and conditional logic here.
    // For now, `hero-video` ID will be used, and its display controlled by CSS (desktop-only for iframe).


    // --- Mobile Specific Snap-Scrolls (1-5) ---
    // (These will be populated regardless, but their display is controlled by CSS media queries)

    // Snap-scroll 1 Mobile: Uses Hero content (handled above)

    // Snap-scroll 2 Mobile (from section2.mobile_2_1)
    const s2Mobile1 = formatTextForDisplay(data.section2.mobile_2_1.title);
    safeSetText("snap2-mobile-title", s2Mobile1.title); // New ID assumed: snap2-mobile-title
    safeSetText("snap2-mobile-content", s2Mobile1.content); // New ID assumed: snap2-mobile-content
    setSectionBackground("snap2-mobile-bg", data.section2.mobile_2_1, true); // New ID assumed: snap2-mobile-bg

    // Snap-scroll 3 Mobile (Video section, from section2.mobile_2_2)
    setSectionBackground("snap3-mobile-bg", data.section2.mobile_2_2, true); // New ID assumed: snap3-mobile-bg
    setThumbnailSrc("video-vp-thumbnail-mobile", data.section2.mobile_2_2.video); // Video for mobile modal


    // Snap-scroll 4 Mobile (from section3.left_content)
    const s4Mobile = formatTextForDisplay(data.section3.left_content.title);
    safeSetText("snap4-mobile-title", s4Mobile.title); // New ID assumed: snap4-mobile-title
    safeSetText("snap4-mobile-content", s4Mobile.content); // New ID assumed: snap4-mobile-content
    setSectionBackground("snap4-mobile-bg", data.section3.left_content, true); // New ID assumed: snap4-mobile-bg

    // Snap-scroll 5 Mobile (Contact section, from contactInfo.left_content)
    const s5Mobile = formatTextForDisplay(data.contactInfo.left_content.title);
    safeSetText("snap5-mobile-title", s5Mobile.title); // New ID assumed: snap5-mobile-title
    safeSetText("snap5-mobile-content", s5Mobile.content); // New ID assumed: snap5-mobile-content
    setSectionBackground("snap5-mobile-bg", data.contactInfo.left_content, true); // New ID assumed: snap5-mobile-bg


    // --- Desktop Specific Snap-Scrolls (3 total) ---

    // Snap-scroll 1 Desktop: Uses Hero content (handled above, will display hero-video iframe)

    // Snap-scroll 2 Desktop (Split: 2.1 & 2.2)
    // Snap-scroll 2.1 Desktop (Left half, from section2.mobile_2_1)
    const s2LeftDesktop = formatTextForDisplay(data.section2.mobile_2_1.title); // Source from mobile_2_1 as per mapping
    safeSetText("snap2-left-title", s2LeftDesktop.title);
    safeSetText("snap2-left-content", s2LeftDesktop.content);
    setSectionBackground("snap2-left-bg", data.section2.mobile_2_1); // Use mobile_2_1 data for background
    safeSetHref("snap2-left-link", data.section2.left_content.link); // Retaining link from original json structure

    // Snap-scroll 2.2 Desktop (Right half, video, from section2.mobile_2_2)
    setSectionBackground("snap2-right-bg", data.section2.mobile_2_2); // Use mobile_2_2 data for background
    setThumbnailSrc("video-vp-thumbnail", data.section2.mobile_2_2.video); // Video for desktop modal


    // Snap-scroll 3 Desktop (Split: 3.1 & 3.2)
    // Snap-scroll 3.1 Desktop (Left half, from section3.left_content)
    const s3LeftDesktop = formatTextForDisplay(data.section3.left_content.title); // Source from section3.left_content
    safeSetText("snap3-left-title", s3LeftDesktop.title);
    safeSetText("snap3-left-content", s3LeftDesktop.content);
    setSectionBackground("snap3-left-bg", data.section3.left_content);

    // Snap-scroll 3.2 Desktop (Right half, contact info, from contactInfo.left_content)
    const s4LeftDesktop = formatTextForDisplay(data.contactInfo.left_content.title); // Source from contactInfo.left_content
    safeSetText("snap4-left-title", s4LeftDesktop.title);
    safeSetText("snap4-left-content", s4LeftDesktop.content);
    setSectionBackground("snap4-left-bg", data.contactInfo.left_content); // Use contactInfo.left_content for background


    // --- Common Contact Info Details (for Snap-scroll 5 Mobile & Snap-scroll 3.2 Desktop) ---
    safeSetText("contact-info-phone", data.contactInfo.phone);
    // WhatsApp link based on phone number
    safeSetHref("whatsapp-link", `https://wa.me/${data.contactInfo.phone.replace(/\s/g, '').replace('+', '')}`);
    // Email link and display text
    safeSetHref("contact-info-email", `mailto:${data.contactInfo.email}`);
    const contactEmailElement = document.getElementById("contact-info-email");
    if (contactEmailElement) {
        safeSetText("contact-info-email", data.contactInfo.email);
    }
    // Set background for the right side of the contact info desktop section, if separate image
    safeSetBackground("snap4-right-bg", data.contactInfo.right_content.image);


    // Social Links - Ensure content.json has full URLs for social media.
    // The previous social-youtube link in JSON was malformed ("https://www.youtube.com/watch?v=youtube_video_id_here").
    // It should be a proper YouTube channel/profile URL.
    // I will try to use the provided value, but it's crucial to update content.json for these.
    safeSetHref("social-youtube", data.contactInfo.social.youtube);
    safeSetHref("social-instagram", data.contactInfo.social.instagram);
    safeSetHref("social-tiktok", data.contactInfo.social.tiktok);
    safeSetHref("social-linkedin", data.contactInfo.social["linkedin.com"]);


    // --- Modal Video Play Functionality ---
    const modal = document.getElementById("videoModal");
    const modalIframe = document.getElementById("modal-video-iframe");
    const closeModal = () => {
      if (modalIframe) modalIframe.src = ""; // Stop video playback
      if (modal) modal.style.display = "none";
    };

    const openModalWithVideo = (videoUrl) => {
      const videoId = getYouTubeVideoId(videoUrl);
      if (modalIframe && videoId) {
        modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
        if (modal) modal.style.display = "flex"; // Use flex to center the modal
      }
    };

    // Event listeners for playing videos in modal
    document.getElementById("play-video-vp")?.addEventListener("click", () => {
      openModalWithVideo(data.section2.mobile_2_2.video); // Use mobile_2_2 video for desktop modal too
    });
    document.getElementById("play-video-vp-mobile")?.addEventListener("click", () => {
      openModalWithVideo(data.section2.mobile_2_2.video);
    });
    document.querySelector(".close-button")?.addEventListener("click", closeModal);
    // Close modal when clicking outside of it
    window.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

  })
  .catch(error => console.error("Error fetching content.json:", error));

// Removed Hamburger menu functionality as per requirement.
// Ensure your HTML does not contain hamburger menu elements or related classes.
