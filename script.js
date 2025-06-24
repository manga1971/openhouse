// script.js - versiune completă și optimizată

fetch("content.json")
  .then(res => res.json())
  .then(data => {

    // Funcții utilitare existente (nemodificate)
    function getYouTubeVideoId(videoUrl) {
      if (!videoUrl) return "dQw4w9WgXcQ"; // Fallback YouTube ID
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

    // --- Funcția Principală de Popula Conținutul (NOUĂ SAU MODIFICATĂ) ---
    function populateAllContent() {
      // Definește breakpoint-ul pentru mobil (trebuie să corespundă cu CSS-ul tău)
      const isMobile = window.innerWidth <= 767; 

      // HERO SECTION (Aceasta se comportă la fel pentru ambele versiuni, gestionată prin CSS)
      const heroText = formatTextForDisplay(data.hero.title);
      safeSetText("hero-title", heroText.title);
      safeSetText("hero-content", heroText.content);
      // setVideoIframeSrc("hero-video", data.hero.videoBackground, 0); // Video pentru desktop
      // Considerăm că hero-mobile-video este gestionat în principal prin CSS display: none/block

      // LOGICĂ CONDITIONALĂ PENTRU SECȚIUNI (Desktop vs Mobile)
      // SECTION 2
      if (isMobile) {
        // SECTION 2 - MOBILE (2.1 și 2.2)
        const s2Mobile1 = formatTextForDisplay(data.section2.mobile_2_1.title);
        safeSetText("snap2-1-title-mobile", s2Mobile1.title);
        safeSetText("snap2-1-content-mobile", s2Mobile1.content);
        safeSetBackground("snap2-1-bg-mobile", data.section2.mobile_2_1.image);
        safeSetHref("snap2-1-link-mobile", data.section2.left_content.link); // Link din JSON pentru mobil 2.1

        safeSetBackground("snap2-2-bg-mobile", data.section2.mobile_2_2.image);
        setThumbnailSrc("video-vp-thumbnail-mobile", data.section2.mobile_2_2.video);
      } else {
        // SECTION 2 - DESKTOP
        const s2Left = formatTextForDisplay(data.section2.left_content.title);
        safeSetText("snap2-left-title", s2Left.title);
        safeSetText("snap2-left-content", s2Left.content);
        safeSetHref("snap2-left-link", data.section2.left_content.link);
        safeSetBackground("snap2-left-bg", data.section2.left_content.image);
        safeSetBackground("snap2-right-bg", data.section2.right_content.image);
        setThumbnailSrc("video-vp-thumbnail", data.section2.right_content.video);
      }

      // SECTION 3
      if (isMobile) {
        // SECTION 3 - MOBILE (3.1 - background/text)
        // Folosim conținutul din 'left_content' din JSON pentru prima parte a paginii 3 mobile
        const s3Mobile1 = formatTextForDisplay(data.section3.left_content.title);
        safeSetText("snap3-1-title-mobile", s3Mobile1.title);
        safeSetText("snap3-1-content-mobile", s3Mobile1.content);
        safeSetBackground("snap3-1-bg-mobile", data.section3.left_content.image);

        // SECTION 3 - MOBILE (3.2 - formular)
        // Setăm background-ul pentru secțiunea formularului de mobil, dacă este necesar
        safeSetBackground("snap3-2-form-mobile", data.section3.right_content.image);
        // Câmpurile formularului sunt statice în HTML, deci nu necesită populare JS aici
      } else {
        // SECTION 3 - DESKTOP
        const s3Left = formatTextForDisplay(data.section3.left_content.title);
        safeSetText("snap3-left-title", s3Left.title);
        safeSetText("snap3-left-content", s3Left.content);
        safeSetBackground("snap3-left-bg", data.section3.left_content.image);
        safeSetBackground("snap3-right-bg", data.section3.right_content.image);
      }

      // SECTION 4
      if (isMobile) {
        // SECTION 4 - MOBILE (4.1 - background/text)
        // Folosim conținutul din 'left_content' din JSON pentru prima parte a paginii 4 mobile
        const s4Mobile1 = formatTextForDisplay(data.contactInfo.left_content.title);
        safeSetText("snap4-1-title-mobile", s4Mobile1.title);
        safeSetText("snap4-1-content-mobile", s4Mobile1.content);
        safeSetBackground("snap4-1-bg-mobile", data.contactInfo.left_content.image);

        // SECTION 4 - MOBILE (4.2 - informații contact & social media)
        safeSetBackground("snap4-2-info-mobile", data.contactInfo.right_content.image);

        // Populează informațiile de contact pentru mobile (NOI ID-uri)
        safeSetText("contact-info-phone-mobile", data.contactInfo.phone);
        safeSetHref("whatsapp-link-mobile", `https://wa.me/${data.contactInfo.phone.replace(/\s/g, '').replace('+', '')}`);
        safeSetHref("contact-info-email-mobile", `mailto:${data.contactInfo.email}`);
        const contactEmailElementMobile = document.getElementById("contact-info-email-mobile");
        if (contactEmailElementMobile) {
            contactEmailElementMobile.innerText = data.contactInfo.email;
        }

        // Populează linkurile social media pentru mobile (NOI ID-uri)
        safeSetHref("social-youtube-mobile", data.contactInfo.social.youtube);
        safeSetHref("social-instagram-mobile", data.contactInfo.social.instagram);
        safeSetHref("social-tiktok-mobile", data.contactInfo.social.tiktok);
        // Verifică dacă ai un ID "social-linkedin-mobile" în HTML pentru acest link
        // if (document.getElementById("social-linkedin-mobile")) {
        //   safeSetHref("social-linkedin-mobile", data.contactInfo.social["linkedin.com"]);
        // }
      } else {
        // SECTION 4 - DESKTOP
        const s4Left = formatTextForDisplay(data.contactInfo.left_content.title);
        safeSetText("snap4-left-title", s4Left.title);
        safeSetText("snap4-left-content", s4Left.content);
        safeSetBackground("snap4-left-bg", data.contactInfo.left_content.image);
        safeSetBackground("snap4-right-bg", data.contactInfo.right_content.image);

        // Populează informațiile de contact pentru desktop (ID-uri existente)
        safeSetText("contact-info-phone", data.contactInfo.phone);
        safeSetHref("whatsapp-link", `https://wa.me/${data.contactInfo.phone.replace(/\s/g, '').replace('+', '')}`);
        safeSetHref("contact-info-email", `mailto:${data.contactInfo.email}`);
        const contactEmailElement = document.getElementById("contact-info-email");
        if (contactEmailElement) {
            contactEmailElement.innerText = data.contactInfo.email;
        }
        
        // Populează linkurile social media pentru desktop (ID-uri existente)
        safeSetHref("social-youtube", data.contactInfo.social.youtube);
        safeSetHref("social-instagram", data.contactInfo.social.instagram);
        safeSetHref("social-tiktok", data.contactInfo.social.tiktok);
        // Link-ul LinkedIn are href hardcodat în HTML, dar dacă vrei să-l populezi din JS:
        // if (document.getElementById("social-linkedin")) {
        //   safeSetHref("social-linkedin", data.contactInfo.social["linkedin.com"]);
        // }
      }
    } // END populateAllContent()

    // --- Inițializare și Evenimente ---

    // Apelează populateAllContent la încărcarea inițială a paginii
    populateAllContent();

    // Apelează populateAllContent la redimensionarea ferestrei (cu debounce pentru performanță)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(populateAllContent, 200); // Rulează după 200ms de la ultima redimensionare
    });


    // --- Funcționalitatea pentru Modal Video (existente, adaptate la logica nouă) ---
    // Această parte ar trebui să funcționeze corect cu ID-urile modificate, deoarece `setThumbnailSrc`
    // și `openModalWithVideo` sunt apelate condiționat în `populateAllContent` pentru a ținti ID-urile corecte.

    const modal = document.getElementById("videoModal");
    const modalIframe = document.getElementById("modal-video-iframe");
    const closeModal = () => {
      modalIframe.src = ""; // Oprește redarea video
      modal.style.display = "none";
    };

    const openModalWithVideo = (videoUrl) => {
      const videoId = getYouTubeVideoId(videoUrl);
      // Corecție URL: youtube.com/embed
      modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
      modal.style.display = "flex"; // Folosim flex pentru a centra modalul
    };

    // Evenimente de click pentru butoanele de play video
    // Folosim `?.` (optional chaining) pentru a evita erori dacă elementul nu există (e.g., pe versiunea desktop când se rulează codul pentru mobil și invers)
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

  }) // End .then(data => { ... })
  .catch(error => console.error("Error fetching content.json:", error));


// --- Funcționalitatea Meniului Hamburger (rămâne în afara fetch-ului, deoarece nu depinde de data din JSON) ---
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('main-nav');

if (menuIcon && nav) {
  menuIcon.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuIcon.classList.toggle('active');
  });

  // Închide meniul când se dă click pe un link de navigare (mai ales pe mobil)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      // Verifică dacă lățimea ecranului este de mobil (ajustează breakpoint-ul dacă e nevoie)
      if (window.innerWidth <= 768) { 
        nav.classList.remove('active');
        menuIcon.classList.remove('active');
      }
    });
  });
}
