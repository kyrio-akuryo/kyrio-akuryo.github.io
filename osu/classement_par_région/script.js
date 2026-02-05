const REGIONS = [
    "Hauts-de-France", "Normandie", "Île-de-France", "Grand-Est", "Bretagne",
    "Pays de La Loire", "Centre-Val de Loire", "Bourgogne-Franche-Comté",
    "Nouvelle-Aquitaine", "Auvergne-Rhône-Alpes", "Occitanie",
    "Provence-Alpes-Côte d'Azur", "Corse", "Mayotte", "Guadeloupe",
    "Guyane", "Martinique", "La Réunion"
];

let currentData = [];
let currentSort = { column: 'global_rank', direction: 'asc' };
let searchTerm = "";

document.addEventListener('DOMContentLoaded', () => {
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

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderTable();
    });
});

function showHome() {
    document.getElementById('home-section').classList.remove('hidden');
    document.getElementById('ranking-section').classList.add('hidden');
    document.getElementById('region-select').value = "";
    document.getElementById('search-input').value = "";
    searchTerm = "";
}

async function loadRegion(regionName) {
    searchTerm = "";
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = "";
    const filePath = `exports_regions/${regionName}.json?t=${Date.now()}`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Fichier introuvable (${response.status})`);
        let data = await response.json();
        console.log(`Données chargées pour ${regionName} :`, data.length, "joueurs trouvés.");

        data.sort((a, b) => {
            let rankA = a.global_rank || 999999999;
            let rankB = b.global_rank || 999999999;
            return rankA - rankB;
        });

        data.forEach((player, index) => {
            if (player.global_rank) {
                player.local_rank = index + 1;
            }
            
            else {
                player.local_rank = "-";
            }
        });

        currentData = data;
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('ranking-section').classList.remove('hidden');
        document.getElementById('current-region-title').textContent = `Classement : ${regionName}`;
        renderTable();
    }
    
    catch (error) {
        console.error(error);
        alert("Erreur : Impossible de charger les données. Vérifiez la console (F12) pour plus de détails.");
    }
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    const filteredData = currentData.filter(player => {
        if (!player.username) return false; 
        return player.username.toLowerCase().includes(searchTerm);
    });

    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-result">Aucun joueur trouvé.</td></tr>';
        return;
    }

    filteredData.forEach(player => {
        try {
            const tr = document.createElement('tr');
            const regionRankDisplay = player.local_rank !== "-" ? `#${player.local_rank}` : "-";
            const globalRankDisplay = player.global_rank ? `#${player.global_rank.toLocaleString()}` : "-";
            const pp = player.pp ? Math.round(player.pp).toLocaleString() : 0;
            const acc = player.hit_accuracy ? player.hit_accuracy.toFixed(2) + '%' : '0%';
            const playcount = player.play_count ? player.play_count.toLocaleString() : 0;
            const level = player.level ? player.level : 0;
            const avatar = player.avatar_url || "https://osu.ppy.sh/images/layout/avatar-guest.png";
            const groupRaw = player.default_group || "default"; 
            const groupLower = groupRaw.toLowerCase();
            const groupClass = `group-${groupLower}`; 
            let groupBadgeHTML = "";

            if (groupLower !== "default") {
                groupBadgeHTML = `<span class="group-tag ${groupClass}">${groupRaw}</span>`;
            }

            tr.innerHTML = `
                <td><span class="rank-pill">${regionRankDisplay}</span></td>
                <td>
                    <div class="player-info">
                        <img src="${avatar}" alt="" class="avatar" loading="lazy">
                        <div style="display:flex; flex-direction:column;">
                            <a href="https://osu.ppy.sh/users/${player.id}" target="_blank" class="player-link ${groupClass}">
                                ${player.username}
                            </a>
                            ${groupBadgeHTML}
                        </div>
                    </div>
                </td>
                <td style="font-weight:bold; color:#aaa;">${globalRankDisplay}</td>
                <td>${pp} pp</td>
                <td>${acc}</td>
                <td>${playcount}</td>
                <td>Lvl ${level}</td>
            `;
            tbody.appendChild(tr);
        }
        
        catch (e) {
            console.error("Erreur d'affichage :", e);
        }
    });
}

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    
    else {
        if (column === 'global_rank') {
            currentSort.direction = 'asc';
        }
        
        else {
            currentSort.direction = 'desc';
        }

        currentSort.column = column;
    }

    currentData.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable();
}
