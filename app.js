/* Root & Rise — app.js
   - Vanilla JS, localStorage persistence
   - Layout:
     1) Plant tiles (2 columns) — always visible, no text on tiles
        • Tiles glow + embers ONLY when due for care
        • Click tile -> Plant Detail modal (full info + “Cared For” button)
     2) Root & Rise card section
        • Affirmation on glass panel over root-rise-card image
     3) Grounding action panel
     4) “Cared For” recent list (not “watered”)
*/

(() => {
  "use strict";

  /* =========================
     CONFIG: Assets in REPO ROOT
     ========================= */
  const ASSETS = {
    bg: "bg-01.png",              // page background
    rootRiseCard: "root-rise-card.png",
    plants: {
      "albino-syngonium": "albino-syngonium.png",
      "prayer-plant": "prayer-plant.png",
      "pothos": "pothos.png",
      "snake-plant": "snake-plant.png",
      "cactus": "cactus.png",
      "propagation-station": "propagation-station.png",
      "monstera": "monstera.png",
      // Optional if you add later:
      "tiny-cactus": "tiny-cactus.png"
    }
  };

  /* =========================
     DATA: Plants + Care Guidance
     Notes:
     - These are “baseline” schedules. Real life varies with pot size, soil, light, season.
     - We’ll present it as guidance + a “Check soil” instruction, not a rigid law.
     ========================= */
  const PLANTS = [
    {
      id: "albino-syngonium",
      name: "Albino Syngonium Arrow",
      imageKey: "albino-syngonium",
      countLabel: "",
      careIntervalDays: 7,
      careType: "Water (when top inch is dry)",
      lighting: "Bright, indirect light. Avoid harsh direct sun.",
      wateringDetail:
        "Let the top ~1 inch of soil dry, then water thoroughly. Likes evenly moist soil but not soggy.",
      notes:
        "Albino/variegated leaves need brighter indirect light to hold color. If it dries too hard, it sulks."
    },
    {
      id: "prayer-plant",
      name: "Prayer Plant",
      imageKey: "prayer-plant",
      countLabel: "",
      careIntervalDays: 6,
      careType: "Water (keep lightly moist)",
      lighting: "Medium to bright indirect light. No direct sun.",
      wateringDetail:
        "Prefers slightly moist soil. Water when top ~1/2 inch is dry. Use filtered/low-mineral water if leaf tips brown.",
      notes:
        "Higher humidity = happier leaves. If it curls, it’s asking for water/humidity."
    },
    {
      id: "pothos",
      name: "Pothos",
      imageKey: "pothos",
      countLabel: "(x6)",
      careIntervalDays: 10,
      careType: "Water (when top 1–2 inches are dry)",
      lighting: "Low to bright indirect light. Tolerates low light.",
      wateringDetail:
        "Let the top 1–2 inches dry, then water. Overwatering is the #1 killer.",
      notes:
        "If growth slows, give brighter indirect light. Trim + propagate to thicken."
    },
    {
      id: "snake-plant",
      name: "Snake Plant",
      imageKey: "snake-plant",
      countLabel: "(x2)",
      careIntervalDays: 21,
      careType: "Water (only when fully dry)",
      lighting: "Low to bright indirect light. Handles a lot.",
      wateringDetail:
        "Let soil dry out completely. Water sparingly. In winter, even less.",
      notes:
        "If you’re unsure, wait. Snake plants prefer neglect over fuss."
    },
    {
      id: "cactus",
      name: "Cactus",
      imageKey: "cactus",
      countLabel: "",
      careIntervalDays: 28,
      careType: "Water (sparingly; fully dry)",
      lighting: "Bright light, some direct sun is usually fine.",
      wateringDetail:
        "Soak, then let dry fully. If it’s in a small pot/bright sun it may need slightly more often.",
      notes:
        "If it’s soft or translucent, it’s overwatered. If wrinkled, it’s thirsty."
    },
    {
      id: "tiny-cactus",
      name: "Tiny Cacti",
      imageKey: "tiny-cactus",
      countLabel: "(x4)",
      careIntervalDays: 21,
      careType: "Water (sparingly; fully dry)",
      lighting: "Bright light, some direct sun usually fine.",
      wateringDetail:
        "Small pots dry fast, but still: let dry fully. Water lightly, not constantly.",
      notes:
        "If you don’t have a tiny-cactus.png yet, the app will fall back to cactus image."
    },
    {
      id: "propagation-station",
      name: "Propagation Station",
      imageKey: "propagation-station",
      countLabel: "",
      careIntervalDays: 3,
      careType: "Refresh water / rinse vessel",
      lighting: "Bright indirect light (avoid hot direct sun on jars).",
      wateringDetail:
        "Top off as needed; full refresh every few days. Rinse slime off stems and glass.",
      notes:
        "Clean water = fewer rot problems. Snip mushy ends immediately."
    },
    {
      id: "monstera",
      name: "Monstera",
      imageKey: "monstera",
      countLabel: "",
      careIntervalDays: 10,
      careType: "Water (when top 2 inches are dry)",
      lighting: "Bright, indirect light. Gentle morning sun OK.",
      wateringDetail:
        "Water when top ~2 inches are dry. Likes a thorough soak, then drainage.",
      notes:
        "Rotate for even growth. If leaves are small/no fenestration: more light."
    }
  ];

  /* =========================
     ROTATION: 90 affirmations + 45 grounding actions
     - Deterministic daily pick: based on local date (no counters shown).
     ========================= */
  const AFFIRMATIONS = [
    // 90 — short, witchy, tender, not cringe. No numbering in UI.
    "What I nurture, nurtures me.",
    "My pace is sacred.",
    "I grow in seasons, not deadlines.",
    "I can be soft and powerful at once.",
    "My attention is my magic.",
    "I am allowed to begin again.",
    "I choose steady over frantic.",
    "My breath returns me to myself.",
    "I trust the quiet work.",
    "I am worthy of gentle care.",
    "I can rest without guilt.",
    "I honor my energy like a flame.",
    "I release what isn’t mine to hold.",
    "My inner world is a garden.",
    "I make room for good things.",
    "I protect my peace with devotion.",
    "I am learning how to receive.",
    "I listen to my body’s wisdom.",
    "I move with intention.",
    "My softness is not weakness.",
    "I keep what nourishes me.",
    "I let the small wins count.",
    "I am not behind. I am becoming.",
    "I tend my life with patience.",
    "I can do hard things gently.",
    "I am safe in my own presence.",
    "I am allowed to take up space.",
    "I choose clarity over chaos.",
    "I speak to myself with kindness.",
    "I honor what I’ve survived.",
    "I am building a life that fits.",
    "I let simplicity be powerful.",
    "I water my own roots first.",
    "I can pause and still be worthy.",
    "I trust my intuition’s whisper.",
    "I release comparison.",
    "I am more than my productivity.",
    "I am allowed to want what I want.",
    "My boundaries are blessings.",
    "I choose calm on purpose.",
    "I can be patient with my healing.",
    "My needs are not an inconvenience.",
    "I bless my path, even when foggy.",
    "I am learning my own rhythm.",
    "I make space for joy.",
    "I am held by the earth beneath me.",
    "I give myself permission to feel.",
    "I am not too much.",
    "I choose honest progress.",
    "I return to my center.",
    "My heart knows the way.",
    "I am guided by what is true.",
    "I can start small and still succeed.",
    "I honor my limits without shame.",
    "I let my life be mine.",
    "I trust the slow unfolding.",
    "I am allowed to be proud.",
    "I choose peace as a practice.",
    "I am learning to trust myself.",
    "I am becoming more me.",
    "I am safe to shine.",
    "I welcome supportive change.",
    "I release what drains me.",
    "I am cultivating steadiness.",
    "I can be brave and tired.",
    "I let rest be productive.",
    "I choose devotion to my well-being.",
    "I practice softness with myself.",
    "I am rooted in what matters.",
    "I rise without rushing.",
    "I am allowed to do this differently.",
    "I choose what aligns.",
    "I am building trust with myself.",
    "I keep promises to my spirit.",
    "I honor my tenderness.",
    "I can be present right now.",
    "I am worthy of being cared for.",
    "I choose the next right step.",
    "I let the day be enough.",
    "I practice courage in small ways.",
    "I protect my magic.",
    "I belong in my own life.",
    "I breathe in steadiness.",
    "I release the need to prove.",
    "I listen, then I act.",
    "I am guided by devotion.",
    "I am allowed to enjoy this.",
    "I choose a softer story.",
    "I trust my becoming."
  ].slice(0, 90);

  const GROUNDING_ACTIONS = [
    // 45 — concrete, quick, doable
    "Drink a full glass of water before anything else.",
    "Stand barefoot for 60 seconds and feel the floor hold you.",
    "Open a window. Take five slow breaths.",
    "Wipe one small surface until it shines.",
    "Do a 2-minute shoulder roll + neck stretch.",
    "Light a candle and watch the flame for one minute.",
    "Put on one song and move however your body wants.",
    "Water only the plants that are due — nothing extra.",
    "Rinse your hands in cool water and reset.",
    "Write one sentence: “Today I need…”",
    "Make your bed with deliberate calm.",
    "Step outside and look at the sky for 30 seconds.",
    "Tidy one tiny corner (a drawer, a shelf, a table edge).",
    "Do 10 slow squats or 10 wall push-ups.",
    "Make tea and drink it without multitasking for 3 minutes.",
    "Name 5 things you can see, 4 feel, 3 hear, 2 smell, 1 taste.",
    "Brush your hair slowly like it’s a ritual.",
    "Put your phone down face-down for 10 minutes.",
    "Wash a few dishes as an offering to future-you.",
    "Write a gratitude list with exactly 3 items.",
    "Stretch your calves + feet for 2 minutes.",
    "Stand tall and unclench your jaw.",
    "Take a short walk to the mailbox and back.",
    "Pick one task. Do it for 5 minutes. Stop.",
    "Hold something warm (mug, blanket) and breathe slowly.",
    "Do a 60-second plank or a gentle alternative.",
    "Clean your propagation station water if it’s due.",
    "Mist/humidify for the prayer plant (if you do that).",
    "Look at a plant closely and notice three details.",
    "Write one kind sentence to yourself.",
    "Do a slow forward fold and breathe into your back.",
    "Put on lotion intentionally — hands, arms, or legs.",
    "Step into sunlight (or bright window) for 1 minute.",
    "Pick tomorrow’s outfit now (reduce morning friction).",
    "Make a “done list” of what you already handled today.",
    "Turn off one unnecessary light and enjoy the dim.",
    "Sit with your feet planted and breathe for 90 seconds.",
    "Toss one thing you don’t need (trash, junk mail, expired item).",
    "Pull one weed / remove one dead leaf — tiny tending.",
    "Place a hand on your chest: inhale “here”, exhale “now”.",
    "Do 5 slow, deep belly breaths.",
    "Roll a tennis ball under your foot for 1 minute.",
    "Wipe your phone screen. Clean slate.",
    "Wash your face slowly like a blessing.",
    "Say out loud: “I am safe. I am here.”"
  ].slice(0, 45);

  /* =========================
     STORAGE KEYS
     ========================= */
  const STORAGE = {
    plantState: "rr.plantState.v1",      // { [plantId]: { lastCaredISO: "YYYY-MM-DD" } }
    caredLog: "rr.caredLog.v1"           // [{ plantId, plantName, tsISO }]
  };

  /* =========================
     HELPERS
     ========================= */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseISODate(iso) {
    // iso: YYYY-MM-DD
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function diffDays(a, b) {
    // b - a in whole days
    const ms = 24 * 60 * 60 * 1000;
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((ub - ua) / ms);
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function safeJSONParse(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
  }

  function loadPlantState() {
    return safeJSONParse(localStorage.getItem(STORAGE.plantState), {}) || {};
  }

  function savePlantState(state) {
    localStorage.setItem(STORAGE.plantState, JSON.stringify(state));
  }

  function loadCaredLog() {
    return safeJSONParse(localStorage.getItem(STORAGE.caredLog), []) || [];
  }

  function saveCaredLog(log) {
    localStorage.setItem(STORAGE.caredLog, JSON.stringify(log));
  }

  function daySeed() {
    // deterministic seed from local date
    const iso = todayISO();
    let h = 2166136261;
    for (let i = 0; i < iso.length; i++) {
      h ^= iso.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pickDaily(arr) {
    if (!arr.length) return "";
    const seed = daySeed();
    const idx = seed % arr.length;
    return arr[idx];
  }

  function plantImageURL(plant) {
    const key = plant.imageKey;
    if (key === "tiny-cactus" && !ASSETS.plants["tiny-cactus"]) return ASSETS.plants.cactus;
    return ASSETS.plants[key] || "";
  }

  function computeDue(plant, state) {
    const tISO = todayISO();
    const t = parseISODate(tISO);

    const last = state[plant.id]?.lastCaredISO;
    if (!last) {
      // Never cared for: treat as due “today” so the tile glows until first care.
      return { isDue: true, daysSince: null, daysUntil: 0, lastCaredISO: null };
    }

    const lastD = parseISODate(last);
    const daysSince = diffDays(lastD, t);
    const interval = plant.careIntervalDays;
    const daysUntil = interval - daysSince;

    return {
      isDue: daysUntil <= 0,
      daysSince,
      daysUntil: clamp(daysUntil, -999, 999),
      lastCaredISO: last
    };
  }

  function formatNiceDate(iso) {
    if (!iso) return "Not yet tracked";
    const d = parseISODate(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  /* =========================
     UI RENDER
     ========================= */
  function mountApp() {
    const root = document.getElementById("app");
    if (!root) {
      console.error("Root & Rise: missing #app element.");
      return;
    }

    // Apply background image to body via JS so you can keep CSS clean.
    document.body.style.backgroundImage = `url("${ASSETS.bg}")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";

    root.innerHTML = `
      <div class="rr-shell">
        <header class="rr-header">
          <h1 class="rr-title">Root &amp; Rise</h1>
          <div class="rr-sub">Tend what grows. Tend yourself.</div>
        </header>

        <section class="rr-section rr-tiles" aria-label="Plants">
          <div class="rr-tiles-grid" id="tilesGrid"></div>
        </section>

        <section class="rr-section rr-card" aria-label="Root and Rise card">
          <div class="rr-card-wrap">
            <img class="rr-card-img" src="${ASSETS.rootRiseCard}" alt="" aria-hidden="true" />
            <div class="rr-card-glass" id="affirmationGlass" role="note"></div>
          </div>
          <div class="rr-grounding" id="groundingPanel" role="note"></div>
        </section>

        <section class="rr-section rr-cared" aria-label="Recently cared for">
          <div class="rr-section-title">Recently cared for</div>
          <div class="rr-cared-list" id="caredList"></div>
        </section>

        <div class="rr-modal-backdrop" id="modalBackdrop" hidden>
          <div class="rr-modal" role="dialog" aria-modal="true" aria-label="Plant details">
            <button class="rr-modal-close" id="modalClose" aria-label="Close">×</button>
            <div class="rr-modal-body" id="modalBody"></div>
          </div>
        </div>
      </div>
    `;

    renderDailyMindfulness();
    renderTiles();
    renderCaredList();
    wireModal();
  }

  function renderDailyMindfulness() {
    const affirmation = pickDaily(AFFIRMATIONS);
    const grounding = pickDaily(GROUNDING_ACTIONS);

    const aEl = document.getElementById("affirmationGlass");
    const gEl = document.getElementById("groundingPanel");
    if (aEl) aEl.textContent = affirmation;
    if (gEl) gEl.textContent = grounding;
  }

  function renderTiles() {
    const state = loadPlantState();
    const grid = document.getElementById("tilesGrid");
    if (!grid) return;

    const tilesHTML = PLANTS.map((p) => {
      const due = computeDue(p, state);
      const img = plantImageURL(p) || "";
      const dueClass = due.isDue ? "is-due" : "not-due";

      // No text on tiles. Image only. (A11y: aria-label includes name.)
      return `
        <button class="rr-tile ${dueClass}" data-plant-id="${p.id}" aria-label="${escapeHTML(p.name)}">
          <div class="rr-tile-img" style="background-image:url('${escapeAttr(img)}')"></div>
          <div class="rr-embers" aria-hidden="true"></div>
        </button>
      `;
    }).join("");

    grid.innerHTML = tilesHTML;

    // Start ember effect only for due tiles (lightweight)
    $$(".rr-tile.is-due .rr-embers", grid).forEach((emberBox) => {
      seedEmbers(emberBox, 10);
    });

    // Click -> open modal
    $$(".rr-tile", grid).forEach((btn) => {
      btn.addEventListener("click", () => openPlantModal(btn.getAttribute("data-plant-id")));
    });
  }

  function renderCaredList() {
    const list = document.getElementById("caredList");
    if (!list) return;

    const log = loadCaredLog();
    if (!log.length) {
      list.innerHTML = `<div class="rr-cared-empty">No care marked yet. First tending awakens the ledger.</div>`;
      return;
    }

    // Most recent first, show 12
    const recent = log.slice().reverse().slice(0, 12);

    list.innerHTML = recent.map((entry) => {
      const when = new Date(entry.tsISO);
      const nice = when.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
      return `
        <div class="rr-cared-item">
          <div class="rr-cared-name">${escapeHTML(entry.plantName)}</div>
          <div class="rr-cared-time">${escapeHTML(nice)}</div>
        </div>
      `;
    }).join("");
  }

  /* =========================
     MODAL: Plant detail + “Cared For”
     ========================= */
  function wireModal() {
    const backdrop = document.getElementById("modalBackdrop");
    const closeBtn = document.getElementById("modalClose");

    if (!backdrop || !closeBtn) return;

    closeBtn.addEventListener("click", closePlantModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closePlantModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !backdrop.hidden) closePlantModal();
    });
  }

  function openPlantModal(plantId) {
    const plant = PLANTS.find((p) => p.id === plantId);
    if (!plant) return;

    const state = loadPlantState();
    const due = computeDue(plant, state);

    const img = plantImageURL(plant) || "";
    const modalBody = document.getElementById("modalBody");
    const backdrop = document.getElementById("modalBackdrop");
    if (!modalBody || !backdrop) return;

    const last = due.lastCaredISO;
    const dueLine = due.isDue
      ? "Due now."
      : `Not due yet.`;

    const nextCareText = last
      ? (() => {
          const lastD = parseISODate(last);
          const next = new Date(lastD.getFullYear(), lastD.getMonth(), lastD.getDate() + plant.careIntervalDays);
          return next.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        })()
      : "Today";

    modalBody.innerHTML = `
      <div class="rr-modal-top">
        <div class="rr-modal-thumb" style="background-image:url('${escapeAttr(img)}')"></div>
        <div class="rr-modal-head">
          <div class="rr-modal-title">${escapeHTML(plant.name)} ${escapeHTML(plant.countLabel || "")}</div>
          <div class="rr-modal-sub">${escapeHTML(dueLine)}</div>
        </div>
      </div>

      <div class="rr-modal-grid">
        <div class="rr-info">
          <div class="rr-info-label">Lighting</div>
          <div class="rr-info-value">${escapeHTML(plant.lighting)}</div>
        </div>

        <div class="rr-info">
          <div class="rr-info-label">Care rhythm</div>
          <div class="rr-info-value">About every ${plant.careIntervalDays} day${plant.careIntervalDays === 1 ? "" : "s"}.</div>
        </div>

        <div class="rr-info">
          <div class="rr-info-label">What to do</div>
          <div class="rr-info-value">${escapeHTML(plant.careType)}</div>
        </div>

        <div class="rr-info">
          <div class="rr-info-label">Watering details</div>
          <div class="rr-info-value">${escapeHTML(plant.wateringDetail)}</div>
        </div>

        <div class="rr-info">
          <div class="rr-info-label">Last cared for</div>
          <div class="rr-info-value">${escapeHTML(formatNiceDate(last))}</div>
        </div>

        <div class="rr-info">
          <div class="rr-info-label">Next care (target)</div>
          <div class="rr-info-value">${escapeHTML(nextCareText)}</div>
        </div>

        <div class="rr-info rr-info-full">
          <div class="rr-info-label">Notes</div>
          <div class="rr-info-value">${escapeHTML(plant.notes || "")}</div>
        </div>
      </div>

      <div class="rr-modal-actions">
        <button class="rr-btn rr-btn-primary" id="markCaredBtn">
          Mark cared for
        </button>
        <button class="rr-btn" id="closeModalBtn">
          Close
        </button>
      </div>
    `;

    $("#closeModalBtn", modalBody)?.addEventListener("click", closePlantModal);
    $("#markCaredBtn", modalBody)?.addEventListener("click", () => {
      markPlantCaredFor(plant);
      closePlantModal();
    });

    backdrop.hidden = false;
    document.body.classList.add("rr-modal-open");
  }

  function closePlantModal() {
    const backdrop = document.getElementById("modalBackdrop");
    if (!backdrop) return;
    backdrop.hidden = true;
    document.body.classList.remove("rr-modal-open");
  }

  function markPlantCaredFor(plant) {
    const state = loadPlantState();
    state[plant.id] = { lastCaredISO: todayISO() };
    savePlantState(state);

    const log = loadCaredLog();
    log.push({
      plantId: plant.id,
      plantName: `${plant.name}${plant.countLabel ? " " + plant.countLabel : ""}`,
      tsISO: new Date().toISOString()
    });
    saveCaredLog(log);

    // Re-render tiles + cared list so glow updates instantly
    renderTiles();
    renderCaredList();
  }

  /* =========================
     EMBERS (lightweight)
     - Creates little “ember” spans; CSS handles animation.
     - Only attached to due tiles.
     ========================= */
  function seedEmbers(container, count) {
    // Clear previous
    container.innerHTML = "";
    const n = clamp(count, 6, 18);

    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "rr-ember";
      const left = Math.random() * 100;
      const delay = Math.random() * 2.5;
      const dur = 1.6 + Math.random() * 2.2;
      const size = 2 + Math.random() * 3.5;
      const drift = (Math.random() * 40) - 20;

      s.style.left = `${left}%`;
      s.style.animationDelay = `${delay}s`;
      s.style.animationDuration = `${dur}s`;
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.setProperty("--drift", `${drift}px`);

      container.appendChild(s);
    }
  }

  /* =========================
     ESCAPING (safety)
     ========================= */
  function escapeHTML(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(str) {
    // very small attr sanitizer
    return String(str ?? "").replaceAll('"', "%22").replaceAll("'", "%27");
  }

  /* =========================
     BOOT
     ========================= */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountApp);
  } else {
    mountApp();
  }
})();