// script.js

let ktTempData = null;

document.addEventListener("DOMContentLoaded", () => {
  // --- 1) Felter til localStorage ---
  const inputIDs = [
    "p", "cosphi", "fasevalg", "ib_input",
    "in", "sikring_type",
    "model_ie1", "ie1",
    "model_ie2", "ie2",
    "billede_s1", "bogstav_s1",
    "billede_s2", "bogstav_s2",
    "temp_s1", "materiale_s1", "kt_tabel_s1", "kt_s1",
    "kredse_s1", "ks_tabel_s1", "ks_s1",
    "temp_s2", "materiale_s2", "kt_tabel_s2", "kt_s2",
    "kredse_s2", "ks_tabel_s2", "ks_s2",
    "iz1", "iz2",
    "ikminA", "lgd1", "lgd2", "s1", "s2",
    "kvalue", "ts", "rho",
    "gruppe_tilh", "gruppe_max",
    "kabel_nr", "pe_leder"
  ];

  // Load/save fra localStorage
  inputIDs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const stored = localStorage.getItem(id);
    if (stored !== null) el.value = stored;
    el.addEventListener("input", () => {
      localStorage.setItem(id, el.value);
      calculateAll();
      updateIzEmojis();
    });
    if (el.tagName === "SELECT") {
      el.addEventListener("change", () => {
        localStorage.setItem(id, el.value);
        calculateAll();
        updateIzEmojis();
      });
    }
  });

// --- Korrektionsfaktor temperatur data ---
  fetch('datakilder/data/korrektionsfaktor-temperatur/JSON-B.52.14-KORREKTIONSFAKTOR-TEMPERATUR.json')
    .then(r => r.json())
    .then(d => {
      ktTempData = d;
      updateTempKt('s1');
      updateTempKt('s2');
    });

  // --- 2) Sync af mm² felter (punkt 7 + 9) ---
  const syncFields = selector => {
    const fields = Array.from(document.querySelectorAll(selector));
    fields.forEach(f => {
      f.addEventListener("input", () => {
        fields.forEach(other => {
          if (other !== f) other.value = f.value;
        });
        calculateAll();
        updateIzEmojis();
      });
    });
  };
  syncFields("input#s1");  // synkroniser alle S1
  syncFields("input#s2");  // synkroniser alle S2

  // --- 3) Nulstil-knap ---
  document.getElementById('resetAll').addEventListener('click', () => {
    // 1) Clear out all stored input values
    localStorage.clear();
  
    // 2) Restore inputs to their HTML defaults
    document.querySelectorAll('input, select').forEach(el => {
      el.value = el.defaultValue;
    });
  
    // 3) Clear outputs
    document.querySelectorAll('output').forEach(o => o.value = '');
  
    // 4) Re-run your calculators and autosize
    if (typeof calculate === 'function')    calculate();
    if (typeof calculateIzTs === 'function') calculateIzTs();
    if (typeof autoSize === 'function') {
      document.querySelectorAll('input[type="text"], input[type="number"]')
        .forEach(i => autoSize(i));
    }
  });
  
  
  


  // Print til PDF
document.getElementById('printBtn').addEventListener('click', () => {
  window.print();
});


  // --- 4) Popup-billeder ---
  const popupContainer = document.getElementById("popupContainer");
  const popupImage     = document.getElementById("popupImage");
  document.addEventListener("click", e => {
    const tgt = e.target;
    if (tgt.classList.contains("popupToggle") && tgt.dataset.image) {
      popupImage.src = tgt.dataset.image;
      popupContainer.classList.remove("popup-hidden");
      popupContainer.style.display = "flex";
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      popupContainer.classList.add("popup-hidden");
      popupContainer.style.display = "none";
    }
  });
  popupContainer.addEventListener("click", () => {
    popupContainer.classList.add("popup-hidden");
    popupContainer.style.display = "none";
  });
  popupImage.addEventListener("click", e => e.stopPropagation());

  // --- 5) Dynamiske lyttere KT/KS + Iz-emoji ---
  document.getElementById('temp_s1')?.addEventListener('input', () => updateTempKt('s1'));
  document.getElementById('temp_s2')?.addEventListener('input', () => updateTempKt('s2'));
  document.getElementById('materiale_s1')?.addEventListener('change', () => updateTempKt('s1'));
  document.getElementById('materiale_s2')?.addEventListener('change', () => updateTempKt('s2'));
  document.getElementById("bogstav_s1")?.addEventListener("input", () => {
    updateKorrektionsfaktorer();
    updateIzEmojis();
  });
  document.getElementById("bogstav_s2")?.addEventListener("input", () => {
    updateKorrektionsfaktorer();
    updateIzEmojis();
  });
  document.getElementById("fasevalg")?.addEventListener("change", updateIzEmojis);

  // Første beregning
  calculateAll();
  updateKorrektionsfaktorer();
  updateTempKt('s1');
  updateTempKt('s2');
  updateIzEmojis();
});

// ----------------------------------------
//  Beregningskæde
// ----------------------------------------
function calculateAll() {
  calculateIB();
  calculateIzNødvendig();
  calculateIzTs();
  calculateRA_RLS_Ikmin();
  calculateKortslutning();
  calculateSpændingsfald();
  calculateObControl();
  calculateTkControl();
  formatAllOutputsToDanish();
}

// 1) IB
function calculateIB() {
  const ibInEl  = document.getElementById("ib_input");
  const ibOutEl = document.getElementById("ib");

  // 1a) manual override?
  const manual = ibInEl.value.trim();
  let ib;

  if (manual !== "") {
    ib = parseFloat(manual);
  } else {
    // 1b) fallback to formula
    const P     = parseFloat(document.getElementById("p")?.value)      || 0;
    const cosφ  = parseFloat(document.getElementById("cosphi")?.value) || 0;
    const fase  = document.getElementById("fasevalg")?.value;
    let divisor = 230;
    if (fase === "2f") divisor = 400;
    if (fase === "3f") divisor = 400 * Math.sqrt(3);
    ib = (P && cosφ) ? (P / (divisor * cosφ)) : NaN;
  }

  // 2) output
  ibOutEl.value = !isNaN(ib) ? ib.toFixed(2) : "";
}

// attach to all relevant inputs
["p", "cosphi", "fasevalg", "ib_input"].forEach(id => {
  document.getElementById(id)
    .addEventListener("input", calculateIB);
});

// run once on load
calculateIB();




// 2) Iz_nødvendig
function calculateIzNødvendig() {
  const In  = parseFloat(document.getElementById("in")?.value)    || 0;
  const kt1 = parseFloat(document.getElementById("kt_s1")?.value) || 0;
  const ks1 = parseFloat(document.getElementById("ks_s1")?.value) || 0;
  const kt2 = parseFloat(document.getElementById("kt_s2")?.value) || 0;
  const ks2 = parseFloat(document.getElementById("ks_s2")?.value) || 0;

  const iz1n = (In && kt1 && ks1) ? In / (kt1 * ks1) : NaN;
  const iz2n = (In && kt2 && ks2) ? In / (kt2 * ks2) : NaN;

  document.getElementById("iz_s1").textContent = !isNaN(iz1n) ? iz1n.toFixed(2) : "";
  document.getElementById("iz_s2").textContent = !isNaN(iz2n) ? iz2n.toFixed(2) : "";
}

function calculateIzTs() {
  // grab all six numeric inputs
  const iz1 = parseFloat(document.getElementById("iz1")?.value)   || 0;
  const kt1 = parseFloat(document.getElementById("kt_s1")?.value) || 0;
  const ks1 = parseFloat(document.getElementById("ks_s1")?.value) || 0;
  const iz2 = parseFloat(document.getElementById("iz2")?.value)   || 0;
  const kt2 = parseFloat(document.getElementById("kt_s2")?.value) || 0;
  const ks2 = parseFloat(document.getElementById("ks_s2")?.value) || 0;

  // S1–branch
  const iz1tsVal  = iz1 * kt1 * ks1;
  const inputs1El = document.getElementById("iz1tsInputs");
  const result1El = document.getElementById("iz1ts");

  if (!isNaN(iz1tsVal) && iz1tsVal !== 0) {
    inputs1El.textContent =
      `${iz1.toFixed(2)}A • ${kt1.toFixed(2)} • ${ks1.toFixed(2)}`;
    result1El.value = iz1tsVal.toFixed(2);
  } else {
    inputs1El.textContent = "";
    result1El.value      = "";
  }

  // S2–branch
  const iz2tsVal  = iz2 * kt2 * ks2;
  const inputs2El = document.getElementById("iz2tsInputs");
  const result2El = document.getElementById("iz2ts");

  if (!isNaN(iz2tsVal) && iz2tsVal !== 0) {
    inputs2El.textContent =
      `${iz2.toFixed(2)}A • ${kt2.toFixed(2)} • ${ks2.toFixed(2)}`;
    result2El.value = iz2tsVal.toFixed(2);
  } else {
    inputs2El.textContent = "";
    result2El.value      = "";
  }
}




// 4) RA, RLS, ΣR, Ikmin
function calculateRA_RLS_Ikmin() {
  const ikminA = parseFloat(document.getElementById("ikminA")?.value)||0;
  const lgd1   = parseFloat(document.getElementById("lgd1")?.value)  ||0;
  const lgd2   = parseFloat(document.getElementById("lgd2")?.value)  ||0;
  const s1     = parseFloat(document.getElementById("s1")?.value)    ||1;
  const s2     = parseFloat(document.getElementById("s2")?.value)    ||1;

  const ra     = ikminA ? 230/ikminA : 0;
  const rls1   = lgd1 ? 0.0175*2*lgd1/s1 : 0;
  const rls2   = lgd2 ? 0.0175*2*lgd2/s2 : 0;
  const sumR   = ra + (rls1+rls2)*1.5;
  const ikminB = sumR ? 230/sumR : 0;

  document.getElementById("ra").textContent      = ra.toFixed(3);
  document.getElementById("rls1").textContent   = rls1.toFixed(3);
  document.getElementById("rls2").textContent   = rls2.toFixed(3);
  document.getElementById("r_total").textContent= sumR.toFixed(3);
  document.getElementById("ikminB").textContent = ikminB.toFixed(2);
}

// 5) Kortslutningstider
function calculateKortslutning() {
  const k     = parseFloat(document.getElementById("kvalue")?.value)  ||0;
  const s1    = parseFloat(document.getElementById("s1")?.value)    ||0;
  const s2    = parseFloat(document.getElementById("s2")?.value)    ||0;
  const ikminB= parseFloat(document.getElementById("ikminB")?.textContent)||0;
  const tk1   = (k && s1 && ikminB) ? Math.pow((k*s1/ikminB),2) : NaN;
  const tk2   = (k && s2 && ikminB) ? Math.pow((k*s2/ikminB),2) : NaN;

  document.getElementById("tk1").textContent = !isNaN(tk1) ? tk1.toFixed(2) : "";
  document.getElementById("tk2").textContent = !isNaN(tk2) ? tk2.toFixed(2) : "";
}

// 7) OB-kontrol
function calculateObControl() {
  const ib   = parseFloat(document.getElementById("ib")?.textContent)||0;  
  const inV  = parseFloat(document.getElementById("in")?.value)       ||0;  
  const iz1  = parseFloat(document.getElementById("iz1ts")?.textContent)||0;
  const iz2  = parseFloat(document.getElementById("iz2ts")?.textContent)||0;
  const ok1  = ib <= inV && inV <= iz1;
  const ok2  = ib <= inV && inV <= iz2;

  document.getElementById("ob_s1").textContent =
    `${ib}A ≤ ${inV}A ≤ ${iz1}A  =  ${ok1 ? "GODKENDT":"IKKE GODKENDT"}`;
  document.getElementById("ob_s2").textContent =
    `${ib}A ≤ ${inV}A ≤ ${iz2}A  =  ${ok2 ? "GODKENDT":"IKKE GODKENDT"}`;
}

// 8) tK vs tS
function calculateTkControl() {
  const tk1 = parseFloat(document.getElementById("tk1")?.textContent) || 0;
  const tk2 = parseFloat(document.getElementById("tk2")?.textContent) || 0;
  const ts  = parseFloat(document.getElementById("ts")?.value)        || 0;
  const ok1 = tk1 > ts;
  const ok2 = tk2 > ts;

  document.getElementById("tk_s1_check").textContent =
    `${tk1.toFixed(2)}s > ${ts.toFixed(2)}s  =  ${ok1 ? "GODKENDT":"IKKE GODKENDT"}`;
  document.getElementById("tk_s2_check").textContent =
    `${tk2.toFixed(2)}s > ${ts.toFixed(2)}s  =  ${ok2 ? "GODKENDT":"IKKE GODKENDT"}`;
}

// 11) Spændingsfald
function calculateSpændingsfald() {
  // grab raw values (may be NaN if empty)
  const ibRaw     = parseFloat(document.getElementById("ib")?.textContent);
  const cosphiRaw = parseFloat(document.getElementById("cosphi")?.value);
  const rhoRaw    = parseFloat(document.getElementById("rho")?.value);
  const lgd1Raw   = parseFloat(document.getElementById("lgd1")?.value);
  const lgd2Raw   = parseFloat(document.getElementById("lgd2")?.value);
  const s1Raw     = parseFloat(document.getElementById("s1")?.value);
  const s2Raw     = parseFloat(document.getElementById("s2")?.value);
  const fase      = document.getElementById("fasevalg")?.value;

  // normalize to 0 if missing
  const ib     = isNaN(ibRaw)     ? 0 : ibRaw;
  const cosphi = isNaN(cosphiRaw) ? 0 : cosphiRaw;
  const rho    = isNaN(rhoRaw)    ? 0 : rhoRaw;
  const lgd1   = isNaN(lgd1Raw)   ? 0 : lgd1Raw;
  const lgd2   = isNaN(lgd2Raw)   ? 0 : lgd2Raw;
  const s1     = isNaN(s1Raw)     ? 0 : s1Raw;
  const s2     = isNaN(s2Raw)     ? 0 : s2Raw;

  // number of conductors & reference voltage
  const faktor = (fase === "3f") ? 1 : 2;
  const uRef   = (fase === "2f") ? 400 : 230;

  // calculate partial drops, but only if size>0
  const du1 = (s1 > 0)
    ? ib * cosphi * 1.25 * rho * faktor * lgd1 / s1
    : 0;
  const du2 = (s2 > 0)
    ? ib * cosphi * 1.25 * rho * faktor * lgd2 / s2
    : 0;
  const duPct = (du1 + du2) * 100 / uRef;

  // render the formulas
  document.getElementById("duf_formula_s1").innerHTML =
    `ΔUf S1 = ${ib.toFixed(2)} A • ${cosphi.toFixed(2)}ϕ • 1,25 • ${rho.toFixed(3)} Ω • ` +
    `${faktor} • ${lgd1.toFixed(2)} m / ${s1.toFixed(2)} mm² = ` +
    `<output>${du1.toFixed(2)} V</output>`;

  document.getElementById("duf_formula_s2").innerHTML =
    `ΔUf S2 = ${ib.toFixed(2)} A • ${cosphi.toFixed(2)}ϕ • 1,25 • ${rho.toFixed(3)} Ω • ` +
    `${faktor} • ${lgd2.toFixed(2)} m / ${s2.toFixed(2)} mm² = ` +
    `<output>${du2.toFixed(2)} V</output>`;

  document.getElementById("du_percent_formula").innerHTML =
    `ΔU% = (${du1.toFixed(2)} + ${du2.toFixed(2)}) • 100 / ${uRef} = ` +
    `<output>${duPct.toFixed(2)} %</output>`;
}


// ----------------------------------------
// DYNAMISKE FELTER (KT/KS + Iz-emoji)
// ----------------------------------------
function updateKorrektionsfaktorer() {
  const bog1 = document.getElementById("bogstav_s1")?.value.toUpperCase();
  const bog2 = document.getElementById("bogstav_s2")?.value.toUpperCase();
  updateFieldsForSide(bog1, "s1");
  updateFieldsForSide(bog2, "s2");
}

function updateFieldsForSide(bog, side) {
  const ktTab = document.getElementById(`kt_tabel_${side}`);
  const ksTab = document.getElementById(`ks_tabel_${side}`);
  const eKt   = document.querySelector(`.emojiKt_${side}`);
  const eKs   = document.querySelector(`.emojiKs_${side}`);
  if (!bog) {
    ktTab.value = "";
    ksTab.value = "";
    eKt.innerHTML = "";
    eKs.innerHTML = "";
    return;
  }
  // KT
  if (["A1","A2","B1","B2","C","E","F","G"].includes(bog)) {
    ktTab.value = "B.52.14";
    eKt.innerHTML = `<span class="popupToggle" data-image="billeder/B.52.14.png">📄</span>`;
  } else {
    ktTab.value = "B.52.15 (60-3-64)";
    eKt.innerHTML = `<span class="popupToggle" data-image="billeder/TBD.png">📄</span>`;
  }
  // KS
  if (["A1","A2","B1","B2","C"].includes(bog)) {
    ksTab.value = "B.52.17";
    eKs.innerHTML = `<span class="popupToggle" data-image="datakilder\data\korrektionsfaktor-samlet-fremføring\KILDE-BILLEDE-B.52.17-SAMLET-FREMFØRING.png">📄</span>`;
  } else if (bog === "E") {
    ksTab.value = "B.52.17 ELLER B.52.20";
    eKs.innerHTML = `<span class="popupToggle" data-image="datakilder\data\korrektionsfaktor-samlet-fremføring\KILDE-BILLEDE-B.52.17-SAMLET-FREMFØRING.png">📄</span>`;
  } else {
    const map = { D:"SE 60-3-64", D2:"SE 60-3-64", F:"SE 60-3-64", G:"SE 60-3-64" };
    ksTab.value = map[bog] || "";
    eKs.innerHTML = `<span class="popupToggle" data-image="billeder/TBD.png">📄</span>`;
  }
}

function updateIzEmojis() {
  const fase = document.getElementById("fasevalg")?.value;
  const bog1 = document.getElementById("bogstav_s1")?.value.toUpperCase();
  const bog2 = document.getElementById("bogstav_s2")?.value.toUpperCase();
  setIzEmoji(bog1, fase, "emojiIz1");
  setIzEmoji(bog2, fase, "emojiIz2");
}

function setIzEmoji(bog, fase, cls) {
  const tgt = document.querySelector(`.${cls}`);
  if (!tgt) return;

  // pick the right <select> based on whether we're in S1 or S2
  const cableTypeId = cls === 'emojiIz1' ? 'cableType_S1'
                                        : 'cableType_S2';
  const cableType   = document.getElementById(cableTypeId)?.value;

  let img = "";

  // override for GUMMI_90
  if (cableType === "GUMMI_90") {
    img = "billeder/3fgummistroemvaerdi.png";

  } else {
    // original XLPE logic
    const low  = ["A1","A2","B1","B2","C","D","D2"];
    const high = ["E","F","G"];

    if (fase === "1f" || fase === "2f") {
      img = low.includes(bog)   ? "billeder/B.52.3.png"
          : high.includes(bog)  ? "billeder/B.52.12.png"
          : "";
    }
    else if (fase === "3f") {
      img = low.includes(bog)   ? "billeder/B.52.5.png"
          : high.includes(bog)  ? "billeder/B.52.12.png"
          : "";
    }
  }

  tgt.innerHTML = img
    ? `<span class="popupToggle" data-image="${img}">📄</span>`
    : "";

}

function updateTempKt(side) {
  if (!ktTempData) return;
  const tEl  = document.getElementById(`temp_${side}`);
  const mEl  = document.getElementById(`materiale_${side}`);
  const ktEl = document.getElementById(`kt_${side}`);
  if (!tEl || !mEl || !ktEl) return;
  const temp = parseFloat(tEl.value);
  const mat  = mEl.value.toUpperCase();
  if (isNaN(temp) || !mat) { ktEl.value = ""; return; }
  let row = ktTempData.find(r => parseFloat(r.omgivelsestemperatur) >= temp);
  if (!row) row = ktTempData[ktTempData.length - 1];
  const val = parseFloat(row[mat]);
  ktEl.value = isNaN(val) ? "" : val;
  calculateAll();
}