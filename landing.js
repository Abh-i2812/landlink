const AUTH_BACKEND_ORIGIN = "https://YOUR-AUTH-APP-HOST.com";
const USER_STORAGE_KEY = 'landlinkUser';
const FAVORITES_STORAGE_KEY = 'landlinkFavorites';
const COMPARE_STORAGE_KEY = 'landlinkCompare';
const LISTINGS_STORAGE_KEY = 'landlinkListings';
const DEMO_MODE = true;

// Demo listings for GitHub Pages (static content)
const DEMO_LISTINGS = [
  { id: 1, title: 'Stable farm plot near Pune', type: 'AGRICULTURAL', price: 4550000, area: 12.5, unit: 'Guntha', city: 'Pune', verified: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkcZU6JxaPm-hxU7FWarUbvhrVRwZqSroStZnum2CHdH9gc-izkFXMzvvG_w_nsf8niQ8P1MF7gOiQgz1mo5HiRuX9bOaxueUGgz7_xE3DcmxJqrrlI5QvPGPDP9Kvlma0OOiOoTWC7bSYp6HjYRjbrpUSYJ_E241n30BSc6nc4JOwnaTXfCdQ0GcvVrGEhEl6y6wt20vOuhxZXip7eU4UxY6wW1NYuqxrEfLa0_wIkr3vg-yCcBzQ' },
  { id: 2, title: 'Development-ready plot Chakan', type: 'COMMERCIAL', price: 28000000, area: 2.5, unit: 'Acre', city: 'Chakan', verified: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx_sJz4lqRkNMDMjNDbiN-HSwOEQWtbqwYXiHJRhhbKt3YA6EuhpZ5AUGXJZgTsMiDWECYsVDa5G6aMty8H2cUA2u5Fd7-Pe627A3LkG2d3W13lxrHuhjWJmqDhdccwcT5BAx6CuEXPb4p16B9_ZiBktiyuykrCP6NRh7efOIWoFyMRXuPIu4bxacNB8cSv9Glc2Lcq-ttzpEUbfJhZH6faR13E-Mv1TiIlRlBlTOqn1dFFGtVAf0n' },
  { id: 3, title: 'Luxury farmhouse Hinjewadi', type: 'FARMHOUSE', price: 7500000, area: 1.5, unit: 'Acre', city: 'Hinjewadi', verified: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0KcCPNdVklggko04iF8wpEdwqy5YqJysQhnNs2OX7aTINqpdD3k0orjaa7sVkPvxzm24wR9L9n0hlNfvuDTeh5GLOm3JYrXB_Kr33LVf0hV_gfFKreMZS7dQQpYzPHmokw1vgr2d9UJoo6--1laahIAZ1IThslWWJljPzLzrbcRPTXthJDi7N6HkPNFzLs5S850j6HrwWgt1DbzDztglsunTf24DisqNS5bokgNRmtv87R1H6NeT4' },
  { id: 4, title: 'NA Residential plot Vadgaon', type: 'NA_RESIDENTIAL', price: 3200000, area: 20, unit: 'Guntha', city: 'Vadgaon', verified: false, image: 'https://images.unsplash.com/photo-1500595046891-01a92a9e64e8?w=600&h=400&fit=crop' },
  { id: 5, title: 'Industrial plot Ravet', type: 'INDUSTRIAL', price: 12500000, area: 5, unit: 'Acre', city: 'Ravet', verified: true, image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop' },
  { id: 6, title: 'Agricultural land Wagholi', type: 'AGRICULTURAL', price: 5800000, area: 15, unit: 'Guntha', city: 'Wagholi', verified: true, image: 'https://images.unsplash.com/photo-1500382017468-7049c8b76d9e?w=600&h=400&fit=crop' }
];

function isBackendConfigured() {
  return DEMO_MODE || (AUTH_BACKEND_ORIGIN && !AUTH_BACKEND_ORIGIN.includes('YOUR-AUTH-APP-HOST'));
}

// Mobile hamburger menu toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    const isHidden = mobileMenu.style.transform === 'translateX(-100%)' || mobileMenu.style.display === 'none';
    if (isHidden) {
      mobileMenu.style.transform = 'translateX(0)';
      mobileMenu.style.display = 'block';
    } else {
      mobileMenu.style.transform = 'translateX(-100%)';
      mobileMenu.style.display = 'none';
    }
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.style.transform = 'translateX(-100%)';
    mobileMenu.style.display = 'none';
  }
}

function safeQuery(selector) {
  return document.querySelector(selector);
}

function navigateTo(url) {
  if (!url) return;
  window.location.href = url;
}

function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

function buildSearchUrl() {
  const location = safeQuery('#landing-location')?.value?.trim();
  const landType = safeQuery('#landing-landtype')?.value;
  const budget = safeQuery('#landing-budget')?.value?.trim();
  const area = safeQuery('#landing-area')?.value?.trim();
  const params = new URLSearchParams();

  if (location) params.set('city', location);
  if (landType && landType !== 'Any') params.set('landType', landType);
  if (budget && budget.toLowerCase() !== 'range') params.set('price', budget);
  if (area && area.toLowerCase() !== 'total area') params.set('area', area);

  return `browse.html?${params.toString()}`;
}

function showLandingToast(message) {
  let toast = document.getElementById('landing-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'landing-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:50;min-width:260px;padding:14px 20px;border-radius:999px;background:#412817;color:#fff;text-align:center;font-size:14px;box-shadow:0 12px 30px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.25s ease';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  window.clearTimeout(window.landingToastTimeout);
  window.landingToastTimeout = window.setTimeout(() => {
    toast.style.opacity = '0';
  }, 3000);
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function setStoredUser(user) {
  if (!user) return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

function getStoredArray(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function setStoredArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getStoredFavorites() {
  return getStoredArray(FAVORITES_STORAGE_KEY);
}

function getStoredCompare() {
  return getStoredArray(COMPARE_STORAGE_KEY);
}

function toggleSavedItem(key, id, isAdd) {
  const items = getStoredArray(key);
  const index = items.indexOf(id);
  if (isAdd) {
    if (index === -1) items.push(id);
  } else {
    if (index !== -1) items.splice(index, 1);
  }
  setStoredArray(key, items);
  return items;
}

async function sendOtpCode(phone) {
  if (!isBackendConfigured()) {
    showLandingToast('Demo mode: OTP accepted (enter any 6 digits)');
    return true;
  }
  if (!phone) {
    showLandingToast('Enter a mobile number first.');
    return false;
  }
  if (!DEMO_MODE) {
    const endpoint = `${AUTH_BACKEND_ORIGIN}/api/auth/send-otp`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Unable to send OTP');
      showLandingToast('OTP sent to your phone.');
      return true;
    } catch (error) {
      showLandingToast(error.message);
      return false;
    }
  }
  showLandingToast('Demo OTP ready. Enter any 6 digits to proceed.');
  return true;
}

async function verifyOtpCode(phone, code, name, role) {
  if (!isBackendConfigured()) {
    showLandingToast('Update AUTH_BACKEND_ORIGIN in docs/landing.js to your auth app URL.');
    return false;
  }
  if (!phone || !code || code.length !== 6) {
    showLandingToast('Enter a valid phone and 6-digit code.');
    return false;
  }

  if (DEMO_MODE) {
    // Demo mode: accept any 6-digit code
    const user = {
      phone,
      name: name || 'LandLink User',
      role: role || 'BUYER',
      token: 'demo-token-' + Date.now(),
      loggedInAt: new Date().toISOString(),
    };
    setStoredUser(user);
    showLandingToast('✓ Login successful. Welcome, ' + (name || 'user') + '!');
    setTimeout(() => {
      navigateTo('dashboard.html');
    }, 800);
    return true;
  }

  const endpoint = `${AUTH_BACKEND_ORIGIN}/api/auth/verify-otp`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code, name, role }),
    });
    const data = await response.json();
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || 'OTP verification failed');
    }

    const user = {
      phone,
      name: name || 'LandLink user',
      role: role || 'BUYER',
      token: data?.token || null,
      loggedInAt: new Date().toISOString(),
    };
    setStoredUser(user);
    showLandingToast('Login successful. Redirecting...');
    setTimeout(() => {
      navigateTo('dashboard.html');
    }, 800);
    return true;
  } catch (error) {
    showLandingToast(error.message);
    return false;
  }
}

function updateLoginButton() {
  const loginButton = safeQuery('#landing-login');
  const user = getStoredUser();
  if (!loginButton) return;
  if (user) {
    loginButton.textContent = 'Dashboard';
  } else {
    loginButton.textContent = 'Login / Sign Up';
  }
}

function updateBrowseStatus() {
  const favorites = getStoredFavorites();
  const compare = getStoredCompare();
  const favoritesCount = safeQuery('#browse-favorites-count');
  const compareCount = safeQuery('#browse-compare-count');
  if (favoritesCount) favoritesCount.textContent = favorites.length;
  if (compareCount) compareCount.textContent = compare.length;
}

function synchronizeSavedButtons() {
  const favorites = getStoredFavorites();
  const compare = getStoredCompare();

  document.querySelectorAll('[data-favorite-button]').forEach((button) => {
    const id = button.getAttribute('data-favorite-button');
    const saved = favorites.includes(id);
    button.textContent = saved ? 'Favorited' : 'Favorite';
    button.classList.toggle('bg-secondary-fixed', saved);
    button.classList.toggle('text-on-secondary-fixed', saved);
    button.classList.toggle('bg-[#fff4e7]', !saved);
  });

  document.querySelectorAll('[data-compare-checkbox]').forEach((checkbox) => {
    const id = checkbox.getAttribute('data-compare-id');
    checkbox.checked = compare.includes(id);
  });
}

function attachLandingEvents() {
  const loginButton = safeQuery('#landing-login');
  const postButton = safeQuery('#landing-post');
  const searchButton = safeQuery('#landing-search');
  const viewAllButton = safeQuery('#landing-view-all');
  const listLandButton = safeQuery('#landing-list-land');

  if (loginButton) loginButton.addEventListener('click', () => navigateTo(getStoredUser() ? 'dashboard.html' : 'auth.html'));
  if (postButton) postButton.addEventListener('click', () => navigateTo('sell.html'));
  if (viewAllButton) viewAllButton.addEventListener('click', () => navigateTo('browse.html'));
  if (listLandButton) listLandButton.addEventListener('click', () => navigateTo('sell.html'));
  if (searchButton) searchButton.addEventListener('click', (event) => {
    event.preventDefault();
    navigateTo(buildSearchUrl());
  });

  document.querySelectorAll('[data-landing-location]').forEach((button) => {
    button.addEventListener('click', () => {
      const city = button.getAttribute('data-landing-location');
      navigateTo(`browse.html?city=${encodeURIComponent(city)}`);
    });
  });

  document.querySelectorAll('[data-landing-landtype]').forEach((button) => {
    button.addEventListener('click', () => {
      const landType = button.getAttribute('data-landing-landtype');
      navigateTo(`browse.html?landType=${encodeURIComponent(landType)}`);
    });
  });

  document.querySelectorAll('.landing-favorite-button').forEach((button) => {
    button.addEventListener('click', () => {
      showLandingToast('Login to save favorites.');
    });
  });

  document.querySelectorAll('.landing-compare-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      showLandingToast('Compare selection saved locally.');
    });
  });
}

function attachAuthPageEvents() {
  const sendButton = safeQuery('#auth-send-otp');
  const verifyButton = safeQuery('#auth-verify-otp');
  const phoneInput = safeQuery('#auth-phone');
  const nameInput = safeQuery('#auth-name');
  const roleSelect = safeQuery('#auth-role');
  const codeInput = safeQuery('#auth-code');
  const statusText = safeQuery('#auth-status');

  function setStatus(message, isError = false) {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.style.color = isError ? '#ba1a1a' : '#3E2723';
  }

  if (sendButton) {
    sendButton.addEventListener('click', async () => {
      const phone = phoneInput?.value.trim();
      if (!phone) {
        setStatus('Enter your mobile number first.', true);
        return;
      }
      const success = await sendOtpCode(phone);
      if (success) {
        setStatus('OTP sent. Enter the code below.');
      }
    });
  }

  if (verifyButton) {
    verifyButton.addEventListener('click', async () => {
      const phone = phoneInput?.value.trim();
      const code = codeInput?.value.trim();
      const name = nameInput?.value.trim();
      const role = roleSelect?.value || 'BUYER';
      const success = await verifyOtpCode(phone, code, name, role);
      if (success) {
        setStatus('Login succeeded. Redirecting...');
      }
    });
  }
}

function attachGenericNavEvents() {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const target = link.getAttribute('data-nav');
    if (target) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        navigateTo(target);
      });
    }
  });
}

function attachBrowsePageEvents() {
  const favoriteButtons = document.querySelectorAll('[data-favorite-button]');
  const compareCheckboxes = document.querySelectorAll('[data-compare-checkbox]');
  const user = getStoredUser();
  const statusText = safeQuery('#browse-status');

  if (statusText) {
    statusText.textContent = user
      ? `Welcome back, ${user.name}. Browse listings, save favorites, and compare properties.`
      : 'Browse listings, save favorites locally, and compare plots before you login.';
  }

  favoriteButtons.forEach((button) => {
    const id = button.getAttribute('data-favorite-button');
    button.addEventListener('click', () => {
      const favorites = getStoredFavorites();
      const isSaved = favorites.includes(id);
      const updated = toggleSavedItem(FAVORITES_STORAGE_KEY, id, !isSaved);
      showLandingToast(updated.includes(id) ? 'Added to favorites.' : 'Removed from favorites.');
      synchronizeSavedButtons();
      updateBrowseStatus();
    });
  });

  compareCheckboxes.forEach((checkbox) => {
    const id = checkbox.getAttribute('data-compare-id');
    checkbox.addEventListener('change', () => {
      const updated = toggleSavedItem(COMPARE_STORAGE_KEY, id, checkbox.checked);
      showLandingToast(checkbox.checked ? 'Added to compare list.' : 'Removed from compare list.');
      updateBrowseStatus();
    });
  });

  synchronizeSavedButtons();
  updateBrowseStatus();
}

function attachSellPageEvents() {
  const sellStatus = safeQuery('#sell-status');
  if (!sellStatus) return;
  const user = getStoredUser();
  sellStatus.textContent = user
    ? `Logged in as ${user.name}. Complete the listing and connect it to your backend.`
    : 'Please login via auth page before publishing your listing. Local demo only.';
}

function attachDashboardPageEvents() {
  const greeting = safeQuery('#dashboard-greeting');
  const details = safeQuery('#dashboard-details');
  const logoutButton = safeQuery('#dashboard-logout');
  const user = getStoredUser();

  if (greeting) {
    greeting.textContent = user ? `Welcome back, ${user.name}!` : 'Welcome to your LandLink dashboard';
  }
  if (details) {
    details.textContent = user
      ? `Phone: ${user.phone} • Role: ${user.role} • Logged in at ${new Date(user.loggedInAt).toLocaleString()}`
      : 'No authenticated user detected. Use auth.html to sign in with OTP.';
  }
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearStoredUser();
      showLandingToast('Logged out successfully.');
      updateLoginButton();
      setTimeout(() => navigateTo('index.html'), 400);
    });
  }
}

function populateBrowseFilters() {
  const params = getQueryParams();
  const mappings = {
    'browse-city': 'city',
    'browse-landtype': 'landType',
    'browse-minprice': 'minPrice',
    'browse-maxprice': 'maxPrice',
    'browse-area': 'area',
  };
  Object.entries(mappings).forEach(([id, param]) => {
    const element = safeQuery(`#${id}`);
    if (element && params.has(param)) {
      element.value = params.get(param);
    }
  });
}

function renderCompareBar() {
  const compare = getStoredCompare();
  let compareBar = document.getElementById('sticky-compare-bar');
  
  if (compare.length === 0) {
    if (compareBar) compareBar.style.display = 'none';
    return;
  }

  if (!compareBar) {
    compareBar = document.createElement('div');
    compareBar.id = 'sticky-compare-bar';
    compareBar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:40;background:#412817;color:#fffdf6;padding:16px 24px;box-shadow:0 -4px 20px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:space-between;font-family:"Plus Jakarta Sans",sans-serif;';
    document.body.appendChild(compareBar);
  }

  compareBar.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:14px;font-weight:500;">📊 Comparing <strong>${compare.length}</strong> plots</span>
    </div>
    <button onclick="navigateTo('compare.html')" style="background:#fdba4b;color:#281800;border:none;padding:10px 20px;border-radius:999px;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.2s;border:2px solid #fdba4b;" onmouseover="this.style.background='#f0a820'" onmouseout="this.style.background='#fdba4b'">View & Compare</button>
  `;
  compareBar.style.display = 'flex';
}

function renderFeaturedListings() {
  const container = document.getElementById('featured-listings-container');
  if (!container) return;

  const favorites = getStoredFavorites();
  const compare = getStoredCompare();

  container.innerHTML = DEMO_LISTINGS.slice(0, 8).map(listing => `
    <article class="rounded-[32px] border border-[#d3c3bb]/15 bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="h-56 bg-cover bg-center" style="background-image:url('${listing.image}');"></div>
      <div class="p-6">
        <p class="text-xs uppercase tracking-[0.25em] text-[#5a3e2b]">${listing.type.replace(/_/g, ' ')}</p>
        <h2 class="mt-3 text-2xl font-semibold text-[#3e2723]">${listing.title}</h2>
        <p class="mt-3 text-sm leading-6 text-[#5a5145]">Premium ${listing.area} ${listing.unit} property in ${listing.city}${listing.verified ? ' with verified documents.' : '.'}</p>
        <div class="mt-6 flex flex-col gap-3 text-sm text-[#5a5145] sm:flex-row sm:items-center sm:justify-between">
          <span class="font-bold text-[#3e2723]">₹ ${(listing.price / 100000).toFixed(1)} Lakhs</span>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" data-favorite-button="${listing.id}" class="rounded-full ${favorites.includes(listing.id) ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-[#fff4e7]'} px-3 py-2 text-[#5a3e2b] text-xs cursor-pointer transition-all">${favorites.includes(listing.id) ? '❤️ Favorited' : '🤍 Favorite'}</button>
            <label class="inline-flex items-center gap-2 rounded-full bg-[#fff4e7] px-3 py-2 text-[#5a3e2b] text-xs cursor-pointer">
              <input data-compare-checkbox data-compare-id="${listing.id}" type="checkbox" ${compare.includes(listing.id) ? 'checked' : ''} class="rounded cursor-pointer" />
              Compare
            </label>
          </div>
        </div>
        <a href="listing.html?id=${listing.id}" class="mt-4 block text-center rounded-full bg-secondary-container px-4 py-2 text-xs font-semibold text-on-secondary-container hover:bg-secondary-fixed transition-colors">View Details</a>
      </div>
    </article>
  `).join('');

  synchronizeSavedButtons();
}

function formatPrice(price) {
  if (price >= 10000000) return (price / 10000000).toFixed(1) + ' Cr';
  if (price >= 100000) return (price / 100000).toFixed(1) + ' L';
  return '₹' + price.toLocaleString();
}

function attachPageEvents() {
  attachLandingEvents();
  attachGenericNavEvents();
  updateLoginButton();
  renderFeaturedListings();
  renderCompareBar();

  if (safeQuery('#auth-page')) {
    attachAuthPageEvents();
  }
  if (safeQuery('#browse-page')) {
    populateBrowseFilters();
    attachBrowsePageEvents();
  }
  if (safeQuery('#sell-page')) {
    attachSellPageEvents();
  }
  if (safeQuery('#dashboard-page')) {
    attachDashboardPageEvents();
  }
}

window.addEventListener('DOMContentLoaded', attachPageEvents);
