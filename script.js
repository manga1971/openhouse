fetch("content.json")
  .then(res => res.json())
  .then(data => {
    // Snap-scroll 1 (Hero)
    document.getElementById("hero-title").innerText = data.hero.title;
    // Păstrăm HTML pentru că subtitlul poate avea nevoie de <br> pe desktop
    document.getElementById("hero-subtitle").innerHTML = data.hero.subtitle.replace(/\n/g, '<br>');
    document.getElementById("hero-video").src = data.hero.videoBackground;

    // Snap-scroll 2
    document.getElementById("section2-title").innerText = data.section2.title;
    document.getElementById("section2-text").innerHTML = data.section2.text.replace(/\n/g, '<br>');
    document.getElementById("section2-image").src = data.section2.image;
    document.getElementById("section2-link").href = data.section2.link;

    // Snap-scroll 3 (Contact Form)
    document.getElementById("contact-form-heading").innerText = data.contactForm.heading;
    // Pe mobil, subtitlul din contactForm va fi ascuns, pe desktop va fi afisat
    if (window.innerWidth > 768) { // Doar pe desktop
        document.getElementById("contact-form-subtitle").innerHTML = data.contactForm.subtitle.replace(/\n/g, '<br>');
    } else { // Pe mobil ascundem acest subtitlu (conform cererii)
        document.getElementById("contact-form-subtitle").style.display = 'none';
    }


    // Snap-scroll 4 (Contact Info & Social)
    document.getElementById("contact-info-title").innerText = data.contactInfo.title; // Noul titlu pentru s4
    document.getElementById("contact-info-text").innerHTML = data.contactInfo.text.replace(/\n/g, '<br>'); // Folosim br pentru rânduri noi
    document.getElementById("contact-info-phone").innerText = data.contactInfo.phone;
    document.getElementById("contact-info-email").innerText = data.contactInfo.email;
    document.getElementById("social-youtube").href = data.contactInfo.social.youtube;
    document.getElementById("social-instagram").href = data.contactInfo.social.instagram;
    document.getElementById("social-tiktok").href = data.contactInfo.social.tiktok;
  })
  .catch(error => console.error('Error fetching content.json:', error));
