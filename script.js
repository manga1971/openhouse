fetch("content.json")
  .then(res => res.json())
  .then(data => {
    document.getElementById("hero-title").innerText = data.hero.title;
    document.getElementById("hero-subtitle").innerText = data.hero.subtitle;
    document.getElementById("hero-video").src = data.hero.videoBackground;

    document.getElementById("section2-title").innerText = data.section2.title;
    // MODIFICARE AICI: folosim innerHTML pentru a interpreta rândurile noi și simbolul 🟡
    document.getElementById("section2-text").innerHTML = data.section2.text.replace(/\n/g, '<br>');
    document.getElementById("section2-image").src = data.section2.image;
    document.getElementById("section2-link").href = data.section2.link;

    document.getElementById("contact-heading").innerText = data.contact.heading; // Am adăugat și contact-heading aici
    document.getElementById("contact-email").innerText = data.contact.email;
    document.getElementById("contact-phone").innerText = data.contact.phone;
    document.getElementById("social-youtube").href = data.contact.social.youtube;
    document.getElementById("social-instagram").href = data.contact.social.instagram;
    document.getElementById("social-tiktok").href = data.contact.social.tiktok;
  })
  .catch(error => console.error('Error fetching content.json:', error)); // Adăugat catch pentru erori