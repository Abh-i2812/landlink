(function () {
  const TOKEN_USER_KEY = "landlinkUser";

  function requireAdmin() {
    const user = window.LandLinkAPI?.getUser?.();
    if (!user?.token || user.role !== "ADMIN") {
      location.href = "login.html";
      return null;
    }
    return user;
  }

  function logout() {
    window.LandLinkAPI?.clearUser?.();
    location.href = "login.html";
  }

  function nav(active) {
    const items = [
      ["index.html", "Dashboard"],
      ["users.html", "Users"],
      ["listings.html", "Listings"],
      ["submissions.html", "Submissions"],
      ["appointments.html", "Appointments"],
      ["reports.html", "Reports"],
      ["blog.html", "Blog"],
      ["settings.html", "Settings"],
    ];
    return `
      <aside class="w-64 shrink-0 bg-[#412817] text-[#fff8f0] min-h-screen p-6">
        <div class="text-xl font-bold mb-8">LandLink Admin</div>
        <nav class="space-y-2 text-sm">
          ${items
            .map(
              ([href, label]) =>
                `<a href="${href}" class="block rounded-xl px-3 py-2 ${active === href ? "bg-[#fdba4b] text-[#281800] font-semibold" : "hover:bg-white/10"}">${label}</a>`,
            )
            .join("")}
        </nav>
        <button onclick="AdminCommon.logout()" class="mt-10 text-sm underline opacity-80">Log out</button>
        <p class="mt-6 text-xs opacity-70">API: ${window.LandLinkAPI?.getApiBase?.() || ""}</p>
      </aside>`;
  }

  function shell(active, title, bodyHtml) {
    document.body.innerHTML = `
      <div class="flex min-h-screen bg-[#fff8f0] text-[#1e1b16]" style="font-family:'Plus Jakarta Sans',sans-serif">
        ${nav(active)}
        <main class="flex-1 p-8">
          <h1 class="text-3xl font-semibold text-[#412817] mb-6">${title}</h1>
          ${bodyHtml}
        </main>
      </div>`;
  }

  function toast(msg) {
    alert(msg);
  }

  window.AdminCommon = { requireAdmin, logout, shell, toast, TOKEN_USER_KEY };
})();
