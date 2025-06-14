fetch("content.json")
  .then(res => res.json())
  .then(data => {
    // Snap-scroll 1 (Hero)
    document.getElementById("hero-title").innerText = data.hero.title;
    // Subtitlul este acum gol, titlul conține tot textul.
    // Dacă ai un text separat pentru mobil, va trebui să îl populezi aici condiționat.
    // Deocamdată, doar textul din "title" va fi afișat în h1.
    document.getElementById("hero-subtitle").innerText = ""; // Empty on purpose based on new content structure

    // Set YouTube video src with parameters. Note: controls=0 might not always hide branding.
    // Replace 'uWwV01-X7zY' with the actual video ID from your YouTube URL.
    // If the video itself has issues or copyright, it might not play.
    const youtubeVideoId = "uWwV01-X7zY"; // <--- !!! Replace with your actual YouTube video ID !!!
    document.getElementById("hero-video").src = `https://www.youtube.com/embed/evY2dgvNdLU6?controls=0&autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&showinfo=0&iv_load_policy=3&modestbranding=1`;


    // Snap-scroll 2
    document.getElementById("section2-title").innerText = data.section2.title;
    // Eliminăm section2-text deoarece totul e în titlu
    // document.getElementById("section2-text").innerHTML = data.section2.text.replace(/\n/g, '<br>');
    document.getElementById("section2-image").src = data.section2.image;
    document.getElementById("section2-link").href = data.section2.link;

    // Snap-scroll 3 (Contact Form)
    document.getElementById("contact-form-heading").innerText = data.contactForm.heading;
    // Populează subtitlul doar pentru desktop
    if (window.innerWidth > 768) {
      document.getElementById("contact-form-subtitle-desktop").innerHTML = data.contactForm.subtitle_desktop.replace(/\n/g, '<br>');
    } else {
      document.getElementById("contact-form-subtitle-desktop").style.display = 'none'; // Ascunde pe mobil
    }

    // Snap-scroll 4 (Contact Info & Social)
    // Populează titlul specific pentru desktop
    if (window.innerWidth > 768) {
      document.getElementById("contact-info-title").innerHTML = data.contactInfo.title_desktop.replace(/\n/g, '<br>');
      document.getElementById("contact-info-text-mobile").style.display = 'none'; // Ascunde textul mobil pe desktop
    } else { // Pe mobil
      document.getElementById("contact-info-title").style.display = 'none'; // Ascunde titlul desktop pe mobil
      document.getElementById("contact-info-text-mobile").innerHTML = data.contactInfo.title_mobile; // Textul pentru mobil
    }

    document.getElementById("contact-info-phone").innerText = data.contactInfo.phone;
    document.getElementById("contact-info-email").innerText = data.contactInfo.email;
    document.getElementById("social-youtube").href = data.contactInfo.social.youtube;
    document.getElementById("social-instagram").href = data.contactInfo.social.instagram;
    document.getElementById("social-tiktok").href = data.contactInfo.social.tiktok;
  })
  .catch(error => console.error('Error fetching content.json:', error));

// Logică pentru meniul hamburger
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('main-nav');

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
