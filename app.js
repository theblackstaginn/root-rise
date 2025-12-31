/* Root & Rise — app.js
   - Vanilla JS, localStorage persistence
   - Uses existing DOM from index.html (NO dynamic mount)
   - Layout:
     1) Plant tiles (2 columns) — always visible, no text on tiles
        • Tiles glow + embers ONLY when due for care
        • Click tile -> Plant Detail modal (full info + “Cared For” button)
     2) Root & Rise card section
        • Affirmation on glass panel over root-rise-card image
     3) Grounding action panel
     4) “Cared For” recent list
*/

(() => {
  "use strict";

  /* =========================
     CONFIG: Assets in REPO ROOT
     ========================= */
  const ASSETS = {
    plants: {
      "albino-syngonium": "albino-syngonium.png",
      "prayer-plant": "prayer-plant.png",
      "pothos": "pothos.png",
      "snake-plant": "snake-plant.png",
      "cactus": "cactus.png",
      "propagation-station": "propagation-station.png",
      "monstera": "monstera.png",
      // optional
      "tiny-cactus": "tiny-cactus.png"
    }
  };

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
     ROTATION: 90 affirmations + 45 grounding actions (daily deterministic)
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

  const GROUNDING_ACTIONS = [
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

  /* =========================
     STORAGE KEYS
     ========================= */
  const STORAGE = {
    plantState: "rr.plantState.v2", // { [plantId]: { lastCaredISO:"YYYY-MM-DD" } }
    caredLog: "rr.caredLog.v2"      // [{ plantId, plantName, tsISO }]
  };

  /* =========================
     HELPERS
     ========================= */
  const $ = (id) => document.getElementById(id);

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
    const idx = daySeed() % arr.length;
    return arr[idx];
  }

  function plantImageURL(plant) {
    const key = plant.imageKey;
    if (key === "tiny-cactus" && !ASSETS.plants["tiny-cactus"]) return ASSETS.plants.cactus;
    return ASSETS.plants[key] || "";
  }

  function computeDue(plant, state) {
    const t = parseISODate(todayISO());
    const last = state[plant.id]?.lastCaredISO;

    if (!last) {
      return { isDue: true, lastCaredISO: null, daysUntil: 0 };
    }

    const lastD = parseISODate(last);
    const daysSince = diffDays(lastD, t);
    const daysUntil = plant.careIntervalDays - daysSince;

    return {
      isDue: daysUntil <= 0,
      lastCaredISO: last,
      daysUntil
    };
  }

  function formatNiceDate(iso) {
    if (!iso) return "Not tracked yet";
    const d = parseISODate(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function nextCareDateISO(plant, lastISO) {
    if (!lastISO) return todayISO();
    const last = parseISODate(lastISO);
    const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + plant.careIntervalDays);
    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, "0");
    const dd = String(next.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  /* =========================
     EMBERS (canvas particles)
     - Only runs for due tiles
     ========================= */
  function startEmbers(canvas) {
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let running = true;

    const DPR = Math.min(2, window.devicePixelRatio || 1);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * DPR));
      canvas.height = Math.max(1, Math.floor(rect.height * DPR));
    }

    resize();

    const particles = Array.from({ length: 22 }, () => makeParticle(canvas));

    function makeParticle(c) {
      const w = c.width, h = c.height;
      return {
        x: Math.random() * w,
        y: h + Math.random() * h * 0.2,
        r: (1.2 + Math.random() * 2.8) * DPR,
        vy: (0.35 + Math.random() * 0.9) * DPR,
        vx: (-0.35 + Math.random() * 0.7) * DPR,
        a: 0.25 + Math.random() * 0.55,
        life: 0.0,
        max: 1.0 + Math.random() * 1.2
      };
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // gentle fade so embers don't look like confetti
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life += 0.016;

        p.x += p.vx;
        p.y -= p.vy;
        p.a *= 0.996;

        // float upward curve
        p.vx += (Math.sin((p.life + i) * 0.8) * 0.004) * DPR;

        const alpha = Math.max(0, Math.min(1, (1 - (p.life / p.max)))) * p.a;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
        grad.addColorStop(0, `rgba(255,170,90,${alpha})`);
        grad.addColorStop(0.6, `rgba(255,120,60,${alpha * 0.55})`);
        grad.addColorStop(1, `rgba(255,120,60,0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // reset when offscreen
        if (p.y < -p.r * 6 || p.life > p.max) {
          particles[i] = makeParticle(canvas);
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    }

    // handle resize
    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas);

    tick();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }

  /* =========================
     UI: Render tiles / affirmation / grounding / cared list
     ========================= */
  const emberStops = new Map(); // plantId -> stopFn
  let currentModalPlantId = null;

  function renderDaily() {
    const aEl = $("rrAffirmation");
    const gEl = $("rrGrounding");

    if (aEl) aEl.textContent = pickDaily(AFFIRMATIONS);
    if (gEl) gEl.textContent = pickDaily(GROUNDING_ACTIONS);
  }

  function renderTiles() {
    const grid = $("rrTiles");
    if (!grid) return;

    // stop any prior ember loops
    emberStops.forEach((stop) => stop());
    emberStops.clear();

    const state = loadPlantState();

    grid.innerHTML = PLANTS.map((p) => {
      const due = computeDue(p, state);
      const img = plantImageURL(p);
      const dueAttr = due.isDue ? "true" : "false";

      // NOTE: no text inside tile; clickable button; image fills
      return `
        <button class="tile" type="button"
          data-id="${escapeAttr(p.id)}"
          data-due="${dueAttr}"
          aria-label="${escapeHTML(p.name)}">
          <img class="tile-img" src="./${escapeAttr(img)}" alt="" loading="lazy" />
          <div class="tile-glow" aria-hidden="true"></div>
          <canvas class="ember-canvas" aria-hidden="true"></canvas>
        </button>
      `;
    }).join("");

    // wire clicks + embers only for due tiles
    Array.from(grid.querySelectorAll(".tile")).forEach((tile) => {
      const id = tile.getAttribute("data-id");
      tile.addEventListener("click", () => openModal(id));

      const isDue = tile.getAttribute("data-due") === "true";
      if (isDue) {
        const canvas = tile.querySelector(".ember-canvas");
        if (canvas) {
          const stop = startEmbers(canvas);
          emberStops.set(id, stop);
        }
      }
    });
  }

  function renderCaredList() {
    const list = $("rrCaredList");
    if (!list) return;

    const log = loadCaredLog();
    if (!log.length) {
      list.innerHTML = `<div class="rr-empty">No care marked yet.</div>`;
      return;
    }

    const recent = log.slice().reverse().slice(0, 14);
    list.innerHTML = recent.map((e) => {
      const when = new Date(e.tsISO);
      const nice = when.toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
      });
      return `
        <div class="history-item">
          <div class="history-name">${escapeHTML(e.plantName)}</div>
          <div class="history-time">${escapeHTML(nice)}</div>
        </div>
      `;
    }).join("");
  }

  /* =========================
     MODAL: open/close + content
     ========================= */
  function openModal(plantId) {
    const plant = PLANTS.find((p) => p.id === plantId);
    if (!plant) return;

    const backdrop = $("rrModalBackdrop");
    const thumb = $("rrModalThumb");
    const title = $("rrModalTitle");
    const sub = $("rrModalSub");
    const grid = $("rrModalGrid");
    const markBtn = $("rrMarkCaredBtn");

    if (!backdrop || !thumb || !title || !sub || !grid || !markBtn) return;

    const state = loadPlantState();
    const due = computeDue(plant, state);

    currentModalPlantId = plantId;

    // thumb image
    const img = plantImageURL(plant);
    thumb.style.backgroundImage = `url("./${img}")`;

    // title/sub
    title.textContent = `${plant.name}${plant.countLabel ? " " + plant.countLabel : ""}`;
    sub.textContent = due.isDue ? "Due now." : "Not due yet.";

    const last = due.lastCaredISO;
    const nextISO = nextCareDateISO(plant, last);
    const nextNice = formatNiceDate(nextISO);

    grid.innerHTML = `
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

    // wire button (replace handler each open)
    markBtn.onclick = () => {
      markCaredFor(plant);
      closeModal();
    };

    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const backdrop = $("rrModalBackdrop");
    if (!backdrop) return;
    backdrop.hidden = true;
    document.body.style.overflow = "";
    currentModalPlantId = null;
  }

  function wireModal() {
    const backdrop = $("rrModalBackdrop");
    const close1 = $("rrModalClose");
    const close2 = $("rrModalClose2");

    if (close1) close1.addEventListener("click", closeModal);
    if (close2) close2.addEventListener("click", closeModal);

    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      const bd = $("rrModalBackdrop");
      if (e.key === "Escape" && bd && bd.hidden === false) closeModal();
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

    // refresh UI
    renderTiles();
    renderCaredList();
  }

  /* =========================
     ESCAPING
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
    return String(str ?? "").replaceAll('"', "%22").replaceAll("'", "%27");
  }

  /* =========================
     BOOT
     ========================= */
  function boot() {
    // sanity: required elements exist
    const required = ["rrTiles","rrAffirmation","rrGrounding","rrCaredList","rrModalBackdrop"];
    for (const id of required) {
      if (!$(id)) console.warn(`Root & Rise: missing #${id}`);
    }

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