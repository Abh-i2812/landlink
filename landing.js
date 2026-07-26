import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://duvpdircogolckotzjra.supabase.co',
  'sb_publishable_DUsDj3ZsdfJeQcVPcnvNuw_e_YtfnuD'
);

const USER_STORAGE_KEY = "landlinkUser";
const FAVORITES_STORAGE_KEY = "landlinkFavorites";
const COMPARE_STORAGE_KEY = "landlinkCompare";

let CACHED_LISTINGS = [];

// Sample fallback listings if database has 0 items initially
const FALLBACK_LISTINGS = [
  {
    id: "fb-1",
    title: "Agricultural Land Near Pune Expressway",
    type: "AGRICULTURAL",
    city: "Pune",
    area: "2 Acres",
    unit: "",
    price: 4500000,
    description: "Fertile agricultural plot with abundant water supply, near Pune-Bangalore highway.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    verified: true,
    status: "ACTIVE"
  },
  {
    id: "fb-2",
    title: "NA Residential Plot in Hinjewadi Phase 3",
    type: "NA_RESIDENTIAL",
    city: "Hinjewadi",
    area: "3,000 Sq.ft",
    unit: "",
    price: 3200000,
    description: "Clear title NA plot ideal for bungalows or apartment construction, near IT park.",
    image: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80",
    verified: true,
    status: "ACTIVE"
  },
  {
    id: "fb-3",
    title: "Commercial Corner Land on Chakan Highway",
    type: "COMMERCIAL",
    city: "Chakan",
    area: "1.5 Acres",
    unit: "",
    price: 12500000,
    description: "Prime highway touching land suitable for showroom, warehouse, or commercial complex.",
    image: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=800&q=80",
    verified: true,
    status: "ACTIVE"
  }
];

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
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
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
  try {
    let { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch notice:", error.message);
      data = [];
    }

    let listings = (data || []).map(row => ({
      id: row.id,
      title: row.property_title || row.title || "Land Plot",
      type: String(row.property_type || row.type || "AGRICULTURAL").toUpperCase().replace(/\s+/g, "_"),
      city: row.location || row.city || "Pune",
      area: row.size || row.area || "1 Acre",
      unit: "",
      price: row.asking_price ?? row.price ?? 0,
      description: row.description || "",
      image: row.image_url || row.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
      seller_name: row.seller_name || "",
      seller_phone: row.seller_phone || "",
      seller_email: row.seller_email || "",
      verified: true,
      status: "ACTIVE"
    }));

    if (listings.length === 0) {
      listings = [...FALLBACK_LISTINGS];
    }

    // Apply front-end filtering if params passed
    if (params.city) {
      const c = params.city.toLowerCase();
      listings = listings.filter(l => l.city.toLowerCase().includes(c) || l.title.toLowerCase().includes(c));
    }
    if (params.landType) {
      const t = params.landType.toUpperCase().replace(/\s+/g, "_");
      listings = listings.filter(l => l.type.includes(t) || t.includes(l.type));
    }
    if (params.minPrice) {
      listings = listings.filter(l => l.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      listings = listings.filter(l => l.price <= Number(params.maxPrice));
    }

    CACHED_LISTINGS = listings;
    return CACHED_LISTINGS;
  } catch (err) {
    console.warn("Error loading listings:", err);
    return FALLBACK_LISTINGS;
  }
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

function updateBrowseStatus() {
  const favorites = getStoredFavorites();
  const compare = getStoredCompare();
  const favoritesCount = safeQuery("#browse-favorites-count");
  const compareCount = safeQuery("#browse-compare-count");
  if (favoritesCount) favoritesCount.textContent = favorites.length;
  if (compareCount) compareCount.textContent = compare.length;
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
  return `
    <article class="rounded-[32px] border border-[#d3c3bb]/20 bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div class="h-56 bg-cover bg-center" style="background-image:url('${listing.image}');"></div>
      <div class="p-6">
        <p class="text-xs uppercase tracking-[0.25em] font-bold text-[#5a3e2b]">${String(listing.type || "").replace(/_/g, " ")}</p>
        <h2 class="mt-3 text-2xl font-semibold text-[#3e2723]">${listing.title}</h2>
        <p class="mt-3 text-sm leading-6 text-[#5a5145]">${listing.area || ""} in ${listing.city}.</p>
        <div class="mt-6 flex flex-col gap-3 text-sm text-[#5a5145] sm:flex-row sm:items-center sm:justify-between">
          <span class="font-bold text-[#3e2723] text-xl">₹ ${formatPrice(listing.price)}</span>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" data-favorite-button="${id}" class="rounded-full ${favorites.includes(id) ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-[#fff4e7]"} px-3 py-2 text-[#5a3e2b] text-xs font-semibold cursor-pointer transition-all">${favorites.includes(id) ? "Favorited" : "Favorite"}</button>
            <label class="inline-flex items-center gap-2 rounded-full bg-[#fff4e7] px-3 py-2 text-[#5a3e2b] text-xs cursor-pointer font-semibold">
              <input data-compare-checkbox data-compare-id="${id}" type="checkbox" ${compare.includes(id) ? "checked" : ""} class="rounded cursor-pointer" />
              Compare
            </label>
          </div>
        </div>
        <a href="listing.html?id=${encodeURIComponent(id)}" class="mt-4 block text-center rounded-full bg-secondary-container px-4 py-2.5 text-xs font-semibold text-on-secondary-container hover:bg-secondary-fixed transition-colors">View Details</a>
      </div>
    </article>
  `;
}

async function renderFeaturedListings() {
  const container = document.getElementById("featured-listings-container");
  if (!container) return;

  const favorites = getStoredFavorites();
  const compare = getStoredCompare();
  container.innerHTML = `<p class="text-sm text-[#5a5145]">Loading properties...</p>`;

  const listings = await loadListings();
  if (!listings.length) {
    container.innerHTML = `<p class="text-sm text-gray-500">No properties available yet. Submit one from the Sell page!</p>`;
    return;
  }
  container.innerHTML = listings.slice(0, 6).map((l) => listingCardHtml(l, favorites, compare)).join("");
  synchronizeSavedButtons();
}

function attachLandingEvents() {
  const searchButton = safeQuery("#landing-search");
  const viewAllButton = safeQuery("#landing-view-all");
  const listLandButton = safeQuery("#landing-list-land");

  if (viewAllButton) viewAllButton.addEventListener("click", () => navigateTo("browse.html"));
  if (listLandButton) listLandButton.addEventListener("click", () => navigateTo("sell.html"));
  if (searchButton) {
    searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(buildSearchUrl());
    });
  }

  document.querySelectorAll("[data-landing-location]").forEach((button) => {
    button.addEventListener("click", () => {
      const city = button.getAttribute("data-landing-location");
      navigateTo(`browse.html?city=${encodeURIComponent(city)}`);
    });
  });
}

function attachBrowsePageEvents() {
  document.getElementById("listings-container")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-button]");
    if (!button) return;
    const id = String(button.getAttribute("data-favorite-button"));
    const favorites = getStoredFavorites();
    const isSaved = favorites.includes(id);
    toggleSavedItem(FAVORITES_STORAGE_KEY, id, !isSaved);
    synchronizeSavedButtons();
    updateBrowseStatus();
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

function populateBrowseFilters() {
  const params = getQueryParams();
  const mappings = {
    "browse-city": "city",
    "browse-landtype": "landType",
    "browse-minprice": "minPrice",
    "browse-maxprice": "maxPrice",
  };
  Object.entries(mappings).forEach(([id, param]) => {
    const element = safeQuery(`#${id}`);
    if (element && params.has(param)) element.value = params.get(param);
  });
}

async function attachPageEvents() {
  attachLandingEvents();
  renderCompareBar();

  if (document.getElementById("featured-listings-container")) {
    await renderFeaturedListings();
  }

  if (safeQuery("#browse-page")) {
    populateBrowseFilters();
    attachBrowsePageEvents();
  }
}

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

window.addEventListener("DOMContentLoaded", attachPageEvents);
