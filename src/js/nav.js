function setActiveNav() {
  const page = document.body?.dataset?.page;
  if (!page) {
    return;
  }
  document.querySelectorAll('[data-nav-page]')
    .forEach((link) => {
      if (link.dataset.navPage === page) {
        link.classList.add('active');
      }
    });
}

function initMobileNav() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (!menuToggle || !mobileNav) {
    return;
  }

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
}

setActiveNav();
initMobileNav();
