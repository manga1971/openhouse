// script.js - versiune completă și optimizată

fetch("content.json")
  .then(res => res.json())
  .then(data => {

    function getYouTubeVideoId(videoUrl) {
      if (!videoUrl) return "dQw4w9WgXcQ"; // Fallback YouTube ID
      if (videoUrl.includes("v=")) return videoUrl.split("v=")[1].split("&")[0];
      if (videoUrl.includes("embed/")) return videoUrl.split("embed/")[1].split("?")[0];
      // Basic check for direct 11-character ID
      return videoUrl.length === 11 ? videoUrl : "dQw4w9WgXcQ";
    }

    // Updated setVideoIframeSrc to use a valid YouTube embed URL
    function setVideoIframeSrc(elementId, videoUrl, controls = 0) {
      const videoId = getYouTubeVideoId(videoUrl);
      const el = document.getElementById(elementId);
      if (el) {
        el.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=${controls}&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
      }
    }

    // Updated setThumbnailSrc to use a valid YouTube thumbnail URL
    function setThumbnailSrc(imgElementId, videoUrl) {
      const videoId = getYouTubeVideoId(videoUrl);
      const el = document.getElementById(imgElementId);
      if (el) {
        el.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    function formatTextForDisplay(text) {
      const lines = text.split('\n');
      return {
        title: lines[0],
        content: lines.slice(1).join('\n')
      };
    }

    function safeSetText(id, value) {
      const el = document.getElementById(id);
      if (el && value) el.innerText = value;
    }

    function safeSetHref(id, value) {
      const el = document.getElementById(id);
      if (el && value) el.href = value;
    }

    function safeSetBackground(id, imageUrl) {
      const el = document.getElementById(id);
      if (el && imageUrl && imageUrl.trim() !== "") {
        el.style.backgroundImage = `url(${imageUrl})`;
      }
    }

    // HERO SECTION
    const heroText = formatTextForDisplay(data.hero.title);
    safeSetText("hero-title", heroText.title);
    safeSetText("hero-content", heroText.content);
    setVideoIframeSrc("hero-video", data.hero.videoBackground, 0);

    // SECTION 2 - DESKTOP
    const s2Left = formatTextForDisplay(data.section2.left_content.title);
    safeSetText("snap2-left-title", s2Left.title);
    safeSetText("snap2-left-content", s2Left.content);
    safeSetHref("snap2-left-link", data.section2.left_content.link);
    safeSetBackground("snap2-left-bg", data.section2.left_content.image);
    safeSetBackground("snap2-right-bg", data.section2.right_content.image);

    // SECTION 2 - MOBILE (separate sections)
    const s2Mobile1 = formatTextForDisplay(data.section2.mobile_2_1.title);
    safeSetText("snap2-1-title-mobile", s2Mobile1.title);
    safeSetText("snap2-1-content-mobile", s2Mobile1.content);
    safeSetBackground("snap2-1-bg-mobile", data.section2.mobile_2_1.image);
    safeSetBackground("snap2-2-bg-mobile", data.section2.mobile_2_2.image); // Set background for mobile video section

    // SECTION 3 - DESKTOP (now responsive for mobile)
    // Populate left side
    const s3Left = formatTextForDisplay(data.section3.left_content.title);
    safeSetText("snap3-left-title", s3Left.title);
    safeSetText("snap3-left-content", s3Left.content);
    safeSetBackground("snap3-left-bg", data.section3.left_content.image);
    // Populate right side (form background only, actual form is static in HTML)
    safeSetBackground("snap3-right-bg", data.section3.right_content.image);

    // SECTION 4 - DESKTOP (now responsive for mobile)
    // Populate left side
    const s4Left = formatTextForDisplay(data.contactInfo.left_content.title);
    safeSetText("snap4-left-title", s4Left.title);
    safeSetText("snap4-left-content", s4Left.content);
    safeSetBackground("snap4-left-bg", data.contactInfo.left_content.image);
    // Populate right side (contact info background only, actual info is static in HTML, populated below)
    safeSetBackground("snap4-right-bg", data.contactInfo.right_content.image);

    // Contact Info Details (from contactInfo object in content.json)
    safeSetText("contact-info-phone", data.contactInfo.phone);
    safeSetHref("whatsapp-link", `https://wa.me/${data.contactInfo.phone.replace(/\s/g, '').replace('+', '')}`);
    safeSetHref("contact-info-email", `mailto:${data.contactInfo.email}`);
    // Set text for email display, not just href
    const contactEmailElement = document.getElementById("contact-info-email");
    if (contactEmailElement) {
        contactEmailElement.innerText = data.contactInfo.email;
    }
    
    // Social Links
    safeSetHref("social-youtube", data.contactInfo.social.youtube);
    safeSetHref("social-instagram", data.contactInfo.social.instagram);
    safeSetHref("social-tiktok", data.contactInfo.social.tiktok);
    // LinkedIn link has specific ID from index.html
    safeSetHref("social-linkedin", data.contactInfo.social["linkedin.com"]);


    // Thumbnails for video playback
    setThumbnailSrc("video-vp-thumbnail", data.section2.right_content.video);
    setThumbnailSrc("video-vp-thumbnail-mobile", data.section2.mobile_2_2.video);

    // Modal video play functionality
    const modal = document.getElementById("videoModal");
    const modalIframe = document.getElementById("modal-video-iframe");
    const closeModal = () => {
      modalIframe.src = ""; // Stop video playback
      modal.style.display = "none";
    };

    const openModalWithVideo = (videoUrl) => {
      const videoId = getYouTubeVideoId(videoUrl);
      modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
      modal.style.display = "flex"; // Use flex to center the modal
    };

    document.getElementById("play-video-vp")?.addEventListener("click", () => {
      openModalWithVideo(data.section2.right_content.video);
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


// Hamburger menu functionality
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('main-nav');

if (menuIcon && nav) {
  menuIcon.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuIcon.classList.toggle('active');
  });

  // Close menu when a navigation link is clicked (especially on mobile)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) { // Only close on smaller screens
        nav.classList.remove('active');
        menuIcon.classList.remove('active');
      }
    });
  });
}
