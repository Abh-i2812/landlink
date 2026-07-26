(function (global) {
  const DEFAULT_API_BASE = "http://localhost:3000";
  const USER_KEY = "landlinkUser";

  function resolveApiBase() {
    if (global.LANDLINK_API_BASE) return String(global.LANDLINK_API_BASE).replace(/\/$/, "");
    try {
      const stored = localStorage.getItem("landlinkApiBase");
      if (stored) return stored.replace(/\/$/, "");
    } catch (_) {}
    if (typeof location !== "undefined" && /^https?:/.test(location.origin) && !location.port.match(/5500|8080/)) {
      if (location.port === "3000") return location.origin;
    }
    return DEFAULT_API_BASE;
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function setUser(user) {
    if (!user) localStorage.removeItem(USER_KEY);
    else localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async function request(path, options = {}) {
    const base = resolveApiBase();
    const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    const user = getUser();
    if (user?.token) headers.Authorization = `Bearer ${user.token}`;

    const response = await fetch(`${base}${path}`, {
      ...options,
      headers,
    });

    let data = null;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch (_) {
      data = { raw: text };
    }

    if (!response.ok) {
      const err = new Error(data?.error || data?.message || `Request failed (${response.status})`);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  const LandLinkAPI = {
    getApiBase: resolveApiBase,
    getUser,
    setUser,
    clearUser() {
      setUser(null);
    },

    sendOtp(phone) {
      return request("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
    },

    async verifyOtp({ phone, code, name, role }) {
      const data = await request("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, code, name, role }),
      });
      if (data?.ok && data.user) {
        setUser({
          id: data.user.id,
          phone: data.user.phone,
          name: data.user.name || name || "LandLink User",
          role: data.user.role || role || "BUYER",
          token: data.token,
          loggedInAt: new Date().toISOString(),
        });
      }
      return data;
    },

    getListings(params = {}) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).length) qs.set(k, String(v));
      });
      const suffix = qs.toString() ? `?${qs}` : "";
      return request(`/api/listings${suffix}`);
    },

    getListing(id) {
      return request(`/api/listings/${encodeURIComponent(id)}`);
    },

    createListing(payload) {
      return request("/api/listings", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    toggleFavorite(id) {
      return request(`/api/favorites/${encodeURIComponent(id)}`, { method: "POST" });
    },

    getFavorites() {
      return request("/api/favorites");
    },

    createAppointment(payload) {
      return request("/api/appointments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    getAppointments() {
      return request("/api/appointments");
    },

    createReport(payload) {
      return request("/api/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  };

  global.LandLinkAPI = LandLinkAPI;
})(typeof window !== "undefined" ? window : globalThis);
