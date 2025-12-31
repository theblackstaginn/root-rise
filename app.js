/* Root & Rise — app.js (RR-CSS MATCH)
   - Uses existing DOM from index.html
   - Tiles are image-only; due tiles glow + embers ring
   - Modal shows full info + “Mark Cared For”
   - Daily: affirmation + grounding (with candle prefix) rotates by date
*/

(() => {
  "use strict";

  /* =========================
     CONFIG: assets are in REPO ROOT
     ========================= */
  const ASSET_DIR = "./"; // root

  const ASSETS = {
    bg: "bg-01.png",
    plants: {
      "albino-syngonium": "albino-syngonium.png",
      "prayer-plant": "prayer-plant.png",
      "pothos": "pothos.png",
      "snake-plant": "snake-plant.png",
      "cactus": "cactus.png",
      "propagation-station": "propagation-station.png",
      "monstera": "monstera.png",
      "tiny-cactus": "tiny-cactus.png" // optional; will fall back to cactus if missing
    }
  };

  function assetUrl(filename) {
    // Bulletproof URL resolution for GitHub Pages / iOS Safari
    return new URL(ASSET_DIR + filename, document.baseURI).toString();
  }

  /* =========================
     DATA: Plants + Care Guidance
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
        "If you don’t have tiny-cactus.png yet, it will fall back to cactus image."
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
     ========================= */
  const AFFIRMATIONS = [
    "What I nurture, nurtures me.","My pace is sacred.","I grow in seasons, not deadlines.","I can be soft and powerful at once.",
    "My attention is my magic.","I am allowed to begin again.","I choose steady over frantic.","My breath returns me to myself.",
    "I trust the quiet work.","I am worthy of gentle care.","I can rest without guilt.","I honor my energy like a flame.",
    "I release what isn’t mine to hold.","My inner world is a garden.","I make room for good things.","I protect my peace with devotion.",
    "I am learning how to receive.","I listen to my body’s wisdom.","I move with intention.","My softness is not weakness.",
    "I keep what nourishes me.","I let the small wins count.","I am not behind. I am becoming.","I tend my life with patience.",
    "I can do hard things gently.","I am safe in my own presence.","I am allowed to take up space.","I choose clarity over chaos.",
    "I speak to myself with kindness.","I honor what I’ve survived.","I am building a life that fits.","I let simplicity be powerful.",
    "I water my own roots first.","I can pause and still be worthy.","I trust my intuition’s whisper.","I release comparison.",
    "I am more than my productivity.","I am allowed to want what I want.","My boundaries are blessings.","I choose calm on purpose.",
    "I can be patient with my healing.","My needs are not an inconvenience.","I bless my path, even when foggy.","I am learning my own rhythm.",
    "I make space for joy.","I am held by the earth beneath me.","I give myself permission to feel.","I am not too much.",
    "I choose honest progress.","I return to my center.","My heart knows the way.","I am guided by what is true.",
    "I can start small and still succeed.","I honor my limits without shame.","I let my life be mine.","I trust the slow unfolding.",
    "I am allowed to be proud.","I choose peace as a practice.","I am learning to trust myself.","I am becoming more me.",
    "I am safe to shine.","I welcome supportive change.","I release what drains me.","I am cultivating steadiness.",
    "I can be brave and tired.","I let rest be productive.","I choose devotion to my well-being.","I practice softness with myself.",
    "I am rooted in what matters.","I rise without rushing.","I am allowed to do this differently.","I choose what aligns.",
    "I am building trust with myself.","I keep promises to my spirit.","I honor my tenderness.","I can be present right now.",
    "I am worthy of being cared for.","I choose the next right step.","I let the day be enough.","I practice courage in small ways.",
    "I protect my magic.","I belong in my own life.","I breathe in steadiness.","I release the need to prove.",
    "I listen, then I act.","I am guided by devotion.","I am allowed to enjoy this.","I choose a softer story.","I trust my becoming."
  ].slice(0, 90);

  const GROUNDING_ACTIONS_RAW = [
    "Drink a full glass of water before anything else.","Stand barefoot for 60 seconds and feel the floor hold you.",
    "Open a window. Take five slow breaths.","Wipe one small surface until it shines.","Do a 2-minute shoulder roll + neck stretch.",
    "Light a candle and watch the flame for one minute.","Put on one song and move however your body wants.",
    "Water only the plants that are due — nothing extra.","Rinse your hands in cool water and reset.","Write one sentence: “Today I need…”",
    "Make your bed with deliberate calm.","Step outside and look at the sky for 30 seconds.","Tidy one tiny corner (a drawer, a shelf, a table edge).",
    "Do 10 slow squats or 10 wall push-ups.","Make tea and drink it without multitasking for 3 minutes.",
    "Name 5 things you can see, 4 feel, 3 hear, 2 smell, 1 taste.","Brush your hair slowly like it’s a ritual.",
    "Put your phone down face-down for 10 minutes.","Wash a few dishes as an offering to future-you.",
    "Write a gratitude list with exactly 3 items.","Stretch your calves + feet for 2 minutes.","Stand tall and unclench your jaw.",
    "Take a short walk to the mailbox and back.","Pick one task. Do it for 5 minutes. Stop.",
    "Hold something warm (mug, blanket) and breathe slowly.","Do a 60-second plank or a gentle alternative.",
    "Clean your propagation station water if it’s due.","Mist/humidify for the prayer plant (if you do that).",
    "Look at a plant closely and notice three details.","Write one kind sentence to yourself.","Do a slow forward fold and breathe into your back.",
    "Put on lotion intentionally — hands, arms, or legs.","Step into sunlight (or bright window) for 1 minute.",
    "Pick tomorrow’s outfit now (reduce morning friction).","Make a “done list” of what you already handled today.",
    "Turn off one unnecessary light and enjoy the dim.","Sit with your feet planted and breathe for 90 seconds.",
    "Toss one thing you don’t need (trash, junk mail, expired item).","Pull one weed / remove one dead leaf — tiny tending.",
    "Place a hand on your chest: inhale “here”, exhale “now”.","Do 5 slow, deep belly breaths.",
    "Roll a tennis ball under your foot for 1 minute.","Wipe your phone screen. Clean slate.","Wash your face slowly like a blessing.",
    "Say out loud: “I am safe. I am here.”"
  ].slice(0, 45);

  // ✅ Your instruction: prepend “Light a candle.” to ALL grounding actions.
  function normalizeGrounding(actions) {
    return actions.map((a) => {
      const s = String(a ?? "").trim();
      if (!s) return "Light a candle.";
      if (s.toLowerCase().startsWith("light a candle.")) return s;
      // Also handle the one that says “Light a candle and watch...”
      if (s.toLowerCase().startsWith("light a candle ")) return `Light a candle. ${s.replace(/^light a candle\s*/i, "")}`.trim();
      return `Light a candle. ${s}`;
    });
  }

  const GROUNDING_ACTIONS = normalizeGrounding(GROUNDING_ACTIONS_RAW);

  /* =========================
     STORAGE
     ========================= */
  const STORAGE = {
    plantState: "rr.plantState.v3",
    caredLog: "rr.caredLog.v3"
  };

  /* =========================
     DOM
     ========================= */
  const el = {
    tiles: document.getElementById("rrTiles"),
    affirmation: document.getElementById("rrAffirmation"),
    grounding: document.getElementById("rrGrounding"),
    caredList: document.getElementById("rrCaredList"),

    modalBackdrop: document.getElementById("rrModalBackdrop"),
    modalClose: document.getElementById("rrModalClose"),
    modalClose2: document.getElementById("rrModalClose2"),
    modalThumb: document.getElementById("rrModalThumb"),
    modalTitle: document.getElementById("rrModalTitle"),
    modalSub: document.getElementById("rrModalSub"),
    modalGrid: document.getElementById("rrModalGrid"),
    markBtn: document.getElementById("rrMarkCaredBtn")
  };

  /* =========================
     HELPERS
     ========================= */
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

  function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseISODate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function diffDays(a, b) {
    const ms = 24 * 60 * 60 * 1000;
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((ub - ua) / ms);
  }

  function daySeed() {
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
    return arr[daySeed() % arr.length];
  }

  function plantImageFile(plant) {
    // If tiny-cactus.png is missing, we still show cactus.png.
    if (plant.imageKey === "tiny-cactus" && !ASSETS.plants["tiny-cactus"]) {
      return ASSETS.plants.cactus;
    }
    return ASSETS.plants[plant.imageKey] || "";
  }

  function computeDue(plant, state) {
    const last = state[plant.id]?.lastCaredISO || null;
    if (!last) return { isDue: true, lastCaredISO: null, daysUntil: 0 };

    const t = parseISODate(todayISO());
    const lastD = parseISODate(last);
    const daysSince = diffDays(lastD, t);
    const daysUntil = plant.careIntervalDays - daysSince;
    return { isDue: daysUntil <= 0, lastCaredISO: last, daysUntil };
  }

  function formatNiceDate(iso) {
    if (!iso) return "Not tracked yet";
    const d = parseISODate(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function nextCareNice(plant, lastISO) {
    if (!lastISO) return "Today";
    const last = parseISODate(lastISO);
    const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + plant.careIntervalDays);
    return next.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function escapeHTML(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(str) {
    return String(str ?? "").replaceAll('"', "%22").replaceAll("'", "%27");
  }

  /* =========================
     EMBERS (span particles; CSS animates)
     ========================= */
  function seedEmbers(container, count) {
    container.innerHTML = "";
    const n = Math.max(10, Math.min(24, count)); // ✅ more prominent

    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "rr-ember";

      const left = Math.random() * 100;
      const delay = Math.random() * 2.2;
      const dur = 1.4 + Math.random() * 2.2;
      const size = 2.8 + Math.random() * 4.8; // ✅ bigger particles
      const drift = (Math.random() * 58) - 29;

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
     RENDER
     ========================= */
  let currentPlantId = null;

  function renderDaily() {
    // ✅ Use CSS variable so your layered background stays intact
    document.documentElement.style.setProperty("--bgUrl", `url("${assetUrl(ASSETS.bg)}")`);

    if (el.affirmation) el.affirmation.textContent = pickDaily(AFFIRMATIONS);
    if (el.grounding) el.grounding.textContent = pickDaily(GROUNDING_ACTIONS);
  }

  function renderTiles() {
    if (!el.tiles) return;

    const state = loadPlantState();

    el.tiles.innerHTML = PLANTS.map((p) => {
      const due = computeDue(p, state);
      const file = plantImageFile(p);
      const imgUrl = file ? assetUrl(file) : "";
      const dueClass = due.isDue ? "is-due" : "";
      const aria = `${p.name}${p.countLabel ? " " + p.countLabel : ""}`;

      return `
        <button class="rr-tile ${dueClass}" type="button"
          data-id="${escapeAttr(p.id)}"
          aria-label="${escapeHTML(aria)}">
          <div class="rr-tile-img" style="background-image:url('${escapeAttr(imgUrl)}')"></div>
          <div class="rr-embers" aria-hidden="true"></div>
        </button>
      `;
    }).join("");

    const tiles = Array.from(el.tiles.querySelectorAll(".rr-tile"));
    for (const t of tiles) {
      const id = t.getAttribute("data-id");
      t.addEventListener("click", () => openModal(id));

      if (t.classList.contains("is-due")) {
        const emberBox = t.querySelector(".rr-embers");
        if (emberBox) seedEmbers(emberBox, 16);
      }
    }
  }

  function renderCaredList() {
    if (!el.caredList) return;

    const log = loadCaredLog();
    if (!log.length) {
      el.caredList.innerHTML = `<div class="rr-cared-empty">No care marked yet. First tending awakens the ledger.</div>`;
      return;
    }

    const recent = log.slice().reverse().slice(0, 12);
    el.caredList.innerHTML = recent.map((entry) => {
      const when = new Date(entry.tsISO);
      const nice = when.toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
      });

      return `
        <div class="rr-cared-item">
          <div class="rr-cared-name">${escapeHTML(entry.plantName)}</div>
          <div class="rr-cared-time">${escapeHTML(nice)}</div>
        </div>
      `;
    }).join("");
  }

  /* =========================
     MODAL
     ========================= */
  function openModal(plantId) {
    const plant = PLANTS.find((p) => p.id === plantId);
    if (!plant) return;

    const state = loadPlantState();
    const due = computeDue(plant, state);

    currentPlantId = plantId;

    const file = plantImageFile(plant);
    const imgUrl = file ? assetUrl(file) : "";

    if (el.modalThumb) el.modalThumb.style.backgroundImage = `url("${imgUrl}")`;
    if (el.modalTitle) el.modalTitle.textContent = `${plant.name}${plant.countLabel ? " " + plant.countLabel : ""}`;
    if (el.modalSub) el.modalSub.textContent = due.isDue ? "Due now." : "Not due yet.";

    const last = due.lastCaredISO;
    const nextNice = nextCareNice(plant, last);

    if (el.modalGrid) {
      el.modalGrid.innerHTML = `
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
          <div class="rr-info-label">Care details</div>
          <div class="rr-info-value">${escapeHTML(plant.wateringDetail)}</div>
        </div>

        <div class="rr-info">
          <div class="rr-info-label">Last cared for</div>
          <div class="rr-info-value">${escapeHTML(formatNiceDate(last))}</div>
        </div>

        <div class="rr-info">
          <div class="rr-info-label">Next care (target)</div>
          <div class="rr-info-value">${escapeHTML(nextNice)}</div>
        </div>

        <div class="rr-info rr-info-full">
          <div class="rr-info-label">Notes</div>
          <div class="rr-info-value">${escapeHTML(plant.notes || "")}</div>
        </div>
      `;
    }

    if (el.markBtn) {
      el.markBtn.onclick = () => {
        markCaredFor(plant);
        closeModal();
      };
    }

    if (el.modalBackdrop) el.modalBackdrop.hidden = false;
    document.body.classList.add("rr-modal-open");
  }

  function closeModal() {
    if (el.modalBackdrop) el.modalBackdrop.hidden = true;
    document.body.classList.remove("rr-modal-open");
    currentPlantId = null;
  }

  function wireModal() {
    if (el.modalClose) el.modalClose.addEventListener("click", closeModal);
    if (el.modalClose2) el.modalClose2.addEventListener("click", closeModal);

    if (el.modalBackdrop) {
      el.modalBackdrop.addEventListener("click", (e) => {
        if (e.target === el.modalBackdrop) closeModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.modalBackdrop && el.modalBackdrop.hidden === false) {
        closeModal();
      }
    });
  }

  function markCaredFor(plant) {
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

    renderTiles();
    renderCaredList();
  }

  /* =========================
     BOOT
     ========================= */
  function boot() {
    renderDaily();
    renderTiles();
    renderCaredList();
    wireModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();