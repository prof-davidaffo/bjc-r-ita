(function () {
  const expectedHash =
    "12a094b16e69ba03efb5be2832ff8ca7e2a59f0677c453afb057b5a6e5a4eb29";
  const data = (window.SOLUTIONS_DATA && window.SOLUTIONS_DATA.units) || [];
  let currentLang = "it";
  let currentUnit = "1";
  const textCache = {};

  function toHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function sha256(text) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return toHex(digest);
  }

  function getUnitById(id) {
    return data.find((u) => u.id === id) || data[0];
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function textToParagraphs(raw) {
    const normalized = String(raw || "").replace(/\r\n/g, "\n");
    const blocks = normalized.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    return blocks
      .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function sourceTextBlock(source) {
    if (!source) return "";
    if (textCache[source]) {
      return `<div class="solution-text">${textToParagraphs(textCache[source])}</div>`;
    }
    return `<div class="solution-text source-text" data-source="${source}">Caricamento testo completo...</div>`;
  }

  function textBlock(text) {
    if (!text) return "";
    const source = currentLang === "it" ? text.sourceIt : text.source;
    if (!source) {
      return `<details><summary>Soluzioni (testo)</summary><div class="solution-text"><p>Testo non disponibile in questa lingua.</p></div></details>`;
    }
    return `<details><summary>Soluzioni (testo)</summary>${sourceTextBlock(source)}</details>`;
  }

  function sectionHtml(unit, section) {
    const files = Array.isArray(section.files) ? section.files : [];
    const links = files.length
      ? `<ul class="solutions-list">${files
          .map((file) => `<li><a class="run" href="${unit.basePath}${file}">${file.replace(/\.xml$/, "")}</a></li>`)
          .join("")}</ul>`
      : "";
    const text = textBlock(section.text);
    return `<section><h3 class="section-title">${section.title}</h3>${links}${text}</section>`;
  }

  function renderUnitTabs() {
    const tabs = document.getElementById("unit-tabs");
    tabs.innerHTML = data
      .map(
        (u) =>
          `<button type="button" class="chip ${u.id === currentUnit ? "active" : ""}" data-unit="${u.id}">${u.label}</button>`
      )
      .join("");
    tabs.querySelectorAll("[data-unit]").forEach((btn) => {
      btn.addEventListener("click", function () {
        currentUnit = this.getAttribute("data-unit");
        localStorage.setItem("solutionsUnit", currentUnit);
        history.replaceState({}, "", `/bjc-r-ita/solutions/index.html?unit=${currentUnit}`);
        render();
      });
    });
  }

  function render() {
    renderUnitTabs();
    const unit = getUnitById(currentUnit);
    const content = document.getElementById("unit-content");
    if (!unit.sections || !unit.sections.length) {
      content.innerHTML = `<h2>${unit.label}</h2><p class="empty-note">Nessun contenuto disponibile al momento.</p>`;
      return;
    }
    content.innerHTML =
      `<h2>${unit.label}</h2>` +
      unit.sections.map((s) => sectionHtml(unit, s)).join("");
    hydrateSourceTexts();
  }

  async function hydrateSourceTexts() {
    const nodes = document.querySelectorAll(".source-text[data-source]");
    for (const node of nodes) {
      const source = node.getAttribute("data-source");
      if (!source) continue;
      try {
        if (!textCache[source]) {
          const res = await fetch(source, { cache: "no-store" });
          if (!res.ok) throw new Error("fetch failed");
          textCache[source] = await res.text();
        }
        node.innerHTML = textToParagraphs(textCache[source]);
        node.classList.remove("source-text");
      } catch (err) {
        node.innerHTML = "<p>Impossibile caricare il testo completo.</p>";
      }
    }
  }

  function setLanguage(lang) {
    currentLang = lang === "en" ? "en" : "it";
    localStorage.setItem("solutionsTextLang", currentLang);
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
    });
    render();
  }

  async function unlock() {
    const input = document.getElementById("solutions-password");
    const error = document.getElementById("solutions-error");
    const content = document.getElementById("solutions-content");
    error.textContent = "";

    const digest = await sha256(input.value || "");
    if (digest === expectedHash) {
      content.style.display = "block";
      document.getElementById("auth-box").style.display = "none";
      localStorage.setItem("solutionsUnlocked", "1");
      input.value = "";
      render();
    } else {
      error.textContent = "Password errata.";
    }
  }

  function initState() {
    const params = new URLSearchParams(window.location.search);
    currentUnit = params.get("unit") || localStorage.getItem("solutionsUnit") || "1";
    if (!getUnitById(currentUnit)) currentUnit = "1";
    setLanguage(localStorage.getItem("solutionsTextLang") || "it");

    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", function () {
        setLanguage(this.getAttribute("data-lang"));
      });
    });

    document.getElementById("solutions-unlock").addEventListener("click", unlock);
    document.getElementById("solutions-password").addEventListener("keydown", function (e) {
      if (e.key === "Enter") unlock();
    });

    if (localStorage.getItem("solutionsUnlocked") === "1") {
      document.getElementById("solutions-content").style.display = "block";
      document.getElementById("auth-box").style.display = "none";
      render();
    }
  }

  initState();
})();
