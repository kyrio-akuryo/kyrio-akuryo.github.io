const REGIONS = [
    "Hauts-de-France", "Normandie", "Île-de-France", "Grand-Est", "Bretagne",
    "Pays de La Loire", "Centre-Val de Loire", "Bourgogne-Franche-Comté",
    "Nouvelle-Aquitaine", "Auvergne-Rhône-Alpes", "Occitanie",
    "Provence-Alpes-Côte d'Azur", "Corse", "Mayotte", "Guadeloupe",
    "Guyane", "Martinique", "La Réunion"
];

const ICONS = {
    "Mouse": `<svg class="style-icon" viewBox="0 0 24 24"><path d="M13 2h-2C5.48 2 1 6.48 1 12s4.48 10 10 10 10-4.48 10-10S16.52 2 13 2zm0 2c3.53 0 6.43 2.61 6.92 6h-5.92V4zm-2 0v6H5.08C5.57 6.61 8.47 4 11 4zm-6 8h14c0 3.31-2.69 6-6 6h-2c-3.31 0-6-2.69-6-6z"/></svg>`,
    "Keyboard": `<svg class="style-icon" viewBox="0 0 24 24"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>`,
    "Tablet": `<svg class="style-icon" viewBox="0 0 24 24"><path d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16H5V4h14v14z"/><path d="M 7 12 L 17 6 L 16.5 5.2 L 6.5 11.2 Z" transform="rotate(-15 12 12)" style="fill:#fff;opacity:0.8"/></svg>`,
    "Touch": `<svg class="style-icon" viewBox="0 0 24 24"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-2.54-.63c-.46-.11-1.01.14-1.18.59l-.47 1.27-3.23-1.64V7.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v6.5l-2.61-1.6c-.36-.22-.81-.16-1.11.14l-1.02.99 4.69 4.69c.57.57 1.34.88 2.15.88h6.29c1.03 0 1.89-.78 1.99-1.8l.33-3.26c.07-.63-.25-1.25-.79-1.39z"/></svg>`
};

const PLAYSTYLE_FR = {
    "Mouse": "Souris",
    "Keyboard": "Clavier",
    "Tablet": "Tablette",
    "Touch": "Tactile"
};

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

        data.sort((a, b) => {
            let rankA = a.global_rank || 999999999;
            let rankB = b.global_rank || 999999999;
            return rankA - rankB;
        });

        currentData = data;
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('ranking-section').classList.remove('hidden');
        document.getElementById('current-region-title').textContent = `${regionName}`;
        currentSort = { column: 'global_rank', direction: 'asc' };
        renderTable();
    }

    catch (error) {
        console.error(error);
        alert("Erreur de chargement. Vérifiez la console.");
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
        tbody.innerHTML = '<tr><td colspan="9" class="no-result">Aucun joueur trouvé.</td></tr>';
        return;
    }

    filteredData.forEach(player => {
        try {
            const tr = document.createElement('tr');
            const coverUrl = player.cover_url;
            const dynamicRank = currentData.indexOf(player) + 1;
            const rankDisplay = `#${dynamicRank}`;
            const globalRankDisplay = player.global_rank ? `#${player.global_rank.toLocaleString()}` : "-";
            const pp = player.pp ? Math.round(player.pp).toLocaleString() : 0;
            const acc = player.hit_accuracy ? player.hit_accuracy.toFixed(2) + '%' : '0%';
            const playcount = player.play_count ? player.play_count.toLocaleString() : 0;
            const level = player.level ? player.level : 0;
            const avatar = player.avatar_url || "https://osu.ppy.sh/images/layout/avatar-guest.png";
            const groupRaw = player.default_group || "default";
            const groupClass = `group-${groupRaw.toLowerCase()}`;
            const followers = player.follower_count ? player.follower_count.toLocaleString() : 0;
            let globalRankHTML = globalRankDisplay;
            let playstyleHTML = '<div class="playstyle-container">';
            let groupBadgeHTML = groupRaw.toLowerCase() !== "default" ? `<span class="group-tag ${groupClass}">${groupRaw}</span>` : "";
            let teamHTML = "-";
            let supporterHTML = "";

            if (player.rank_highest) {
                const bestRank = `#${player.rank_highest.toLocaleString()}`;
                globalRankHTML = `
                    <div class="rank-container">
                        ${globalRankDisplay}
                        <div class="rank-tooltip">
                            <span class="rank-peak-label">Meilleur (Peak)</span>
                            ${bestRank}
                        </div>
                    </div>
                `;
            }

            if (player.playstyle && Array.isArray(player.playstyle) && player.playstyle.length > 0) {
                player.playstyle.forEach(style => {
                    const formattedStyle = style.charAt(0).toUpperCase() + style.slice(1).toLowerCase();

                    if (ICONS[formattedStyle]) {
                        const frenchName = PLAYSTYLE_FR[formattedStyle] || formattedStyle;

                        playstyleHTML += `
                            <div class="playstyle-icon-box">
                                ${ICONS[formattedStyle]}
                                <span class="playstyle-tooltip">${frenchName}</span>
                            </div>
                        `;
                    }
                });
            }

            else {
                playstyleHTML += "-";
            }

            playstyleHTML += `</div>`;

            if (player.has_supported) {
                supporterHTML = `
                    <svg class="supporter-icon" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                `;
            }

            if (player.team) {
                if (player.team.flag_url) {
                    teamHTML = `<div class=\"team-info\"><img src=\"${player.team.flag_url}\" class=\"team-flag\"><span class=\"team-name\">${player.team.name}</span></div>`;
                }

                else {
                    teamHTML = `<span class=\"team-name\">${player.team.name}</span>`;
                }
            }

            if (coverUrl) {
                const overlayOpacity = "0.6";
                const overlayColor = `rgba(0, 0, 0, ${overlayOpacity})`;
                tr.style.backgroundImage = `linear-gradient(${overlayColor}, ${overlayColor}), url('${coverUrl}')`;
            }

            if (!player.is_active) {
                tr.classList.add('status-inactive');
            }

            if (player.is_deleted) {
                tr.classList.add('deleted-player');
            }

            let tooltipHTML = "";

            if (player.previous_usernames && player.previous_usernames.length > 0) {
                tooltipHTML = `<div class="prev-names-tooltip"><span class="tooltip-title">Anciennement</span>${player.previous_usernames.join(", ")}</div>`;
            }

            tr.innerHTML = `
                <td><span class="rank-pill">${rankDisplay}</span></td>
                <td>
                   <div class="player-info">
                        <img src="${avatar}" alt="" class="avatar" loading="lazy">
                        <div style="display:flex; flex-direction:column;">
                            <div class="name-container">
                                <a href="https://osu.ppy.sh/users/${player.id}" target="_blank" class="player-link ${groupClass}">
                                    ${player.username}
                                </a>
                                ${supporterHTML}
                                ${tooltipHTML}
                            </div>
                            ${groupBadgeHTML}
                        </div>
                    </div>
                </td>
                <td>${teamHTML || '-'}</td>
                <td>${playstyleHTML}</td>
                <td style="font-weight:bold; color:#aaa;">${globalRankHTML}</td>
                <td>${pp ? Math.round(player.pp).toLocaleString() : 0} pp</td>
                <td>${acc ? player.hit_accuracy.toFixed(2) : 0}%</td>
                <td>Lvl ${level || 0}</td>
                <td>${playcount ? player.play_count.toLocaleString() : 0}</td>
                <td>${followers}</td>
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
