(() => {
  "use strict";

  /* ---------------------------
     Utilities
  --------------------------- */
  const $ = (sel) => document.querySelector(sel);

  function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function daysBetween(isoA, isoB) {
    const a = new Date(`${isoA}T00:00:00`);
    const b = new Date(`${isoB}T00:00:00`);
    const ms = b.getTime() - a.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  function addDaysISO(iso, n) {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + n);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function safeParseJSON(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
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
     Background rotation
  --------------------------- */
  const BACKGROUNDS = ["bg-01.png", "bg-02.png", "bg-03.png", "bg-04.png"];

  function setDailyBackground() {
    const anchor = "2025-01-01";
    const t = clamp(daysBetween(anchor, todayISO()), 0, 100000);
    const bg = BACKGROUNDS[t % BACKGROUNDS.length];
    document.documentElement.style.background =
      `linear-gradient(rgba(14,20,18,.92), rgba(14,20,18,.92)), url("./${bg}") center/cover no-repeat fixed`;
  }

  /* ---------------------------
     Plant Database (baseline, will refine later)
     Key rule: Jess should not have to remember anything.
  --------------------------- */
  const PLANTS = [
    {
      id: "albino-syngonium",
      name: "Albino Syngonium Arrow",
      img: "./albino-syngonium.png",
      waterEveryDays: 7,
      light: "Bright indirect light (avoid harsh sun).",
      water: "Water when top 1–2 inches are dry. Soak through, then drain fully.",
      humidity: "Medium–high preferred.",
      temp: "65–85°F (avoid cold drafts).",
      soil: "Chunky, well-draining aroid mix (bark/perlite/coco).",
      fertilize: "Light feeding monthly in spring/summer.",
      toxicity: "Toxic to pets if chewed.",
      tips: "Droop = thirsty; yellowing = too wet. Rotate for even growth."
    },
    {
      id: "prayer-plant",
      name: "Prayer Plant",
      img: "./prayer-plant.png",
      waterEveryDays: 6,
      light: "Medium to bright indirect (no direct sun).",
      water: "Keep lightly moist; water when top 1 inch is dry. Don’t let it fully dry out.",
      humidity: "High humidity helps (bathroom/pebble tray).",
      temp: "65–80°F (sensitive to cold).",
      soil: "Moisture-retentive but airy (coco + perlite).",
      fertilize: "Half-strength every 4–6 weeks in growing season.",
      toxicity: "Generally considered non-toxic, still discourage chewing.",
      tips: "Curling leaves often means dry air or underwatering."
    },
    {
      id: "pothos",
      name: "Pothos (x6)",
      img: "./pothos.png",
      waterEveryDays: 10,
      light: "Low to bright indirect (variegated types like brighter).",
      water: "Water when top 2 inches are dry. They prefer a dry-down cycle.",
      humidity: "Normal home humidity is fine.",
      temp: "60–85°F.",
      soil: "Standard indoor mix with added perlite.",
      fertilize: "Monthly in spring/summer (light dose).",
      toxicity: "Toxic to pets if ingested.",
      tips: "Leggy growth = wants more light. Yellow leaves = too wet."
    },
    {
      id: "snake-plant",
      name: "Snake Plant (x2)",
      img: "./snake-plant.png",
      waterEveryDays: 21,
      light: "Low to bright indirect; tolerates low light.",
      water: "Let soil dry completely before watering. Water sparingly.",
      humidity: "Low humidity is fine.",
      temp: "60–90°F (avoid cold).",
      soil: "Cactus/succulent mix (fast draining).",
      fertilize: "A few times during spring/summer only.",
      toxicity: "Toxic to pets if ingested.",
      tips: "Soft/mushy base = overwatering. Slow grower—be patient."
    },
    {
      id: "cactus",
      name: "Cactus",
      img: "./cactus.png",
      waterEveryDays: 28,
      light: "Bright light / some direct sun.",
      water: "Soak thoroughly, then allow to dry completely (long dry spells are normal).",
      humidity: "Low humidity preferred.",
      temp: "Warm is ideal; protect from freezing.",
      soil: "Cactus mix (gritty, fast draining).",
      fertilize: "Very light feeding in spring/summer.",
      toxicity: "Spines are the main hazard; keep away from paws.",
      tips: "Wrinkling = thirsty; mushy = too wet."
    },
    {
      id: "propagation-station",
      name: "Propagation Station",
      img: "./propagation-station.png",
      waterEveryDays: 7,
      light: "Bright indirect (avoid hot sun).",
      water: "Change water weekly. Rinse vessel. Top off if low mid-week.",
      humidity: "Normal is fine; higher can speed rooting.",
      temp: "Warm room (65–80°F).",
      soil: "N/A (water propagation).",
      fertilize: "Optional: tiny dose once roots exist (very dilute).",
      toxicity: "Depends on cuttings; assume toxic unless known.",
      tips: "Cloudy water = change it. Trim rot early."
    },
    {
      id: "monstera",
      name: "Monstera",
      img: "./monstera.png",
      waterEveryDays: 9,
      light: "Bright indirect (a little morning sun is okay).",
      water: "Water when top 2 inches are dry. Soak, drain, don’t leave sitting in water.",
      humidity: "Medium–high preferred.",
      temp: "65–85°F.",
      soil: "Chunky aroid mix (bark/perlite).",
      fertilize: "Monthly in spring/summer.",
      toxicity: "Toxic to pets if chewed.",
      tips: "No fenestrations = wants brighter light. Wipe leaves occasionally."
    }
  ];

  /* ---------------------------
     Storage
  --------------------------- */
  const STORAGE_KEY = "root-rise:v2";

  function loadState() {
    const base = {
      lastWateredById: {},     // id -> YYYY-MM-DD
      snoozeUntilById: {}      // id -> YYYY-MM-DD
    };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = safeParseJSON(raw, base);
    return {
      ...base,
      ...parsed,
      lastWateredById: parsed.lastWateredById || {},
      snoozeUntilById: parsed.snoozeUntilById || {}
    };
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resetState() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /* ---------------------------
     Root & Rise cycles
  --------------------------- */
  const AFFIRMATIONS_90 = [
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

  const GROUNDING_45 = [
    "Drink a full glass of water slowly.",
    "Stand barefoot for one minute. Feel the ground.",
    "Take 5 slow breaths (longer exhale).",
    "Open a window. Let air move through you.",
    "Touch a plant or soil for 10 seconds.",
    "Roll your shoulders and unclench your jaw.",
    "Look at something green for one minute.",
    "Stretch your spine gently upward.",
    "Light a candle (or imagine one).",
    "Name three things you can hear right now.",

    "Wash your hands slowly and deliberately.",
    "Drink something warm mindfully.",
    "Tidy one small surface (just one).",
    "Step outside for 60 seconds.",
    "Place a hand on your chest and breathe.",
    "Relax your hands; let your fingers soften.",
    "Take a slow walk across the room.",
    "Notice where your body is supported.",
    "Gaze at the sky (even through a window).",
    "Do a gentle neck stretch left and right.",

    "Water one plant with full attention.",
    "Inhale through the nose, exhale through the mouth.",
    "Feel your feet pressing into the floor.",
    "Sit without your phone for two minutes.",
    "Sip water like it’s medicine.",
    "Brush your hair slowly (or smooth your sleeves).",
    "Stand tall for one minute: soft and steady.",
    "Take 10 slow shoulder circles.",
    "Touch something textured (stone, wood, cloth).",
    "Offer yourself one kind sentence.",

    "Clean one leaf (real or imagined).",
    "Let your face soften—especially the brow.",
    "Breathe: in 4, out 6 (x5).",
    "Look for one beautiful detail in the room.",
    "Do a gentle forward fold for 20 seconds.",
    "Rest your tongue on the roof of your mouth and release the jaw.",
    "Close your eyes for 30 seconds and listen.",
    "Refill a water vessel (yours or theirs).",
    "Stand in silence for one minute.",
    "Thank your body for carrying you.",

    "Put both hands on a mug or cup; feel warmth/coolness.",
    "Stretch your wrists and hands gently.",
    "Let your shoulders drop; exhale slowly.",
    "Touch your heart; whisper “I’m here.”",
    "Choose one small thing to do with devotion."
  ];

  function getCyclesForToday() {
    const anchor = "2025-01-01";
    const t = clamp(daysBetween(anchor, todayISO()), 0, 100000);
    const aIdx = t % AFFIRMATIONS_90.length;
    const gIdx = t % GROUNDING_45.length;
    return {
      dayIndex: t,
      affirmationIndex: aIdx,
      groundingIndex: gIdx,
      affirmation: AFFIRMATIONS_90[aIdx],
      grounding: GROUNDING_45[gIdx]
    };
  }

  /* ---------------------------
     Watering logic + snooze
  --------------------------- */
  function lastWateredISO(state, id) {
    return state.lastWateredById[id] || null;
  }

  function snoozeUntilISO(state, id) {
    return state.snoozeUntilById[id] || null;
  }

  function isSnoozed(state, id) {
    const until = snoozeUntilISO(state, id);
    if (!until) return false;
    return todayISO() <= until;
  }

  function isDueToday(state, plant) {
    if (isSnoozed(state, plant.id)) return false;

    const last = lastWateredISO(state, plant.id);
    if (!last) return true;

    const since = daysBetween(last, todayISO());
    return since >= plant.waterEveryDays;
  }

  function markWatered(state, id) {
    state.lastWateredById[id] = todayISO();
    delete state.snoozeUntilById[id];
    saveState(state);
  }

  function snooze(state, id, days) {
    const until = addDaysISO(todayISO(), days);
    state.snoozeUntilById[id] = until;
    saveState(state);
  }

  /* ---------------------------
     Modal controls
  --------------------------- */
  const modal = $("#modal");
  const help = $("#help");

  function openModal(el) {
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal(el) {
    el.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function wireModalClose(el, closeBtnId) {
    const closeBtn = $(`#${closeBtnId}`);
    closeBtn?.addEventListener("click", () => closeModal(el));
    el.querySelectorAll("[data-close='true']").forEach(n => {
      n.addEventListener("click", () => closeModal(el));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.getAttribute("aria-hidden") === "false") closeModal(el);
    });
  }

  wireModalClose(modal, "modal-close");
  wireModalClose(help, "help-close");

  $("#btn-help")?.addEventListener("click", () => openModal(help));
  $("#btn-reset")?.addEventListener("click", () => {
    if (!confirm("Reset all watering history and snoozes?")) return;
    resetState();
    state = loadState();
    render();
  });

  /* ---------------------------
     Rendering
  --------------------------- */
  let state = loadState();

  function renderHeader() {
    const date = todayISO();
    $("#today-date").textContent = date;
  }

  function renderRitual() {
    const c = getCyclesForToday();
    $("#affirmation").textContent = c.affirmation;
    $("#grounding").innerHTML = `<strong class="muted">Today’s grounding:</strong> ${escapeHTML(c.grounding)}`;
    $("#cycle-meta").textContent = `Affirmation ${c.affirmationIndex + 1}/90 · Grounding ${c.groundingIndex + 1}/45`;
  }

  function renderToday() {
    const host = $("#today-list");
    const empty = $("#today-empty");
    const due = PLANTS.filter(p => isDueToday(state, p));

    if (due.length === 0) {
      empty.hidden = false;
      host.innerHTML = "";
      return;
    }

    empty.hidden = true;

    host.innerHTML = due.map(p => {
      const last = lastWateredISO(state, p.id);
      const lastTxt = last ? `Last: ${last}` : `Last: —`;
      return `
        <div class="today-item" data-id="${p.id}">
          <img src="${p.img}" alt="${escapeHTML(p.name)}" />
          <div class="today-main">
            <div class="today-title">
              <div class="today-name">${escapeHTML(p.name)}</div>
              <span class="badge due">Due</span>
            </div>
            <div class="today-quick">
              <span class="pill"><strong>Light:</strong> ${escapeHTML(p.light)}</span>
              <span class="pill"><strong>Water:</strong> ${escapeHTML(p.water)}</span>
              <span class="pill">${escapeHTML(lastTxt)} · Every ${p.waterEveryDays}d</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button class="primary btn-water" type="button">Watered</button>
            <button class="ghost btn-details" type="button">Details</button>
          </div>
        </div>
      `;
    }).join("");

    host.querySelectorAll(".btn-water").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const row = e.target.closest(".today-item");
        const id = row?.getAttribute("data-id");
        if (!id) return;
        markWatered(state, id);
        render();
      });
    });

    host.querySelectorAll(".btn-details").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const row = e.target.closest(".today-item");
        const id = row?.getAttribute("data-id");
        if (!id) return;
        showPlantModal(id);
      });
    });
  }

  function renderLibrary() {
    const host = $("#plants-grid");

    host.innerHTML = PLANTS.map(p => {
      const due = isDueToday(state, p);
      const snoozed = isSnoozed(state, p.id);
      const flag = due ? `<span class="badge due">Due</span>` : snoozed ? `<span class="badge ok">Snoozed</span>` : `<span class="badge ok">OK</span>`;
      const last = lastWateredISO(state, p.id);
      const lastTxt = last ? `Last: ${last}` : `Last: —`;

      return `
        <div class="plant-card" data-id="${p.id}" role="button" tabindex="0" aria-label="Open ${escapeHTML(p.name)} details">
          <img src="${p.img}" alt="${escapeHTML(p.name)}" />
          <div class="plant-name">${escapeHTML(p.name)}</div>
          <div class="plant-meta">${escapeHTML(lastTxt)} · Every ${p.waterEveryDays}d</div>
          <div class="plant-flag">${flag}</div>
        </div>
      `;
    }).join("");

    host.querySelectorAll(".plant-card").forEach(card => {
      const open = () => {
        const id = card.getAttribute("data-id");
        if (!id) return;
        showPlantModal(id);
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function showPlantModal(id) {
    const plant = PLANTS.find(p => p.id === id);
    if (!plant) return;

    const due = isDueToday(state, plant);
    const snoozed = isSnoozed(state, plant.id);
    const last = lastWateredISO(state, plant.id);
    const lastTxt = last ? `Last watered: ${last}` : `Last watered: —`;
    const cycleTxt = `Watering cycle: every ${plant.waterEveryDays} days`;
    const snoozeTxt = snoozed ? `Snoozed until: ${snoozeUntilISO(state, plant.id)}` : "";

    $("#modal-title").textContent = plant.name;
    $("#modal-subtitle").textContent = plant.id.replaceAll("-", " ");
    $("#modal-img").src = plant.img;
    $("#modal-img").alt = plant.name;

    const statusEl = $("#modal-status");
    statusEl.className = "badge " + (due ? "due" : "ok");
    statusEl.textContent = due ? "Due today" : snoozed ? "Snoozed" : "Not due";

    $("#modal-last").textContent = lastTxt + (snoozeTxt ? ` · ${snoozeTxt}` : "");
    $("#modal-cycle").textContent = cycleTxt;

    const facts = [
      ["Light", plant.light],
      ["Water", plant.water],
      ["Soil", plant.soil],
      ["Humidity", plant.humidity],
      ["Temperature", plant.temp],
      ["Fertilizer", plant.fertilize],
      ["Toxicity", plant.toxicity],
      ["Notes", plant.tips]
    ];

    $("#modal-facts").innerHTML = facts.map(([k,v]) => `
      <div class="fact">
        <div class="k">${escapeHTML(k)}</div>
        <div class="v">${escapeHTML(v || "—")}</div>
      </div>
    `).join("");

    $("#modal-watered").onclick = () => {
      markWatered(state, plant.id);
      closeModal(modal);
      render();
    };

    $("#modal-snooze").onclick = () => {
      snooze(state, plant.id, 2);
      closeModal(modal);
      render();
    };

    openModal(modal);
  }

  function render() {
    setDailyBackground();
    renderHeader();
    renderRitual();
    renderToday();
    renderLibrary();
  }

  /* Boot */
  function boot() {
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();