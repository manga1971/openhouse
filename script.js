fetch("content.json")
  .then(res => res.json())
  .then(data => {
    // Helper function to set video source
    function setVideoSrc(elementId, videoUrl) {
        let videoId = '';
        if (videoUrl.includes('v=')) {
            videoId = videoUrl.split('v=')[1].split('&')[0];
        } else if (videoUrl.includes('youtube.com/embed/')) {
            videoId = videoUrl.split('embed/')[1].split('?')[0];
        } else {
            videoId = videoUrl.split('/').pop().split('?')[0];
        }

        if (!videoId || videoId.length < 5) {
            videoId = "dQw4w9WgXcQ"; // Rick Astley - default placeholder
            console.error(`Could not extract a valid YouTube video ID from ${videoUrl}. Using a placeholder video. Please update 'videoBackground' in content.json.`);
        }
        document.getElementById(elementId).src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
    }

    // Snap-scroll 1 (Hero)
    document.getElementById("hero-title").innerHTML = data.hero.title.replace(/(\r\n|\n|\r)/gm, '<br>').replace(/^(.*?)(<br>|$)/, '<span class="bold">$1</span>$2');
    setVideoSrc("hero-video", data.hero.videoBackground);

    // Snap-scroll 2
    document.getElementById("section2-title").innerHTML = data.section2.title.replace(/(\r\n|\n|\r)/gm, '<br>').replace(/^(.*?)(<br>|$)/, '<span class="bold">$1</span>$2');
    document.getElementById("section2-link").href = data.section2.link;
    setVideoSrc("section2-video", data.section2.videoBackground);


    // Snap-scroll 3 (Contact Form)
    document.getElementById("section3-title").innerHTML = data.section3.title.replace(/(\r\n|\n|\r)/gm, '<br>').replace(/^(.*?)(<br>|$)/, '<span class="bold">$1</span>$2');

    // Snap-scroll 4 (Contact Info)
    function updateContactInfoDisplay() {
      const desktopTitle = document.getElementById("contact-info-title-desktop");
      const mobileTitle = document.getElementById("contact-info-title-mobile");
      const bgLeft = document.getElementById("section4-bg-left");
      const bgRight = document.getElementById("section4-bg-right");

      if (window.innerWidth > 768) { // Desktop
        desktopTitle.innerHTML = data.contactInfo.title_desktop.replace(/(\r\n|\n|\r)/gm, '<br>').replace(/^(.*?)(<br>|$)/, '<span class="bold">$1</span>$2');
        desktopTitle.style.display = 'block';
        mobileTitle.style.display = 'none';
        bgLeft.style.backgroundImage = `url(${data.contactInfo.image_left})`;
        bgRight.style.backgroundImage = `url(${data.contactInfo.image_right})`;
        bgLeft.style.display = 'block';
        bgRight.style.display = 'block';
      } else { // Mobile
        mobileTitle.innerHTML = data.contactInfo.title_mobile.replace(/(\r\n|\n|\r)/gm, '<br>').replace(/^(.*?)(<br>|$)/, '<span class="bold">$1</span>$2');
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
    document.getElementById("whatsapp-link").href = `https://wa.me/${data.contactInfo.phone.replace(/\s/g, '').replace('+', '')}`; // Link WhatsApp
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
