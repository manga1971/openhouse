fetch("content.json")
  .then(res => res.json())
  .then(data => {
    // Helper function to extract YouTube video ID
    function getYouTubeVideoId(videoUrl) {
      let videoId = '';
      if (videoUrl.includes('v=')) {
        videoId = videoUrl.split('v=')[1].split('&')[0];
      } else if (videoUrl.includes('embed/')) {
        videoId = videoUrl.split('embed/')[1].split('?')[0];
      } else {
        videoId = videoUrl; // Assume it's just the ID
      }
      return (videoId && videoId.length === 11) ? videoId : "dQw4w9WgXcQ"; // Default to Rick Astley if invalid
    }

    // Helper function to set YouTube video source for iframe
function setVideoIframeSrc(elementId, videoUrl, controls = 0) {
    const videoId = getYouTubeVideoId(videoUrl);
    // CORECTAT: URL-ul pentru YouTube
   document.getElementById(elementId).src = `https://www.youtube.com/embed/<span class="math-inline">\{videoId\}?autoplay\=1&loop\=1&mute\=1&controls\=</span>{controls}&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
}

// Handle thumbnail loading
function setThumbnailSrc(imgElementId, videoUrl) {
    const videoId = getYouTubeVideoId(videoUrl);
    // CORECTAT: URL-ul pentru thumbnail
    document.getElementById(imgElementId).src = `https://img.youtube.com/vi/{videoId}/hqdefault.jpg`;
}

    // Function to separate text into title and content spans/paragraphs
    function formatTextForDisplay(text) {
        const lines = text.split('\n');
        const title = lines[0];
        const content = lines.slice(1).join('\n');
        return { title: title, content: content };
    }

    // Snap-scroll 1 (Hero)
    const heroText = formatTextForDisplay(data.hero.title);
    document.getElementById("hero-title").innerText = heroText.title;
    document.getElementById("hero-content").innerText = heroText.content;
    setVideoIframeSrc("hero-video", data.hero.videoBackground, 0); // No controls for hero video

    // Snap-scroll 2 (Desktop & Mobile)
    const snap2LeftText = formatTextForDisplay(data.section2.left_content.title);
    document.getElementById("snap2-left-title").innerText = snap2LeftText.title; // desktop
    document.getElementById("snap2-left-content").innerText = snap2LeftText.content; // desktop
    document.getElementById("snap2-left-link").href = data.section2.left_content.link; // Set 'Poveste de succes' link to Despre noi

    const snap2Mobile1Text = formatTextForDisplay(data.section2.mobile_2_1.title);
    document.getElementById("snap2-1-title-mobile").innerText = snap2Mobile1Text.title; // mobile 2.1
    document.getElementById("snap2-1-content-mobile").innerText = snap2Mobile1Text.content; // mobile 2.1


    // Snap-scroll 3 (Desktop & Mobile)
    const snap3LeftText = formatTextForDisplay(data.section3.left_content.title);
    document.getElementById("snap3-left-title").innerText = snap3LeftText.title; // desktop
    document.getElementById("snap3-left-content").innerText = snap3LeftText.content; // desktop

    const snap3Mobile1Text = formatTextForDisplay(data.section3.mobile_3_1.title);
    document.getElementById("snap3-1-title-mobile").innerText = snap3Mobile1Text.title; // mobile 3.1
    document.getElementById("snap3-1-content-mobile").innerText = snap3Mobile1Text.content; // mobile 3.1

    // Snap-scroll 4 (Desktop & Mobile)
    const snap4LeftText = formatTextForDisplay(data.contactInfo.left_content.title);
    document.getElementById("snap4-left-title").innerText = snap4LeftText.title; // desktop
    document.getElementById("snap4-left-content").innerText = snap4LeftText.content; // desktop

    const snap4Mobile1Text = formatTextForDisplay(data.contactInfo.mobile_4_1.title);
    document.getElementById("snap4-1-title-mobile").innerText = snap4Mobile1Text.title; // mobile 4.1
    document.getElementById("snap4-1-content-mobile").innerText = snap4Mobile1Text.content; // mobile 4.1


    // Background Images
    document.getElementById("snap2-left-bg").style.backgroundImage = `url(${data.section2.left_content.image})`;
    document.getElementById("snap2-right-bg").style.backgroundImage = `url(${data.section2.right_content.image})`;
    document.getElementById("snap2-1-bg-mobile").style.backgroundImage = `url(${data.section2.mobile_2_1.image})`;
    document.getElementById("snap2-2-bg-mobile").style.backgroundImage = `url(${data.section2.mobile_2_2.image})`;

    document.getElementById("snap3-left-bg").style.backgroundImage = `url(${data.section3.left_content.image})`;
    document.getElementById("snap3-right-bg").style.backgroundImage = `url(${data.section3.right_content.image})`;
    document.getElementById("snap3-1-bg-mobile").style.backgroundImage = `url(${data.section3.mobile_3_1.image})`;
    document.getElementById("snap3-2-bg-mobile").style.backgroundImage = `url(${data.section3.mobile_3_2.image})`;

    document.getElementById("snap4-left-bg").style.backgroundImage = `url(${data.contactInfo.left_content.image})`;
    document.getElementById("snap4-right-bg").style.backgroundImage = `url(${data.contactInfo.right_content.image})`;
    

    // Contact Info (phone, email, social) - Desktop
    document.getElementById("contact-info-phone").innerText = data.contactInfo.phone;
    document.getElementById("whatsapp-link").href = `https://wa.me/${data.contactInfo.phone.replace(/\s/g, '').replace('+', '')}`;
    document.getElementById("contact-info-email").href = `mailto:${data.contactInfo.email}`; // Make email active link
    document.getElementById("contact-info-email").innerText = data.contactInfo.email;
    document.getElementById("social-youtube").href = data.contactInfo.social.youtube;
    document.getElementById("social-instagram").href = data.contactInfo.social.instagram;
    document.getElementById("social-tiktok").href = data.contactInfo.social.tiktok;

    


    // Video Modal Logic for "video VP"
    const videoModal = document.getElementById("videoModal");
    const modalVideoIframe = document.getElementById("modal-video-iframe");
    const closeButton = document.querySelector(".close-button");

    function openVideoModal(videoUrl) {
        const videoId = getYouTubeVideoId(videoUrl);
        // Using controls=1 as requested for modal video
        modalVideoIframe.src = `https://www.youtube.com/embed/{videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
        videoModal.style.display = "flex";
    }

    function closeVideoModal() {
        modalVideoIframe.src = ""; // Stop the video
        videoModal.style.display = "none";
    }

    // Attach click listeners to play buttons/thumbnails
    document.getElementById("play-video-vp").addEventListener("click", () => {
        openVideoModal(data.section2.right_content.video);
    });
    document.getElementById("play-video-vp-mobile").addEventListener("click", () => {
        openVideoModal(data.section2.mobile_2_2.video);
    });

    closeButton.addEventListener("click", closeVideoModal);

    window.addEventListener("click", (event) => {
        if (event.target == videoModal) {
            closeVideoModal();
        }
    });

    // Handle thumbnail loading
    function setThumbnailSrc(imgElementId, videoUrl) {
        const videoId = getYouTubeVideoId(videoUrl);
        document.getElementById(imgElementId).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    setThumbnailSrc("video-vp-thumbnail", data.section2.right_content.video);
    setThumbnailSrc("video-vp-thumbnail-mobile", data.section2.mobile_2_2.video);


  })
  .catch(error => console.error('Error fetching content.json:', error));


// Logică pentru meniul hamburger
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('main-nav');

if (menuIcon && nav) {
    menuIcon.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuIcon.classList.toggle('active');
    });

    // Close menu when a link is clicked (mobile only)
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                nav.classList.remove('active');
                menuIcon.classList.remove('active');
            }
        });
    });
}
