// script.js - versiune completă și optimizată

fetch("content.json")
  .then(res => res.json())
  .then(data => {

    function getYouTubeVideoId(videoUrl) {
      if (!videoUrl) return "dQw4w9WgXcQ";
      if (videoUrl.includes("v=")) return videoUrl.split("v=")[1].split("&")[0];
      if (videoUrl.includes("embed/")) return videoUrl.split("embed/")[1].split("?")[0];
      return videoUrl.length === 11 ? videoUrl : "dQw4w9WgXcQ";
    }

    function setVideoIframeSrc(elementId, videoUrl, controls = 0) {
      const videoId = getYouTubeVideoId(videoUrl);
      const el = document.getElementById(elementId);
      if (el) {
        el.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=${controls}&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
      }
    }

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

    // HERO
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

    // SECTION 2 - MOBILE
    const s2Mobile1 = formatTextForDisplay(data.section2.mobile_2_1.title);
    safeSetText("snap2-1-title-mobile", s2Mobile1.title);
    safeSetText("snap2-1-content-mobile", s2Mobile1.content);
    safeSetBackground("snap2-1-bg-mobile", data.section2.mobile_2_1.image);
    safeSetBackground("snap2-2-bg-mobile", data.section2.mobile_2_2.image);

    // SECTION 3 - DESKTOP
    const s3Left = formatTextForDisplay(data.section3.left_content.title);
    safeSetText("snap3-left-title", s3Left.title);
    safeSetText("snap3-left-content", s3Left.content);
    safeSetBackground("snap3-left-bg", data.section3.left_content.image);
    safeSetBackground("snap3-right-bg", data.section3.right_content.image);

    // SECTION 3 - MOBILE
    const s3Mobile1 = formatTextForDisplay(data.section3.mobile_3_1.title);
    safeSetText("snap3-1-title-mobile", s3Mobile1.title);
    safeSetText("snap3-1-content-mobile", s3Mobile1.content);
    safeSetBackground("snap3-1-bg-mobile", data.section3.mobile_3_1.image);
    safeSetBackground("snap3-2-bg-mobile", data.section3.mobile_3_2.image);

    // SECTION 4 - DESKTOP
    const s4Left = formatTextForDisplay(data.contactInfo.left_content.title);
    safeSetText("snap4-left-title", s4Left.title);
    safeSetText("snap4-left-content", s4Left.content);
    safeSetBackground("snap4-left-bg", data.contactInfo.left_content.image);
    safeSetBackground("snap4-right-bg", data.contactInfo.right_content.image);

    // SECTION 4 - MOBILE
    const s4Mobile1 = formatTextForDisplay(data.contactInfo.mobile_4_1.title);
    safeSetText("snap4-1-title-mobile", s4Mobile1.title);
    safeSetText("snap4-1-content-mobile", s4Mobile1.content);
    safeSetBackground("snap4-1-bg-mobile", data.contactInfo.mobile_4_1.image);
    safeSetBackground("snap4-2-bg-mobile", data.contactInfo.mobile_4_2.image);

    // Contact Info
    safeSetText("contact-info-phone", data.contactInfo.phone);
    safeSetHref("whatsapp-link", `https://wa.me/${data.contactInfo.phone.replace(/\s/g, '').replace('+', '')}`);
    safeSetHref("contact-info-email", `mailto:${data.contactInfo.email}`);
    safeSetText("contact-info-email", data.contactInfo.email);
    safeSetHref("social-youtube", data.contactInfo.social.youtube);
    safeSetHref("social-instagram", data.contactInfo.social.instagram);
    safeSetHref("social-tiktok", data.contactInfo.social.tiktok);

    // Thumbnails
    setThumbnailSrc("video-vp-thumbnail", data.section2.right_content.video);
    setThumbnailSrc("video-vp-thumbnail-mobile", data.section2.mobile_2_2.video);

    // Modal video play
    const modal = document.getElementById("videoModal");
    const modalIframe = document.getElementById("modal-video-iframe");
    const closeModal = () => {
      modalIframe.src = "";
      modal.style.display = "none";
    };

    const openModalWithVideo = (videoUrl) => {
      const videoId = getYouTubeVideoId(videoUrl);
      modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
      modal.style.display = "flex";
    };

    document.getElementById("play-video-vp")?.addEventListener("click", () => {
      openModalWithVideo(data.section2.right_content.video);
    });
    document.getElementById("play-video-vp-mobile")?.addEventListener("click", () => {
      openModalWithVideo(data.section2.mobile_2_2.video);
    });
    document.querySelector(".close-button")?.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

  })
  .catch(error => console.error("Error fetching content.json:", error));


// Hamburger menu
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('main-nav');

if (menuIcon && nav) {
  menuIcon.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuIcon.classList.toggle('active');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        nav.classList.remove('active');
        menuIcon.classList.remove('active');
      }
    });
  });
}
