/* ===========================
   Root & Rise — app.js
   - Root-level assets
   - Today watering list
   - Plant grid + "Watered" action
   - LocalStorage persistence
   - 90-day Root & Rise rotation
   =========================== */

(() => {
  "use strict";

  /* ---------------------------
     Utilities
  --------------------------- */

  const $ = (sel) => document.querySelector(sel);

  function todayISO() {
    // local date, YYYY-MM-DD
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function daysBetween(isoA, isoB) {
    // isoA, isoB are YYYY-MM-DD
    const a = new Date(`${isoA}T00:00:00`);
    const b = new Date(`${isoB}T00:00:00`);
    const ms = b.getTime() - a.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function safeParseJSON(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
  }

  /* ---------------------------
     Background rotation (optional)
     - Uses your bg-01..bg-04
  --------------------------- */

  const BACKGROUNDS = ["bg-01.png", "bg-02.png", "bg-03.png", "bg-04.png"];

  function setDailyBackground() {
    const start = "2025-01-01"; // arbitrary anchor
    const t = clamp(daysBetween(start, todayISO()), 0, 100000);
    const bg = BACKGROUNDS[t % BACKGROUNDS.length];

    document.documentElement.style.background =
      `linear-gradient(rgba(14,20,18,.92), rgba(14,20,18,.92)), url("./${bg}") center/cover no-repeat fixed`;
  }

  /* ---------------------------
     Plants (baseline)
     - Watering cadence is a sensible default per plant type.
     - We'll refine lighting + exact schedules later with citations.
  --------------------------- */

  const PLANTS = [
    {
      id: "albino-syngonium",
      name: "Albino Syngonium Arrow",
      img: "./albino-syngonium.png",
      waterEveryDays: 7,
      light: "Bright indirect",
      notes: "Let top inch dry; avoid soggy soil."
    },
    {
      id: "prayer-plant",
      name: "Prayer Plant",
      img: "./prayer-plant.png",
      waterEveryDays: 6,
      light: "Medium–bright indirect",
      notes: "Keep evenly moist; hates drying out completely."
    },
    {
      id: "pothos",
      name: "Pothos (x6)",
      img: "./pothos.png",
      waterEveryDays: 10,
      light: "Low–bright indirect",
      notes: "Let top 2\" dry; forgiving."
    },
    {
      id: "snake-plant",
      name: "Snake Plant (x2)",
      img: "./snake-plant.png",
      waterEveryDays: 21,
      light: "Low–bright indirect",
      notes: "Dry between waterings; drought tolerant."
    },
    {
      id: "cactus",
      name: "Cactus",
      img: "./cactus.png",
      waterEveryDays: 28,
      light: "Bright light / sun",
      notes: "Soak then dry completely."
    },
    {
      id: "propagation-station",
      name: "Propagation Station",
      img: "./propagation-station.png",
      waterEveryDays: 7,
      light: "Bright indirect",
      notes: "Change water weekly; rinse vessel."
    },
    {
      id: "monstera",
      name: "Monstera",
      img: "./monstera.png",
      waterEveryDays: 9,
      light: "Bright indirect",
      notes: "Let top 2\" dry; likes chunky mix."
    }
    // If you upload tiny-cacti.png later, we’ll add it cleanly.
  ];

  /* ---------------------------
     Storage
  --------------------------- */

  const STORAGE_KEY = "root-rise:v1";

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = {
      lastWateredById: {}, // { [id]: "YYYY-MM-DD" }
      lastAffirmationIndexByDay: {} // future-proofing
    };
    if (!raw) return base;

    const parsed = safeParseJSON(raw, base);
    return {
      ...base,
      ...parsed,
      lastWateredById: parsed.lastWateredById || {}
    };
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /* ---------------------------
     Root & Rise — 90 day rotation
  --------------------------- */

  const AFFIRMATIONS_90 = [
    // 1–15: grounding + gentleness. (We'll expand/adjust later if desired.)
    "I tend what matters, one small act at a time.",
    "I am allowed to grow slowly.",
    "My care is a spell: quiet, steady, real.",
    "I choose patience over pressure.",
    "What I nurture, nurtures me.",
    "I water roots, not anxiety.",
    "I can be soft and still be strong.",
    "I return to my breath; I return to myself.",
    "I don’t need perfection to be powerful.",
    "I honor the season I’m in.",
    "My home is a sanctuary I build daily.",
    "I trust small rituals to change big things.",
    "I release what’s brittle; I keep what’s true.",
    "I let light in without letting myself burn.",
    "I am becoming, and that is enough.",

    // 16–30
    "I can rest without losing momentum.",
    "My love is practical: it shows up.",
    "I choose consistency over intensity.",
    "Today I do the next right thing.",
    "I am allowed to re-root and begin again.",
    "I listen to what my body is asking for.",
    "I make space for wonder.",
    "I bless the ordinary and it blesses me back.",
    "I don’t chase; I cultivate.",
    "I trust my pace.",
    "I speak to myself like someone I adore.",
    "I am safe to be seen as I am.",
    "I keep my boundaries like garden walls: kind and firm.",
    "I choose clarity over chaos.",
    "My attention is my altar.",

    // 31–45
    "I nourish the parts of me that are quiet.",
    "I let the day be what it is, not what I fear.",
    "I am not behind. I am in motion.",
    "I can hold tenderness and discipline together.",
    "I let beauty be useful.",
    "I honor what I’ve survived.",
    "I welcome change without abandoning myself.",
    "I give my energy to what gives energy back.",
    "I am steady enough to be gentle.",
    "I make room for delight.",
    "I am learning what my life wants to be.",
    "I can be devoted without being depleted.",
    "I do not owe urgency to anyone.",
    "I trust my hands. I trust my heart.",
    "I am held by the work I do with love.",

    // 46–60
    "I plant intentions and let time do its part.",
    "I can pause and still be purposeful.",
    "I am allowed to want more—quietly, fiercely.",
    "I don’t need permission to take up space.",
    "I choose nourishment over noise.",
    "I let my habits be holy.",
    "I forgive myself for being human.",
    "I am building a life that feels like home.",
    "I keep what is sacred close.",
    "I choose the long road with the good soil.",
    "I do not rush what wants to ripen.",
    "I am worthy of care—especially my own.",
    "I welcome ease without guilt.",
    "I keep my promises to myself.",
    "I let love be the strategy.",

    // 61–75
    "I am growing roots as I reach for light.",
    "I can be brave in small ways today.",
    "I make beauty a daily practice.",
    "I tend my mind like a garden: gently, daily.",
    "I release comparison; I return to my path.",
    "I can begin again, even mid-day.",
    "I am stronger than the stories that hurt me.",
    "I choose devotion to what heals.",
    "I let the future arrive on its own feet.",
    "I trust what I’m becoming.",
    "I meet myself with compassion, not critique.",
    "I create space for my magic to breathe.",
    "I honor my needs without apology.",
    "I keep my heart open and my feet grounded.",
    "I am allowed to be unfinished.",

    // 76–90
    "I choose peace as a practice.",
    "I let my life be simple where it can be.",
    "I care for my world like it matters—because it does.",
    "I am not fragile; I am alive.",
    "I can do hard things with a soft heart.",
    "I make time for what makes me feel real.",
    "I let joy be practical.",
    "I welcome rest as part of growth.",
    "I trust the quiet answers.",
    "I am built for seasons, not constant bloom.",
    "I tend my relationships like living things.",
    "I choose presence over perfection.",
    "I am safe to shine without shrinking.",
    "I will not abandon myself.",
    "I rise gently. I rise anyway."
  ];

  function getAffirmationForToday() {
    const anchor = "2025-01-01"; // fixed seed day
    const t = clamp(daysBetween(anchor, todayISO()), 0, 100000);
    const idx = t % AFFIRMATIONS_90.length;
    return { idx, text: AFFIRMATIONS_90[idx] };
  }

  /* ---------------------------
     Watering logic
  --------------------------- */

  function lastWateredISO(state, id) {
    return state.lastWateredById[id] || null;
  }

  function isDueToday(state, plant) {
    // due if never watered OR last watered >= cadence days ago
    const last = lastWateredISO(state, plant.id);
    if (!last) return true;

    const since = daysBetween(last, todayISO());
    return since >= plant.waterEveryDays;
  }

  function markWatered(state, id) {
    state.lastWateredById[id] = todayISO();
    saveState(state);
  }

  /* ---------------------------
     Render
  --------------------------- */

  function renderToday(state) {
    const host = $("#today-list");
    if (!host) return;

    const due = PLANTS.filter(p => isDueToday(state, p));

    if (due.length === 0) {
      host.innerHTML = `
        <div class="today-item" style="justify-content:center;">
          <div class="name">Nothing to water today. Let it be easy.</div>
        </div>
      `;
      return;
    }

    host.innerHTML = due.map(p => {
      const last = lastWateredISO(state, p.id);
      const meta = last ? `Last: ${last}` : `Not tracked yet`;
      return `
        <div class="today-item" data-id="${p.id}">
          <img src="${p.img}" alt="${escapeHTML(p.name)}" />
          <div class="name">
            <div><strong>${escapeHTML(p.name)}</strong></div>
            <div style="opacity:.75;font-size:.82rem;">${escapeHTML(meta)}</div>
          </div>
          <button class="watered-btn" type="button">Watered</button>
        </div>
      `;
    }).join("");

    host.querySelectorAll(".watered-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const row = e.target.closest(".today-item");
        const id = row?.getAttribute("data-id");
        if (!id) return;
        markWatered(state, id);
        // Re-render
        render(state);
      });
    });
  }

  function renderPlants(state) {
    const host = $("#plants");
    if (!host) return;

    host.innerHTML = PLANTS.map(p => {
      const last = lastWateredISO(state, p.id);
      const due = isDueToday(state, p);

      const cadence = `Every ${p.waterEveryDays}d`;
      const lastTxt = last ? `Last: ${last}` : `Last: —`;
      const dueTxt = due ? `Due` : `Not due`;

      return `
        <div class="plant-card" data-id="${p.id}">
          <img src="${p.img}" alt="${escapeHTML(p.name)}" />
          <div class="plant-name"><strong>${escapeHTML(p.name)}</strong></div>
          <div class="meta">${escapeHTML(p.light)} · ${escapeHTML(cadence)}</div>
          <div class="meta">${escapeHTML(lastTxt)} · ${escapeHTML(dueTxt)}</div>
          <div style="margin-top:10px;">
            <button class="watered-btn" type="button">Watered today</button>
          </div>
        </div>
      `;
    }).join("");

    host.querySelectorAll(".watered-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const card = e.target.closest(".plant-card");
        const id = card?.getAttribute("data-id");
        if (!id) return;
        markWatered(state, id);
        render(state);
      });
    });
  }

  function renderAffirmation() {
    const host = $("#affirmation");
    if (!host) return;
    const { text } = getAffirmationForToday();
    host.textContent = text;
  }

  function render(state) {
    renderAffirmation();
    renderToday(state);
    renderPlants(state);
  }

  function escapeHTML(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* ---------------------------
     Boot
  --------------------------- */

  function boot() {
    setDailyBackground();

    const state = loadState();
    render(state);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();