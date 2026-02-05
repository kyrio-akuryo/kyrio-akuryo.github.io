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
let currentSort = { column: 'global_rank', direction: 'asc' };
let searchTerm = ""; // <--- NOUVELLE VARIABLE

document.addEventListener('DOMContentLoaded', () => {
    // ... (Code existant pour le select de région) ...
    const selector = document.getElementById('region-select');
    REGIONS.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        selector.appendChild(option);
    });

    selector.addEventListener('change', (e) => {
        loadRegion(e.target.value);
    });

    // --- NOUVEAU : Écouteur pour la recherche ---
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase(); // On stocke en minuscule
        renderTable(); // On rafraîchit le tableau
    });
});

function showHome() {
    // ... (Code existant) ...
    document.getElementById('home-section').classList.remove('hidden');
    document.getElementById('ranking-section').classList.add('hidden');
    document.getElementById('region-select').value = "";

    // Reset de la recherche quand on revient à l'accueil
    document.getElementById('search-input').value = "";
    searchTerm = "";
}

async function loadRegion(regionName) {
    // Reset de la recherche
    searchTerm = "";
    document.getElementById('search-input').value = "";

    const filePath = `exports_regions/${regionName}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error("Fichier introuvable");

        let data = await response.json();

        // ---------------------------------------------------------
        // ETAPE CLE : Calcul du classement régional
        // ---------------------------------------------------------

        // 1. On trie d'abord par classement mondial (le plus petit est le meilleur)
        // Les joueurs sans rang (null) sont mis à la fin
        data.sort((a, b) => {
            let rankA = a.global_rank || 999999999;
            let rankB = b.global_rank || 999999999;
            return rankA - rankB;
        });

        // 2. On attribue le rang régional (1, 2, 3...) de façon fixe
        // Ainsi, même si on trie par "Précision" plus tard, le #1 restera le #1
        data.forEach((player, index) => {
            // Si le joueur n'a pas de rang global, on ne lui donne pas de rang régional (optionnel)
            if (player.global_rank) {
                player.local_rank = index + 1;
            } else {
                player.local_rank = "-";
            }
        });

        currentData = data;

        // Affichage
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('ranking-section').classList.remove('hidden');
        document.getElementById('current-region-title').textContent = `Classement : ${regionName}`;

        // On lance le rendu (le tri initial est déjà fait ci-dessus)
        renderTable();

    } catch (error) {
        alert("Impossible de charger les données...");
        console.error(error);
    }
}

// --- FONCTION MODIFIÉE : renderTable ---
function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    // Filtrage recherche
    const filteredData = currentData.filter(player => {
        if (!player.username) return false;
        return player.username.toLowerCase().includes(searchTerm);
    });

    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-result">Aucun joueur trouvé.</td></tr>';
        return;
    }

    filteredData.forEach(player => {
        const tr = document.createElement('tr');

        // UTILISATION DU RANG REGIONAL CALCULÉ
        // On affiche #1, #2... ou "-" si pas classé
        const regionRankDisplay = player.local_rank !== "-" ? `#${player.local_rank}` : "-";

        // On garde le rang global en info-bulle (title) ou petit texte si besoin
        // Ici je l'ajoute juste en "title" au survol de la pilule
        const globalRankTooltip = player.global_rank ? `Mondial: #${player.global_rank.toLocaleString()}` : "Non classé";

        const pp = player.pp ? Math.round(player.pp).toLocaleString() : 0;
        const acc = player.hit_accuracy ? player.hit_accuracy.toFixed(2) + '%' : '0%';
        const playcount = player.play_count ? player.play_count.toLocaleString() : 0;
        const level = player.level ? player.level : 0;

        tr.innerHTML = `
            <td>
                <span class="rank-pill" title="${globalRankTooltip}">${regionRankDisplay}</span>
            </td>
            <td>
                <div class="player-info">
                    <img src="${player.avatar_url}" alt="" class="avatar" loading="lazy">
                    <div style="display:flex; flex-direction:column;">
                        <a href="https://osu.ppy.sh/users/${player.id}" target="_blank" style="color:white;text-decoration:none;font-weight:bold;">
                            ${player.username}
                        </a>
                        <span style="font-size:0.8em; color:#888;">Mondial #${player.global_rank ? player.global_rank.toLocaleString() : "?"}</span>
                    </div>
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