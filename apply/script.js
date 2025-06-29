const apply = document.querySelector('.apply');
const universeLinks = document.querySelectorAll('.apply-universe a');

universeLinks.forEach(link => {
    const bgImage = link.getAttribute('data-bg');

    link.addEventListener('mouseover', () => {
        apply.style.backgroundImage = `url(${bgImage})`;
    });

    link.addEventListener('mouseout', () => {
        apply.style.backgroundImage = ''; // Reset to default
    });
});



