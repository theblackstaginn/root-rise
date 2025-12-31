(() => {
  "use strict";

  /* ===========================
     ROOT & RISE — Jess Edition
     - All plant tiles visible
     - Tiles glow + embers only when due
     - Tap tile => full plant info modal
     - “Cared For” log (not “watered”)
     - 90 affirmations + 45 grounding actions rotate daily
     =========================== */

  const $ = (sel) => document.querySelector(sel);

  // ---------- Images in repo root ----------
  const IMAGES = {
    card: "./root-rise-card.png",
    bgs: ["./bg-01.png", "./bg-02.png", "./bg-03.png", "./bg-04.png"]
  };

  // ---------- Plant Data ----------
  // Notes:
  // - intervals are conservative “typical indoor” schedules
  // - "careNotes" are human-friendly, not over-sciency
  const PLANTS = [
    {
      id: "albinoSyngonium",
      name: "Albino Syngonium Arrow",
      countLabel: "",
      img: "./albino-syngonium.png",
      light: "Bright indirect. Avoid harsh direct sun.",
      waterEveryDays: 7,
      waterMethod: "Water when the top inch is dry. Even moisture, never soggy.",
      humidity: "Enjoys moderate humidity. Mist occasionally if air is dry.",
      temp: "65–80°F. Keep away from cold drafts.",
      careNotes: "If it droops, check soil moisture first. Rotate weekly for even growth.",
      warning: "Yellow leaves often mean overwatering."
    },
    {
      id: "prayerPlant",
      name: "Prayer Plant",
      img: "./prayer-plant.png",
      light: "Medium to bright indirect. No direct sun.",
      waterEveryDays: 6,
      waterMethod: "Keep slightly moist. Let the top ~½ inch dry, then water.",
      humidity: "Loves humidity. Mist, pebble tray, or near a humidifier.",
      temp: "65–80°F. Sensitive to cold.",
      careNotes: "Curling leaves usually want more humidity or gentler water (filtered if possible).",
      warning: "Crispy edges can be low humidity or minerals in tap water."
    },
    {
      id: "pothos",
      name: "Pothos",
      countLabel: "(x6)",
      img: "./pothos.png",
      light: "Low to bright indirect. More light = faster growth.",
      waterEveryDays: 10,
      waterMethod: "Let top 1–2 inches dry, then water thoroughly.",
      humidity: "Easygoing. Average home humidity is fine.",
      temp: "60–85°F.",
      careNotes: "Trim to shape and propagate cuttings in water. Rotate for balanced vines.",
      warning: "Yellow leaves usually mean too wet."
    },
    {
      id: "snakePlant",
      name: "Snake Plant",
      countLabel: "(x2)",
      img: "./snake-plant.png",
      light: "Low to bright indirect. Tolerates low light well.",
      waterEveryDays: 21,
      waterMethod: "Let soil dry out completely before watering.",
      humidity: "Doesn’t care. Dry air is fine.",
      temp: "60–90°F.",
      careNotes: "If unsure: wait. Snake plants prefer neglect over love-bombing.",
      warning: "Soft/mushy base = too much water."
    },
    {
      id: "cactus",
      name: "Cactus",
      img: "./cactus.png",
      light: "Bright light / some direct sun.",
      waterEveryDays: 28,
      waterMethod: "Soak then fully dry. Much less in winter.",
      humidity: "Prefers dry air.",
      temp: "65–90°F.",
      careNotes: "Use fast-draining soil. Don’t let it sit in water.",
      warning: "Wrinkling can mean thirsty; mushy can mean rot."
    },
    {
      id: "tinyCactus",
      name: "Tiny Cactus",
      countLabel: "(x4)",
      img: "./tiny-cactus.png",
      light: "Bright light / some direct sun.",
      waterEveryDays: 24,
      waterMethod: "Small pot dries fast: check soil, then water sparingly.",
      humidity: "Prefers dry air.",
      temp: "65–90°F.",
      careNotes: "Because they’re small, they can dry sooner than the big cactus.",
      warning: "Overwatering shows up fast in tiny pots."
    },
    {
      id: "propStation",
      name: "Propagation Station",
      img: "./propagation-station.png",
      light: "Bright indirect.",
      waterEveryDays: 5,
      waterMethod: "Refresh water. Rinse vessel. Top off as needed.",
      humidity: "N/A",
      temp: "Room temp.",
      careNotes: "Change water more often if it looks cloudy. Trim any mushy bits.",
      warning: "If it smells off, rinse and restart with clean water."
    },
    {
      id: "monstera",
      name: "Monstera",
      img: "./monstera.png",
      light: "Bright indirect. A little morning sun is okay.",
      waterEveryDays: 9,
      waterMethod: "Let top 2 inches dry, then water deeply.",
      humidity: "Likes moderate humidity.",
      temp: "65–85°F.",
      careNotes: "Rotate and wipe leaves. Stake if it’s reaching.",
      warning: "Droop + wet soil = overwater. Droop + dry soil = thirsty."
    }
  ];

  // ---------- 90 Affirmations ----------
  const AFFIRMATIONS = [
    "What I nurture, nurtures me.",
    "My care is gentle, consistent, and enough.",
    "I don’t rush my growth—my roots know the pace.",
    "I am allowed to take up space and thrive.",
    "Small tending creates big becoming.",
    "I trust my timing.",
    "I soften, and I strengthen.",
    "I can be both tender and unstoppable.",
    "I return to myself, again and again.",
    "I am learning to receive good things.",
    "My inner world is a garden, and I am its keeper.",
    "I let the day be what it is—and I meet it with grace.",
    "I don’t need permission to bloom.",
    "I’m building a life that holds me.",
    "My love is a practice, not a performance.",
    "I choose steadiness over perfection.",
    "I am not behind. I am becoming.",
    "I release what drains me and keep what feeds me.",
    "I honor my softness as strength.",
    "I welcome ease without guilt.",
    "I listen to what my body is saying.",
    "I give myself the patience I give what I love.",
    "I am safe to be seen as I am.",
    "I hold my boundaries with kindness.",
    "I am learning to trust my own voice.",
    "I make room for joy.",
    "I can start again without shame.",
    "I nourish my peace like a flame.",
    "I deserve support.",
    "I let myself rest without earning it.",
    "I am allowed to be proud of myself.",
    "I am guided by what feels true.",
    "I choose what grows me.",
    "I am more than one hard day.",
    "I do not abandon myself.",
    "I am worthy of tenderness.",
    "I take my time. I take my space.",
    "I have nothing to prove to be loved.",
    "I forgive myself for being human.",
    "I let beauty be medicine.",
    "I am steady in my own hands.",
    "I belong to myself.",
    "I speak to myself like someone I love.",
    "I am learning to trust the quiet.",
    "I move in a way that honors me.",
    "I am allowed to want more.",
    "I can hold grief and gratitude at once.",
    "I am not too much.",
    "I am not alone in this.",
    "I let the small wins count.",
    "I meet myself with compassion.",
    "I choose gentle clarity.",
    "I release urgency.",
    "I become who I am by caring for what matters.",
    "My presence is enough.",
    "I breathe and return to center.",
    "I let my heart be a home.",
    "I carry myself with respect.",
    "I don’t have to do it all today.",
    "I honor my needs without apology.",
    "I grow by showing up.",
    "I can be brave and tired.",
    "I let myself be helped.",
    "I choose softness over self-attack.",
    "I am learning to trust my resilience.",
    "I create calm where I can.",
    "I protect my peace like a sacred thing.",
    "I am allowed to change my mind.",
    "I am a safe place for myself.",
    "I take one honest step.",
    "I can do hard things gently.",
    "I am becoming more myself.",
    "I am allowed to be in progress.",
    "I let love be practical.",
    "I tend the little things and the little things tend me.",
    "I choose what is sustainable.",
    "I trust my intuition.",
    "I am allowed to be proud of my healing.",
    "I have the right to say no.",
    "I make room for wonder.",
    "I let my life be textured, not perfect.",
    "I honor the season I am in.",
    "I am worthy of consistency.",
    "I release what I cannot control.",
    "I am gentle with my edges.",
    "I let myself be new at things.",
    "I believe in my own capacity.",
    "I choose clarity, not chaos.",
    "I listen. I learn. I grow.",
    "I let today be enough."
  ];

  // If you ever change text, keep count at 90.
  // (This list is 90 lines intentionally.)

  // ---------- 45 Grounding Actions ----------
  const GROUNDING_ACTIONS = [
    "Drink a full glass of water—slowly.",
    "Stand barefoot for 60 seconds. Feel the floor hold you.",
    "Take 10 deep breaths. Longer exhale than inhale.",
    "Wash your hands like it’s a ritual. Warm water. Presence.",
    "Open a window. Let fresh air touch your face.",
    "Light a candle for one minute of stillness.",
    "Do a gentle neck and shoulder roll for 30 seconds.",
    "Name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, 1 you can taste.",
    "Put one hand on your chest and one on your belly. Breathe into both.",
    "Make a tiny to-do list: three doable things only.",
    "Step outside for 2 minutes and look at the sky.",
    "Tidy one small surface. Just one.",
    "Do 8 slow calf raises. Feel your legs support you.",
    "Stretch your hands and wrists—release the grip you carry.",
    "Make a warm drink and take the first sip with gratitude.",
    "Write one sentence: ‘Right now I feel…’ and stop there.",
    "Put on one song that steadies you. Listen, don’t multitask.",
    "Water check: touch soil, notice texture, notice smell.",
    "Gently shake out your arms and legs for 20 seconds.",
    "Sit tall. Relax your jaw. Unclench your tongue.",
    "Look at something green for 30 seconds.",
    "Do a slow forward fold and breathe into your back.",
    "Place your palm on a plant leaf. Let it remind you: life is here.",
    "Name one thing you’ve done well lately.",
    "Do 12 slow wall push-ups.",
    "Breathe in for 4, hold 2, out 6. Repeat 5 times.",
    "Take a shower or wash your face intentionally.",
    "Put your phone down for 3 minutes. Let silence exist.",
    "Check your posture. Soften your shoulders.",
    "Step into sunlight if possible—30 seconds.",
    "Rub a little lotion into your hands like a blessing.",
    "Do 10 seated twists (5 each side).",
    "Write one kind sentence to yourself and believe it for a moment.",
    "Close your eyes and listen for the farthest sound you can hear.",
    "Make your bed or straighten your blanket. Reset the nest.",
    "Sip something warm and feel it travel down.",
    "Touch a cool surface and notice the temperature.",
    "Pick up five items and put them away. Done.",
    "Stand up. Reach high. Exhale. Drop your arms.",
    "Take three slow breaths while looking at your favorite plant.",
    "Do a 60-second “slow walk” across the room—feel each step.",
    "Say out loud: ‘I’m here. I’m safe. I’m allowed to take my time.’",
    "Write down one worry—then write one next step.",
    "Inhale a scent you like (tea, herb, soap) and let it anchor you.",
    "Put a hand over your heart and whisper: ‘I’ve got you.’"
  ];

  // ---------- Storage ----------
  const STORAGE_KEY = "rootRise_v1";
  const state = loadState();

  // ---------- Elements ----------
  const plantsGrid = $("#plantsGrid");
  const plantsHint = $("#plantsHint");
  const cardImg = $("#cardImg");
  const affirmationText = $("#affirmationText");
  const groundingText = $("#groundingText");
  const caredList = $("#caredList");
  const caredEmpty = $("#caredEmpty");
  const dayStamp = $("#dayStamp");

  const plantModal = $("#plantModal");
  const modalImg = $("#modalImg");
  const modalTitle = $("#modalTitle");
  const modalMeta = $("#modalMeta");
  const modalBody = $("#modalBody");
  const modalCareBtn = $("#modalCareBtn");

  const helpModal = $("#helpModal");
  const btnHelp = $("#btn-help");
  const btnReset = $("#btn-reset");

  let activePlantId = null;

  // ---------- Init ----------
  ensureDefaults();
  applyDailyBackground();
  renderRitual();
  renderPlants();
  renderCaredFor();

  // ---------- Events ----------
  plantsGrid.addEventListener("click", (e) => {
    const tile = e.target.closest("[data-plant-id]");
    if (!tile) return;
    openPlantModal(tile.getAttribute("data-plant-id"));
  });

  document.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close]");
    if (!close) return;

    const m = e.target.closest(".modal");
    if (m) closeModal(m);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal(plantModal);
    closeModal(helpModal);
  });

  modalCareBtn.addEventListener("click", () => {
    if (!activePlantId) return;
    markCaredFor(activePlantId);
    openPlantModal(activePlantId); // refresh details
  });

  btnHelp.addEventListener("click", () => openModal(helpModal));

  btnReset.addEventListener("click", () => {
    const ok = confirm("Reset all care history for Root & Rise?");
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  // ---------- Core Logic ----------
  function ensureDefaults(){
    // lastCaredById default: null
    if (!state.lastCaredById) state.lastCaredById = {};
    if (!Array.isArray(state.careLog)) state.careLog = [];

    // daily picks baseline
    if (!state.daily) state.daily = {};
    saveState();
  }

  function applyDailyBackground(){
    const idx = dayIndex(IMAGES.bgs.length);
    document.body.style.backgroundImage = `
      radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,.05), transparent 55%),
      radial-gradient(120% 110% at 50% 80%, rgba(0,0,0,.65), rgba(0,0,0,.9)),
      url("${IMAGES.bgs[idx]}")
    `;
    document.body.style.backgroundSize = "cover, cover, cover";
    document.body.style.backgroundPosition = "center, center, center";
    document.body.style.backgroundRepeat = "no-repeat, no-repeat, no-repeat";
  }

  function renderRitual(){
    cardImg.src = IMAGES.card;

    const todayKey = dateKey(new Date());
    const daily = state.daily;

    if (!daily.date || daily.date !== todayKey){
      daily.date = todayKey;
      daily.affirmationIndex = dayIndex(AFFIRMATIONS.length);
      daily.groundingIndex = dayIndex(GROUNDING_ACTIONS.length, 999); // offset to avoid same-ness
      saveState();
    }

    affirmationText.textContent = AFFIRMATIONS[daily.affirmationIndex];
    groundingText.textContent = GROUNDING_ACTIONS[daily.groundingIndex];

    const d = new Date();
    dayStamp.textContent = d.toLocaleDateString(undefined, { weekday:"long", month:"long", day:"numeric" });
  }

  function renderPlants(){
    plantsGrid.innerHTML = "";

    const dueCount = PLANTS.reduce((acc, p) => acc + (isDue(p) ? 1 : 0), 0);
    plantsHint.textContent = dueCount === 0
      ? "Nothing needs attention today."
      : `${dueCount} ${dueCount === 1 ? "plant is" : "plants are"} calling for care.`;

    for (const plant of PLANTS){
      plantsGrid.appendChild(renderPlantTile(plant));
    }
  }

  function renderPlantTile(plant){
    const tile = document.createElement("div");
    tile.className = "tile" + (isDue(plant) ? " due" : "");
    tile.setAttribute("data-plant-id", plant.id);

    const img = document.createElement("img");
    img.className = "tile-img";
    img.src = plant.img;
    img.alt = plant.name;

    const info = document.createElement("div");
    info.className = "tile-info";

    const name = document.createElement("p");
    name.className = "tile-name";
    name.textContent = plant.countLabel ? `${plant.name} ${plant.countLabel}` : plant.name;

    const last = state.lastCaredById[plant.id] ? new Date(state.lastCaredById[plant.id]) : null;
    const nextDue = computeNextDueDate(plant, last);

    const sub = document.createElement("p");
    sub.className = "tile-sub";
    sub.textContent = isDue(plant)
      ? "Due for care"
      : `Next due: ${formatShortDate(nextDue)}`;

    const meta = document.createElement("div");
    meta.className = "tile-meta";

    const pillLight = document.createElement("span");
    pillLight.className = "pill";
    pillLight.textContent = simplifyLight(plant.light);

    meta.appendChild(pillLight);

    if (isDue(plant)){
      const duePill = document.createElement("span");
      duePill.className = "pill";
      duePill.style.borderColor = "rgba(255,160,110,.35)";
      duePill.style.background = "rgba(255,160,110,.10)";
      duePill.textContent = "Due";
      meta.appendChild(duePill);
    }

    info.appendChild(name);
    info.appendChild(sub);
    info.appendChild(meta);

    tile.appendChild(img);
    tile.appendChild(info);

    // Embers layer (only visible when tile has .due)
    const embers = document.createElement("div");
    embers.className = "embers";
    embers.setAttribute("aria-hidden", "true");
    const emberCount = 10;
    for (let i = 0; i < emberCount; i++){
      embers.appendChild(makeEmber(i));
    }
    tile.appendChild(embers);

    return tile;
  }

  function makeEmber(i){
    const e = document.createElement("div");
    e.className = "ember";
    const x = Math.round(10 + Math.random() * 80) + "%";
    const s = Math.round(4 + Math.random() * 6) + "px";
    const d = Math.round(1800 + Math.random() * 1600) + "ms";
    const delay = Math.round(Math.random() * 2200) + "ms";
    const drift = (Math.random() < 0.5 ? "-" : "") + Math.round(6 + Math.random() * 18) + "px";
    e.style.setProperty("--x", x);
    e.style.setProperty("--s", s);
    e.style.setProperty("--d", d);
    e.style.setProperty("--delay", delay);
    e.style.setProperty("--drift", drift);
    return e;
  }

  function openPlantModal(plantId){
    const plant = PLANTS.find(p => p.id === plantId);
    if (!plant) return;
    activePlantId = plantId;

    modalImg.src = plant.img;
    modalImg.alt = plant.name;

    modalTitle.textContent = plant.countLabel ? `${plant.name} ${plant.countLabel}` : plant.name;

    const last = state.lastCaredById[plant.id] ? new Date(state.lastCaredById[plant.id]) : null;
    const nextDue = computeNextDueDate(plant, last);
    const due = isDue(plant);

    modalMeta.textContent = due
      ? "Due for care now."
      : `Next due: ${formatLongDate(nextDue)}.`;

    modalBody.innerHTML = "";

    modalBody.appendChild(infoRow("Lighting", plant.light));
    modalBody.appendChild(infoRow("Care rhythm", `Every ${plant.waterEveryDays} day${plant.waterEveryDays === 1 ? "" : "s"} (typical).`));
    modalBody.appendChild(infoRow("How to care", plant.waterMethod));
    modalBody.appendChild(infoRow("Humidity", plant.humidity));
    modalBody.appendChild(infoRow("Temperature", plant.temp));
    modalBody.appendChild(infoRow("Notes", plant.careNotes));
    modalBody.appendChild(infoRow("Watch for", plant.warning));

    modalBody.appendChild(infoRow("Last cared", last ? formatLongDateTime(last) : "Not tracked yet."));

    modalCareBtn.textContent = due ? "Mark Cared For (now)" : "Mark Cared For";
    openModal(plantModal);
  }

  function infoRow(key, val){
    const row = document.createElement("div");
    row.className = "info-row";
    const k = document.createElement("div");
    k.className = "info-key";
    k.textContent = key;
    const v = document.createElement("div");
    v.className = "info-val";
    v.textContent = val;
    row.appendChild(k);
    row.appendChild(v);
    return row;
  }

  function markCaredFor(plantId){
    const plant = PLANTS.find(p => p.id === plantId);
    if (!plant) return;

    const now = new Date();
    state.lastCaredById[plantId] = now.toISOString();

    state.careLog.unshift({
      plantId,
      name: plant.countLabel ? `${plant.name} ${plant.countLabel}` : plant.name,
      ts: now.toISOString()
    });

    // Keep log tidy
    state.careLog = state.careLog.slice(0, 30);

    saveState();
    renderPlants();
    renderCaredFor();
  }

  function renderCaredFor(){
    caredList.innerHTML = "";
    const log = state.careLog || [];

    if (log.length === 0){
      caredEmpty.hidden = false;
      return;
    }
    caredEmpty.hidden = true;

    for (const entry of log){
      const item = document.createElement("div");
      item.className = "cared-item";

      const left = document.createElement("div");
      left.className = "cared-left";

      const name = document.createElement("div");
      name.className = "cared-name";
      name.textContent = entry.name;

      const time = document.createElement("div");
      time.className = "cared-time";
      time.textContent = formatLongDateTime(new Date(entry.ts));

      left.appendChild(name);
      left.appendChild(time);

      const tag = document.createElement("div");
      tag.className = "cared-tag";
      tag.textContent = "Cared for";

      item.appendChild(left);
      item.appendChild(tag);

      caredList.appendChild(item);
    }
  }

  // ---------- Scheduling ----------
  function isDue(plant){
    const lastIso = state.lastCaredById[plant.id];
    if (!lastIso) return true; // if never tracked, it's due (gentle nudge to set baseline)
    const last = new Date(lastIso);
    const next = computeNextDueDate(plant, last);
    const today = startOfDay(new Date());
    return next.getTime() <= today.getTime();
  }

  function computeNextDueDate(plant, last){
    const base = last ? startOfDay(last) : startOfDay(new Date(0));
    const next = new Date(base);
    next.setDate(next.getDate() + plant.waterEveryDays);
    return startOfDay(next);
  }

  // ---------- Date helpers ----------
  function startOfDay(d){
    const x = new Date(d);
    x.setHours(0,0,0,0);
    return x;
  }

  function dateKey(d){
    const x = startOfDay(d);
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
  }

  // stable-ish daily index
  function dayIndex(mod, offset = 0){
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const seed = (y * 10000 + m * 100 + day + offset);
    // simple deterministic scramble
    const n = (seed * 2654435761) >>> 0;
    return n % mod;
  }

  function formatShortDate(d){
    return d.toLocaleDateString(undefined, { month:"short", day:"numeric" });
  }

  function formatLongDate(d){
    return d.toLocaleDateString(undefined, { weekday:"long", month:"long", day:"numeric" });
  }

  function formatLongDateTime(d){
    return d.toLocaleString(undefined, { weekday:"short", month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });
  }

  function simplifyLight(lightText){
    const t = lightText.toLowerCase();
    if (t.includes("bright") && t.includes("indirect")) return "Bright indirect";
    if (t.includes("medium") && t.includes("indirect")) return "Medium indirect";
    if (t.includes("low") && t.includes("bright")) return "Low–bright";
    if (t.includes("low")) return "Low light";
    if (t.includes("direct")) return "Direct sun";
    return "Light";
  }

  // ---------- Modal helpers ----------
  function openModal(modal){
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal){
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    if (plantModal.getAttribute("aria-hidden") === "true" && helpModal.getAttribute("aria-hidden") === "true"){
      document.body.style.overflow = "";
    }
  }

  // ---------- Storage helpers ----------
  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    }catch{
      return {};
    }
  }

  function saveState(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }catch{
      // ignore
    }
  }

})();