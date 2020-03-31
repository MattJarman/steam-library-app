const DEFAULT_DARK_MODE_ENABLED = false;

$('html').addClass('hidden');

$('document').ready(function() {
    const isDarkMode = localStorage.getItem('darkMode') || DEFAULT_DARK_MODE_ENABLED;
    $('#theme-switch').prop('checked', isDarkMode);
    toggleDarkMode(isDarkMode);


    $('#theme-switch').on('change', (e) => {
        let isDarkMode = e.target.checked;

        toggleDarkMode(isDarkMode);
    });

    let burger = document.querySelector('.burger');
    nav = document.querySelector('#' + burger.dataset.target);
    burger.addEventListener('click', function() {
        burger.classList.toggle('is-active');
        nav.classList.toggle('is-active');
    });

    nav.onclick = function(e) {
        e.stopPropagation();
    }

    burger.onclick = function(e) {
        e.stopPropagation();
    }

    document.onclick = function(e) {
        $('#nav-menu').removeClass('is-active');
        $('.burger').removeClass('is-active');
    }

    $('.navbar-link').on('click', function() {
        $(this.parentElement).toggleClass('is-active');
    });

    $('.dropdown').on('click', function(e) {
        e.stopPropagation();
        $(this).toggleClass('is-active');
    });

    $(document).on('click', function() {
        $('.dropdown').removeClass('is-active');
    });

    $('html').removeClass('hidden');
});

function toggleDarkMode(isDarkMode) {
    let body = document.body;

    if (isDarkMode) {
        body.classList.add('dark');
        localStorage.setItem('darkMode', true);
        return;
    }

    body.classList.remove('dark');
    localStorage.removeItem('darkMode');
}