fetch("content.json")
  .then(res => res.json())
  .then(data => {
    // Snap-scroll 1 (Hero)
    document.getElementById("hero-title").innerText = data.hero.title;
    document.getElementById("hero-subtitle").innerText = data.hero.subtitle;

    // Set YouTube video src with parameters for autoplay, loop, mute, no controls
    const rawVideoUrl = data.hero.videoBackground;
    let videoId = '';

    // Attempt to extract video ID from various YouTube URL formats
    if (rawVideoUrl.includes('v=')) {
        videoId = rawVideoUrl.split('v=')[1].split('&')[0];
    } else if (rawVideoUrl.includes('youtu.be/')) {
        videoId = rawVideoUrl.split('youtu.be/')[1].split('?')[0];
    } else if (rawVideoUrl.includes('embed/')) {
        videoId = rawVideoUrl.split('embed/')[1].split('?')[0];
    } else {
        // Fallback: If it's just the ID or an unexpected format, try to use it directly
        // This is a weak point, encourage using embed URL or pure ID in content.json
        videoId = rawVideoUrl.split('/').pop().split('?')[0];
    }

    // Basic check for video ID validity and set a placeholder if invalid
    if (!videoId || videoId.length < 5) {
        videoId = "dQw4w9WgXcQ"; // Rick Astley - default placeholder
        console.error("Could not extract a valid YouTube video ID from content.json for hero.videoBackground. Using a placeholder video. Please update 'hero.videoBackground' in content.json with a proper YouTube embed URL or video ID.");
    }

    // Construct the embed URL with necessary parameters
    document.getElementById("hero-video").src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;


    // Snap-scroll 2
    document.getElementById("section2-title").innerText = data.section2.title;
    document.getElementById("section2-text").innerText = data.section2.text;
    document.getElementById("section2-image").src = data.section2.image;
    document.getElementById("section2-link").href = data.section2.link;

    // Snap-scroll 3 (Contact Form)
    document.getElementById("contact-form-heading").innerText = data.contactForm.heading;
    document.getElementById("contact-form-subtitle-desktop").innerHTML = data.contactForm.subtitle_desktop.replace(/\\n/g, '<br>');

    // Snap-scroll 4 (Contact Info)
    // Conditional display for desktop/mobile titles based on screen width
    function updateContactInfoTitle() {
      if (window.innerWidth > 768) { // Desktop
        document.getElementById("contact-info-title").innerHTML = data.contactInfo.title_desktop.replace(/\\n/g, '<br>');
        document.getElementById("contact-info-text-mobile").style.display = 'none'; // Hide mobile text on desktop
        document.getElementById("contact-info-title").style.display = 'block';
      } else { // Mobile
        document.getElementById("contact-info-title").style.display = 'none'; // Hide desktop title on mobile
        document.getElementById("contact-info-text-mobile").innerHTML = data.contactInfo.title_mobile; // Text for mobile
        document.getElementById("contact-info-text-mobile").style.display = 'block';
      }
    }

    updateContactInfoTitle(); // Call on load
    window.addEventListener('resize', updateContactInfoTitle); // Call on resize

    document.getElementById("contact-info-phone").innerText = data.contactInfo.phone;
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

if (menuIcon && nav) { // Asigură-te că elementele există
    menuIcon.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuIcon.classList.toggle('active');
    });

    // Închide meniul când se dă click pe un link (doar pe mobil)
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                nav.classList.remove('active');
                menuIcon.classList.remove('active');
            }
        });
    });
}
