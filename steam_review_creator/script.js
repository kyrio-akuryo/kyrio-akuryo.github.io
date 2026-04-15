function genererRevue() {
    const categories = document.querySelectorAll('.category');

    let finalText = "";
    let totalScore = 0;
    let activeCategoriesCount = 0;

    categories.forEach(function (categorie) {
        const isIgnored = categorie.querySelector('.ignore-cat').checked;

        if (isIgnored) {
            return;
        }

        const title = categorie.querySelector('h3').innerText;

        finalText += `[hr][/hr]\n[h2]${title}[/h2]\n`;
        activeCategoriesCount += 1;

        const inputs = categorie.querySelectorAll('input[type="radio"]');

        inputs.forEach(function (input) {
            if (input.checked) {
                finalText += `☑ ${input.value}\n`;

                if (input.dataset.score) {
                    totalScore += parseFloat(input.dataset.score);
                }
            }

            else {
                finalText += `☐ ${input.value}\n`;
            }
        });
    });

    let finalRatingText = "";

    if (activeCategoriesCount > 0) {
        let rating = (totalScore * 20) / (activeCategoriesCount * 5);
        finalRatingText = `[h1]Overall rating: ${rating.toFixed(1)}/20[/h1]\n`;
    }

    else {
        finalRatingText = `[h1]No categories selected[/h1]\n`;
    }

    finalText = finalRatingText + finalText;

    const resultZone = document.getElementById('result');

    resultZone.value = finalText.trim();
}

function copierTexte() {
    const resultZone = document.getElementById('result');

    if (resultZone.value === "") {
        alert("There is nothing to copy!");
        return;
    }

    navigator.clipboard.writeText(resultZone.value).then(function () {
        alert("Copied review on the clipboard!");
    }).catch(function (err) {
        alert("Copy Error: " + err);
    });
}
