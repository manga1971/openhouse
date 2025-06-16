fetch("content.json")
  .then(res => res.json())
  .then(data => {
    // Helper function to set YouTube video source
    function setVideoSrc(elementId, videoUrl) {
      let videoId = '';
      if (videoUrl.includes('v=')) {
        videoId = videoUrl.split('v=')[1].split('&')[0];
      } else if (videoUrl.includes('youtube.com/embed/')) {
        videoId = videoUrl.split('embed/')[1].split('?')[0];
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else {
        videoId = videoUrl; // Assume it's just the ID
      }

      // Basic validation for YouTube ID format (usually 11 characters)
      if (!videoId || videoId.length !== 11) {
        videoId = "dQw4w9WgXcQ"; // Rick Astley - default placeholder
        console.error(`Could not extract a valid YouTube video ID from ${videoUrl} for ${elementId}. Using a placeholder video. Please check 'videoBackground' in content.json.`);
      }
      document.getElementById(elementId).src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
    }

    // Function to apply bold to the first line of text
    function formatTextWithBoldFirstLine(text) {
        const lines = text.split('\n');
        if (lines.length > 0) {
            return `<span class="bold">${lines[0]}</span><br>${lines.slice(1).join('<br>')}`;
        }
        return text;
    }

    // Snap-scroll 1 (Hero)
    document.getElementById("hero-title").innerHTML = formatTextWithBoldFirstLine(data.hero.title);
    setVideoSrc("hero-video", data.hero.videoBackground);

    // Snap-scroll 2
    document.getElementById("section2-title").innerHTML = formatTextWithBoldFirstLine(data.section2.title);
    document.getElementById("section2-link").href = data.section2.link;
    setVideoSrc("section2-video", data.section2.videoBackground); // Verificare video

    // Snap-scroll 3 (Contact Form)
    document.getElementById("section3-title").innerHTML = formatTextWithBoldFirstLine(data.section3.title);
    // Set background image for left side of contact form
    const section3BgLeft = document.getElementById("section3-bg-left");
    if (section3BgLeft) {
      section3BgLeft.style.backgroundImage = `url(${data.section3.imageBackgroundLeft})`;
    }


    // Snap-scroll 4 (Contact Info)
    function updateContactInfoDisplay() {
      const desktopTitle = document.getElementById("contact-info-title-desktop");
      const mobileTitle = document.getElementById("contact-info-title-mobile");
      const bgLeft = document.getElementById("section4-bg-left");
      const bgRight = document.getElementById("section4-bg-right");

      if (window.innerWidth > 768) { // Desktop
        desktopTitle.innerHTML = formatTextWithBoldFirstLine(data.contactInfo.title_desktop);
        desktopTitle.style.display = 'block';
        mobileTitle.style.display = 'none';
        bgLeft.style.backgroundImage = `url(${data.contactInfo.image_left})`;
        bgRight.style.backgroundImage = `url(${data.contactInfo.image_right})`;
        bgLeft.style.display = 'block';
        bgRight.style.display = 'block';
      } else { // Mobile
        mobileTitle.innerHTML = formatTextWithBoldFirstLine(data.contactInfo.title_mobile);
        mobileTitle.style.display = 'block';
        desktopTitle.style.display = 'none';
        bgLeft.style.display = 'none';
        bgRight.style.backgroundImage = `url(${data.contactInfo.image_right})`; // Only right image for mobile
        bgRight.style.display = 'block';
      }
    }

    updateContactInfoDisplay(); // Call on load
    window.addEventListener('resize', updateContactInfoDisplay); // Call on resize

    document.getElementById("contact-info-phone").innerText = data.contactInfo.phone;
    document.getElementById("whatsapp-link").href = `https://wa.me/${data.contactInfo.phone.replace(/\s/g, '').replace('+', '')}`;
    document.getElementById("contact-info-email").innerText = data.contactInfo.email;
    
    // Set hrefs for social media links
    document.getElementById("social-youtube").href = data.contactInfo.social.youtube;
    document.getElementById("social-instagram").href = data.contactInfo.social.instagram;
    document.getElementById("social-tiktok").href = data.contactInfo.social.tiktok;

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
