const USER_STORAGE_KEY = "landlinkUser";
const FAVORITES_STORAGE_KEY = "landlinkFavorites";
const COMPARE_STORAGE_KEY = "landlinkCompare";

let CACHED_LISTINGS = [];

function api() {
  return window.LandLinkAPI;
}

function isApiReady() {
  return Boolean(window.LandLinkAPI);
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
  const location = safeQuery("#landing-location")?.value?.trim();
  const landType = safeQuery("#landing-landtype")?.value;
  const budget = safeQuery("#landing-budget")?.value?.trim();
  const area = safeQuery("#landing-area")?.value?.trim();
  const params = new URLSearchParams();

  if (location) params.set("city", location);
  if (landType && landType !== "Any") params.set("landType", landType);
  if (budget && budget.toLowerCase() !== "range") params.set("price", budget);
  if (area && area.toLowerCase() !== "total area") params.set("area", area);

  return `browse.html?${params.toString()}`;
}

function showLandingToast(message) {
  let toast = document.getElementById("landing-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "landing-toast";
    toast.style.cssText =
      "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:50;min-width:260px;padding:14px 20px;border-radius:999px;background:#412817;color:#fff;text-align:center;font-size:14px;box-shadow:0 12px 30px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.25s ease";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  window.clearTimeout(window.landingToastTimeout);
  window.landingToastTimeout = window.setTimeout(() => {
    toast.style.opacity = "0";
  }, 3000);
}

function getStoredUser() {
  if (isApiReady()) return api().getUser();
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function setStoredUser(user) {
  if (isApiReady()) api().setUser(user);
  else localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearStoredUser() {
  if (isApiReady()) api().clearUser();
  else localStorage.removeItem(USER_STORAGE_KEY);
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
  return getStoredArray(FAVORITES_STORAGE_KEY).map(String);
}

function getStoredCompare() {
  return getStoredArray(COMPARE_STORAGE_KEY).map(String);
}

function toggleSavedItem(key, id, isAdd) {
  const items = getStoredArray(key).map(String);
  const sid = String(id);
  const index = items.indexOf(sid);
  if (isAdd) {
    if (index === -1) items.push(sid);
  } else if (index !== -1) {
    items.splice(index, 1);
  }
  setStoredArray(key, items);
  return items;
}

function formatPrice(price) {
  if (price >= 10000000) return (price / 10000000).toFixed(1) + " Cr";
  if (price >= 100000) return (price / 100000).toFixed(1) + " L";
  return "₹" + Number(price).toLocaleString("en-IN");
}

async function loadListings(params = {}) {
  if (!isApiReady()) throw new Error("api.js not loaded");
  const data = await api().getListings(params);
  CACHED_LISTINGS = data.listings || [];
  return CACHED_LISTINGS;
}

async function sendOtpCode(phone) {
  if (!phone) {
    showLandingToast("Enter a mobile number first.");
    return false;
  }
  try {
    await api().sendOtp(phone);
    showLandingToast("OTP sent. Check server console if Twilio is not configured.");
    return true;
  } catch (error) {
    showLandingToast(error.message);
    return false;
  }
}

async function verifyOtpCode(phone, code, name, role) {
  if (!phone || !code || String(code).length !== 6) {
    showLandingToast("Enter a valid phone and 6-digit code.");
    return false;
  }
  try {
    await api().verifyOtp({ phone, code, name, role });
    showLandingToast("Login successful. Redirecting...");
    setTimeout(() => navigateTo("dashboard.html"), 800);
    return true;
  } catch (error) {
    showLandingToast(error.message);
    return false;
  }
}

function updateLoginButton() {
  const loginButton = safeQuery("#landing-login");
  const user = getStoredUser();
  if (!loginButton) return;
  loginButton.textContent = user ? "Dashboard" : "Login / Sign Up";
}

function updateBrowseStatus() {
  const favorites = getStoredFavorites();
  const compare = getStoredCompare();
  const favoritesCount = safeQuery("#browse-favorites-count");
  const compareCount = safeQuery("#browse-compare-count");
  if (favoritesCount) favoritesCount.textContent = favorites.length;
  if (compareCount) compareCount.textContent = compare.length;
}

function synchronizeSavedButtons() {
  const favorites = getStoredFavorites();
  const compare = getStoredCompare();

  document.querySelectorAll("[data-favorite-button]").forEach((button) => {
    const id = String(button.getAttribute("data-favorite-button"));
    const saved = favorites.includes(id);
    button.textContent = saved ? "Favorited" : "Favorite";
    button.classList.toggle("bg-secondary-fixed", saved);
    button.classList.toggle("text-on-secondary-fixed", saved);
    button.classList.toggle("bg-[#fff4e7]", !saved);
  });

  document.querySelectorAll("[data-compare-checkbox]").forEach((checkbox) => {
    const id = String(checkbox.getAttribute("data-compare-id"));
    checkbox.checked = compare.includes(id);
  });
}

function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  if (!mobileMenu) return;
  const isHidden =
    mobileMenu.style.transform === "translateX(-100%)" || mobileMenu.style.display === "none";
  if (isHidden) {
    mobileMenu.style.transform = "translateX(0)";
    mobileMenu.style.display = "block";
  } else {
    mobileMenu.style.transform = "translateX(-100%)";
    mobileMenu.style.display = "none";
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  if (!mobileMenu) return;
  mobileMenu.style.transform = "translateX(-100%)";
  mobileMenu.style.display = "none";
}

function attachLandingEvents() {
  const loginButton = safeQuery("#landing-login");
  const postButton = safeQuery("#landing-post");
  const searchButton = safeQuery("#landing-search");
  const viewAllButton = safeQuery("#landing-view-all");
  const listLandButton = safeQuery("#landing-list-land");

  if (loginButton)
    loginButton.addEventListener("click", () =>
      navigateTo(getStoredUser() ? "dashboard.html" : "auth.html"),
    );
  if (postButton) postButton.addEventListener("click", () => navigateTo("sell.html"));
  if (viewAllButton) viewAllButton.addEventListener("click", () => navigateTo("browse.html"));
  if (listLandButton) listLandButton.addEventListener("click", () => navigateTo("sell.html"));
  if (searchButton)
    searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(buildSearchUrl());
    });

  document.querySelectorAll("[data-landing-location]").forEach((button) => {
    button.addEventListener("click", () => {
      const city = button.getAttribute("data-landing-location");
      navigateTo(`browse.html?city=${encodeURIComponent(city)}`);
    });
  });

  document.querySelectorAll("[data-landing-landtype]").forEach((button) => {
    button.addEventListener("click", () => {
      const landType = button.getAttribute("data-landing-landtype");
      navigateTo(`browse.html?landType=${encodeURIComponent(landType)}`);
    });
  });
}

function attachAuthPageEvents() {
  const sendButton = safeQuery("#auth-send-otp");
  const verifyButton = safeQuery("#auth-verify-otp");
  const phoneInput = safeQuery("#auth-phone");
  const nameInput = safeQuery("#auth-name");
  const roleSelect = safeQuery("#auth-role");
  const codeInput = safeQuery("#auth-code");
  const statusText = safeQuery("#auth-status");

  function setStatus(message, isError = false) {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.style.color = isError ? "#ba1a1a" : "#3E2723";
  }

  if (statusText) {
    setStatus("Connected to API at " + (api()?.getApiBase?.() || "http://localhost:3000") + ". Dev OTP: 123456");
  }

  if (sendButton) {
    sendButton.addEventListener("click", async () => {
      const phone = phoneInput?.value.trim();
      if (!phone) {
        setStatus("Enter your mobile number first.", true);
        return;
      }
      const success = await sendOtpCode(phone);
      if (success) setStatus("OTP sent. Use the code from the server console, or 123456 in local mode.");
    });
  }

  if (verifyButton) {
    verifyButton.addEventListener("click", async () => {
      const phone = phoneInput?.value.trim();
      const code = codeInput?.value.trim();
      const name = nameInput?.value.trim();
      const role = roleSelect?.value || "BUYER";
      const success = await verifyOtpCode(phone, code, name, role);
      if (success) setStatus("Login succeeded. Redirecting...");
    });
  }
}

function attachGenericNavEvents() {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = link.getAttribute("data-nav");
    if (target) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        navigateTo(target);
      });
    }
  });
}

function attachBrowsePageEvents() {
  const user = getStoredUser();
  const statusText = safeQuery("#browse-status");

  if (statusText) {
    statusText.textContent = user
      ? `Welcome back, ${user.name || user.phone}. Browse live listings from the API.`
      : "Browse live listings. Login to sync favorites to your account.";
  }

  document.getElementById("listings-container")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-favorite-button]");
    if (!button) return;
    const id = String(button.getAttribute("data-favorite-button"));
    const favorites = getStoredFavorites();
    const isSaved = favorites.includes(id);
    toggleSavedItem(FAVORITES_STORAGE_KEY, id, !isSaved);
    synchronizeSavedButtons();
    updateBrowseStatus();
    if (getStoredUser()?.token) {
      try {
        await api().toggleFavorite(id);
      } catch (err) {
        showLandingToast(err.message);
      }
    }
    showLandingToast(!isSaved ? "Added to favorites." : "Removed from favorites.");
  });

  document.getElementById("listings-container")?.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-compare-checkbox]");
    if (!checkbox) return;
    const id = String(checkbox.getAttribute("data-compare-id"));
    toggleSavedItem(COMPARE_STORAGE_KEY, id, checkbox.checked);
    updateBrowseStatus();
    renderCompareBar();
    showLandingToast(checkbox.checked ? "Added to compare list." : "Removed from compare list.");
  });

  synchronizeSavedButtons();
  updateBrowseStatus();
}

function attachSellPageEvents() {
  const sellStatus = safeQuery("#sell-status");
  if (!sellStatus) return;
  const user = getStoredUser();
  sellStatus.textContent = user
    ? `Logged in as ${user.name || user.phone}. Submit posts to ${api().getApiBase()}.`
    : "Please login as SELLER/AGENT before publishing. API: " + api().getApiBase();
}

async function attachDashboardPageEvents() {
  const greeting = safeQuery("#dashboard-greeting");
  const details = safeQuery("#dashboard-details");
  const logoutButton = safeQuery("#dashboard-logout");
  const user = getStoredUser();

  if (!user) {
    if (greeting) greeting.textContent = "Please sign in";
    if (details) details.textContent = "No authenticated user detected. Use auth.html to sign in with OTP.";
  } else {
    if (greeting) greeting.textContent = `Welcome back, ${user.name || "LandLink user"}!`;
    if (details)
      details.textContent = `Phone: ${user.phone} • Role: ${user.role} • API: ${api().getApiBase()}`;
  }

  const favBox = document.getElementById("dashboard-favorites");
  if (favBox && user?.token) {
    try {
      const data = await api().getFavorites();
      const items = data.favorites || [];
      favBox.innerHTML = items.length
        ? items
            .map(
              (f) =>
                `<li><a class="text-[#412817] underline" href="listing.html?id=${f.listingId}">${f.title || f.listingId}</a> — ${f.city || ""}</li>`,
            )
            .join("")
        : "<li>No saved favorites yet.</li>";
    } catch (err) {
      favBox.innerHTML = `<li>${err.message}</li>`;
    }
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      clearStoredUser();
      showLandingToast("Logged out successfully.");
      updateLoginButton();
      setTimeout(() => navigateTo("index.html"), 400);
    });
  }
}

function populateBrowseFilters() {
  const params = getQueryParams();
  const mappings = {
    "browse-city": "city",
    "browse-landtype": "landType",
    "browse-minprice": "minPrice",
    "browse-maxprice": "maxPrice",
    "browse-area": "area",
  };
  Object.entries(mappings).forEach(([id, param]) => {
    const element = safeQuery(`#${id}`);
    if (element && params.has(param)) element.value = params.get(param);
  });
}

function renderCompareBar() {
  const compare = getStoredCompare();
  let compareBar = document.getElementById("sticky-compare-bar");

  if (compare.length === 0) {
    if (compareBar) compareBar.style.display = "none";
    return;
  }

  if (!compareBar) {
    compareBar = document.createElement("div");
    compareBar.id = "sticky-compare-bar";
    compareBar.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:40;background:#412817;color:#fffdf6;padding:16px 24px;box-shadow:0 -4px 20px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:space-between;font-family:"Plus Jakarta Sans",sans-serif;';
    document.body.appendChild(compareBar);
  }

  compareBar.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:14px;font-weight:500;">Comparing <strong>${compare.length}</strong> plots</span>
    </div>
    <button onclick="navigateTo('compare.html')" style="background:#fdba4b;color:#281800;border:none;padding:10px 20px;border-radius:999px;font-weight:600;cursor:pointer;font-size:14px;">View & Compare</button>
  `;
  compareBar.style.display = "flex";
}

function listingCardHtml(listing, favorites, compare) {
  const id = String(listing.id);
  const verified = listing.verified || listing.status === "ACTIVE";
  return `
    <article class="rounded-[32px] border border-[#d3c3bb]/15 bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="h-56 bg-cover bg-center" style="background-image:url('${listing.image}');"></div>
      <div class="p-6">
        <p class="text-xs uppercase tracking-[0.25em] text-[#5a3e2b]">${String(listing.type || listing.landType || "").replace(/_/g, " ")}</p>
        <h2 class="mt-3 text-2xl font-semibold text-[#3e2723]">${listing.title}</h2>
        <p class="mt-3 text-sm leading-6 text-[#5a5145]">${listing.area || ""} ${listing.unit || "Guntha"} in ${listing.city}${verified ? " • verified" : ""}.</p>
        <div class="mt-6 flex flex-col gap-3 text-sm text-[#5a5145] sm:flex-row sm:items-center sm:justify-between">
          <span class="font-bold text-[#3e2723]">₹ ${formatPrice(listing.price)}</span>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" data-favorite-button="${id}" class="rounded-full ${favorites.includes(id) ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-[#fff4e7]"} px-3 py-2 text-[#5a3e2b] text-xs cursor-pointer transition-all">${favorites.includes(id) ? "Favorited" : "Favorite"}</button>
            <label class="inline-flex items-center gap-2 rounded-full bg-[#fff4e7] px-3 py-2 text-[#5a3e2b] text-xs cursor-pointer">
              <input data-compare-checkbox data-compare-id="${id}" type="checkbox" ${compare.includes(id) ? "checked" : ""} class="rounded cursor-pointer" />
              Compare
            </label>
          </div>
        </div>
        <a href="listing.html?id=${encodeURIComponent(id)}" class="mt-4 block text-center rounded-full bg-secondary-container px-4 py-2 text-xs font-semibold text-on-secondary-container hover:bg-secondary-fixed transition-colors">View Details</a>
      </div>
    </article>
  `;
}

async function renderFeaturedListings() {
  const container = document.getElementById("featured-listings-container");
  if (!container) return;

  const favorites = getStoredFavorites();
  const compare = getStoredCompare();
  container.innerHTML = `<p class="text-sm text-[#5a5145]">Loading listings from API...</p>`;

  try {
    const listings = await loadListings({ take: 8, status: "ACTIVE" });
    if (!listings.length) {
      container.innerHTML = `<p class="text-sm text-[#ba1a1a]">No listings found. Start the Next.js API and run <code>npm run seed</code>.</p>`;
      return;
    }
    container.innerHTML = listings.slice(0, 8).map((l) => listingCardHtml(l, favorites, compare)).join("");
    synchronizeSavedButtons();
  } catch (err) {
    container.innerHTML = `<p class="text-sm text-[#ba1a1a]">API unavailable (${err.message}). Start backend at ${api()?.getApiBase?.() || "http://localhost:3000"}.</p>`;
  }
}

async function attachPageEvents() {
  attachLandingEvents();
  attachGenericNavEvents();
  updateLoginButton();
  renderCompareBar();

  if (document.getElementById("featured-listings-container")) {
    await renderFeaturedListings();
  }

  if (safeQuery("#auth-page")) attachAuthPageEvents();
  if (safeQuery("#browse-page")) {
    populateBrowseFilters();
    attachBrowsePageEvents();
  }
  if (safeQuery("#sell-page")) attachSellPageEvents();
  if (safeQuery("#dashboard-page")) await attachDashboardPageEvents();
}

window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.navigateTo = navigateTo;
window.showLandingToast = showLandingToast;
window.getStoredFavorites = getStoredFavorites;
window.getStoredCompare = getStoredCompare;
window.getStoredUser = getStoredUser;
window.toggleSavedItem = toggleSavedItem;
window.FAVORITES_STORAGE_KEY = FAVORITES_STORAGE_KEY;
window.COMPARE_STORAGE_KEY = COMPARE_STORAGE_KEY;
window.synchronizeSavedButtons = synchronizeSavedButtons;
window.populateBrowseFilters = populateBrowseFilters;
window.attachBrowsePageEvents = attachBrowsePageEvents;
window.renderCompareBar = renderCompareBar;
window.formatPrice = formatPrice;
window.loadListings = loadListings;
window.CACHED_LISTINGS = CACHED_LISTINGS;

window.addEventListener("DOMContentLoaded", attachPageEvents);
