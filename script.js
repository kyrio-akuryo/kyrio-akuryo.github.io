const images = [
    './images/goat.png',
    './images/honey.png',
];

function rain() {
    const img = document.createElement('img');
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const size = Math.random() * 50 + 20;
    const leftPosition = Math.random() * 100;
    const animationLength = Math.random() * 3 + 3;

    img.src = randomImage;
    img.classList.add('rain-image');
    img.style.width = `${size}px`;
    img.style.left = `${leftPosition}vw`;
    img.style.animationDuration = `${animationLength}s`;

    document.body.appendChild(img);

    img.addEventListener('animationend', () => {
        img.remove();
    });
}

setInterval(rain, 100);