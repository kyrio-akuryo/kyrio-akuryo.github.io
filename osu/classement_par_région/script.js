// Liste identique à votre Python (pour le menu)
const REGIONS = [
    "Hauts-de-France", "Normandie", "Île-de-France", "Grand-Est", "Bretagne",
    "Pays de La Loire", "Centre-Val de Loire", "Bourgogne-Franche-Comté",
    "Nouvelle-Aquitaine", "Auvergne-Rhône-Alpes", "Occitanie",
    "Provence-Alpes-Côte d'Azur", "Corse", "Mayotte", "Guadeloupe",
    "Guyane", "Martinique", "La Réunion"
];

// Variables d'état
let currentData = [];
let currentSort = { column: 'global_rank', direction: 'asc' }; // Par défaut : Rang Global croissant (1er est mieux)

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('region-select');

    // Remplir le menu déroulant
    REGIONS.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        selector.appendChild(option);
    });

    // Écouteur de changement de région
    selector.addEventListener('change', (e) => {
        loadRegion(e.target.value);
    });
});

function showHome() {
    document.getElementById('home-section').classList.remove('hidden');
    document.getElementById('ranking-section').classList.add('hidden');
    document.getElementById('region-select').value = ""; // Reset select
}

async function loadRegion(regionName) {
    // Construction du nom de fichier (doit correspondre à la logique "safe_filename" du Python)
    // Ici on assume que le Python a géré les noms proprement.
    // Pour simplifier, assurez-vous que les noms de fichiers JSON correspondent aux noms dans REGIONS.
    // Si votre Python remplace les espaces par des tirets, adaptez ici :
    // const fileName = regionName.replace(/ /g, '-') + ".json"; 

    // Si votre Python garde les espaces ou gère les accents, encodeURIComponent est plus sûr pour l'URL
    // Mais attention, cela dépend EXACTEMENT de comment le fichier est nommé sur le disque.
    // Si le fichier s'appelle "Île-de-France.json", le chemin doit être exact.

    // Méthode simple : on tente de charger le fichier avec le nom brut
    // (Les navigateurs modernes gèrent bien les espaces/accents en local/web)
    const filePath = `exports_regions/${regionName}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error("Fichier introuvable");

        const data = await response.json();
        currentData = data;

        // Affichage
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('ranking-section').classList.remove('hidden');
        document.getElementById('current-region-title').textContent = `Classement : ${regionName}`;

        // Tri par défaut et rendu
        sortTable('global_rank');

    } catch (error) {
        alert("Impossible de charger les données pour cette région. Vérifiez que le fichier JSON existe bien dans le dossier exports_regions.");
        console.error(error);
    }
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = ''; // Vider le tableau

    currentData.forEach(player => {
        const tr = document.createElement('tr');

        // Calcul pour l'affichage (gestion des nulls)
        const rank = player.global_rank ? `#${player.global_rank.toLocaleString()}` : 'Non classé';
        const pp = player.pp ? Math.round(player.pp).toLocaleString() : 0;
        const acc = player.hit_accuracy ? player.hit_accuracy.toFixed(2) + '%' : '0%';
        const playcount = player.play_count ? player.play_count.toLocaleString() : 0;
        const level = player.level ? player.level : 0;

        tr.innerHTML = `
            <td><span class="rank-pill">${rank}</span></td>
            <td>
                <div class="player-info">
                    <img src="${player.avatar_url}" alt="Avatar" class="avatar" loading="lazy">
                    <a href="https://osu.ppy.sh/users/${player.id}" target="_blank" style="color:white;text-decoration:none;font-weight:bold;">
                        ${player.username}
                    </a>
                </div>
            </td>
            <td>${pp} pp</td>
            <td>${acc}</td>
            <td>${playcount}</td>
            <td>Lvl ${level}</td>
        `;
        tbody.appendChild(tr);
    });
}

function sortTable(column) {
    // Inversion de la direction si on clique sur la même colonne
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // Logique par défaut quand on clique sur une nouvelle colonne :
        // Pour le Rang Global : Ascendant (1 est mieux que 100)
        // Pour le reste (PP, Score, etc) : Descendant (Plus gros est mieux)
        if (column === 'global_rank') {
            currentSort.direction = 'asc';
        } else {
            currentSort.direction = 'desc';
        }
        currentSort.column = column;
    }

    // Tri des données
    currentData.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        // Gestion des valeurs nulles (les mettre à la fin)
        if (valA == null) return 1;
        if (valB == null) return -1;

        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable();
}