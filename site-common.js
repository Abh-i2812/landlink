// site-common.js - Shared utilities for LandLink static pages
(function() {
  // Mobile menu toggle helper
  window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    const isHidden = menu.style.transform === 'translateX(-100%)' || menu.style.display === 'none';
    if (isHidden) {
      menu.style.transform = 'translateX(0)';
      menu.style.display = 'block';
    } else {
      menu.style.transform = 'translateX(-100%)';
      menu.style.display = 'none';
    }
  };

  window.closeMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    menu.style.transform = 'translateX(-100%)';
    menu.style.display = 'none';
  };

  window.navigateTo = function(url) {
    if (url) window.location.href = url;
  };
})();
