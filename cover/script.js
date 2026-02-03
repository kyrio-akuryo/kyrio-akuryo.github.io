function generateCard() {
    const canvas = document.getElementById('cardCanvas');
    const ctx = canvas.getContext('2d');
    const params = new URLSearchParams(window.location.search);

    // 1. Récupération des paramètres (ou valeurs par défaut)
    const pseudo = params.get('pseudo') || "Utilisateur";
    const color = params.get('color') || "#6366f1";
    const avatarUrl = params.get('avatar') || "https://ui-avatars.com/api/?name=" + pseudo;

    // 2. Fond de la carte
    ctx.fillStyle = "#2d2d2d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Barre de couleur latérale
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 15, canvas.height);

    // 4. Texte (Pseudo)
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Segoe UI";
    ctx.fillText(pseudo, 200, 140);

    ctx.font = "18px Segoe UI";
    ctx.fillStyle = "#aaa";
    ctx.fillText("Généré via GitHub Pages", 200, 175);

    // 5. Dessiner l'avatar (Image)
    const img = new Image();
    img.crossOrigin = "anonymous"; // Important pour pouvoir télécharger l'image après
    img.src = avatarUrl;
    img.onload = function () {
        // Dessin de l'image en cercle
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 150, 60, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 40, 90, 120, 120);
        ctx.restore();

        // Préparer le bouton de téléchargement
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.href = canvas.toDataURL("image/png");
        downloadBtn.download = `carte-${pseudo}.png`;
    };
}

window.onload = generateCard;