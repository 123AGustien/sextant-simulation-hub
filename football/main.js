// =====================================================
// SEXTANT SIMULATION HUB — FOOTBALL ORCHESTRATOR v8
// SINGLE ENTRY CONTROL LAYER
// =====================================================

// ======================= GLOBAL STATE =======================
let running = false;

// Core runtime hooks (must exist from engine_v8.js)
let engineV8Tick;

// ======================= BOOT SEQUENCE =======================
function bootEngine() {
  console.log("[Sextant] Booting Football Simulation Engine v8...");

  // Ensure base simulation is initialized
  if (typeof init === "function") {
    init();
  } else {
    console.error("init() not found. core/players.js may not be loaded.");
    return;
  }

  // Attach orchestrator
  if (typeof engineV8Tick === "function") {
    console.log("[Sextant] Engine v8 attached.");
  } else {
    console.error("engineV8Tick not found. engine_v8.js missing or not loaded.");
    return;
  }

  running = true;

  loop();
}

// ======================= MAIN LOOP =======================
function loop() {
  if (!running) return;

  // ALL SYSTEMS FLOW THROUGH V8
  engineV8Tick();

  requestAnimationFrame(loop);
}

// ======================= CONTROL API =======================
function pauseEngine() {
  running = false;
}

function resumeEngine() {
  if (!running) {
    running = true;
    loop();
  }
}

function resetEngine() {
  console.log("[Sextant] Resetting simulation...");

  if (typeof init === "function") {
    init();
  }
}

// ======================= DEBUG HOOK =======================
function getEngineStatus() {
  return {
    running,
    engineAttached: typeof engineV8Tick === "function"
  };
}

// ======================= START =======================
bootEngine();
