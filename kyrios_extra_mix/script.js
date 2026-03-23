const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        cards.forEach(card => {
            card.style.animation = 'none';
            card.offsetHeight;

            if (filterValue === 'all' || card.getAttribute('data-platform') === filterValue) {
                card.style.display = 'flex';
                card.style.animation = 'fadeInUp 0.5s ease-out forwards';
            }

            else {
                card.style.display = 'none';
            }
        });
    });
});