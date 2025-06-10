function logToPx(value, dataMin, dataMax, pxMin, pxMax) {
  const logMin = Math.log10(dataMin);
  const logMax = Math.log10(dataMax);
  const logVal = Math.log10(value);
  return pxMin + ((logVal - logMin) / (logMax - logMin)) * (pxMax - pxMin);
}

function pxToLogValue(pos, dataMin, dataMax, pxMin, pxMax) {
  const logMin = Math.log10(dataMin);
  const logMax = Math.log10(dataMax);
  const scale = 1 - (pos - pxMin) / (pxMax - pxMin); // inverted axis
  return Math.pow(10, logMin + scale * (logMax - logMin));
}

function getInterpolatedY(curve, x) {
  const step = 0.5;
  const length = curve.getTotalLength();
  let last = curve.getPointAtLength(0);
  for (let i = step; i <= length; i += step) {
    const pt = curve.getPointAtLength(i);
    if ((last.x <= x && pt.x >= x) || (last.x >= x && pt.x <= x)) {
      const ratio = (x - last.x) / (pt.x - last.x);
      return last.y + ratio * (pt.y - last.y);
    }
    last = pt;
  }
  return last.y;
}

let selectedCurve = null;
let ikminValue = null;

function setupFuseInteractivity() {
  const svg = document.getElementById("fuseGraph");
  const curves = svg.querySelectorAll("g#kurve path");

  // Tooltip element
  const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
  tooltip.setAttribute("id", "tooltip");
  tooltip.setAttribute("fill", "black");
  tooltip.setAttribute("font-size", "14");
  tooltip.style.display = "none";
  svg.appendChild(tooltip);




curves.forEach(curve => {
  if (!curve.getTotalLength) return;

  const rawLabel = curve.id || curve.getAttribute("data-label") || "Ukendt sikring";
  const cleanLabel = rawLabel.replace(/^_/, "").replace(/--.*$/, "");

  // Set base styling
  curve.setAttribute("stroke", "black");
  curve.setAttribute("stroke-width", "1.5");
  curve.setAttribute("fill", "none");

  // Create invisible fat hitbox ABOVE the curve
  const hitbox = curve.cloneNode();
  hitbox.setAttribute("stroke", "black");
  hitbox.setAttribute("stroke-width", "10");
  hitbox.setAttribute("stroke-opacity", "0.0001"); // fully invisible
  hitbox.setAttribute("fill", "none");
  hitbox.setAttribute("pointer-events", "stroke");

  // Insert hitbox after curve (so visual changes still apply)
  if (curve.nextSibling) {
    curve.parentNode.insertBefore(hitbox, curve.nextSibling);
  } else {
    curve.parentNode.appendChild(hitbox);
  }

  hitbox.addEventListener("mouseover", () => {
    curve.setAttribute("stroke-width", "3");
    tooltip.textContent = cleanLabel;
    tooltip.style.display = "block";
  });

  hitbox.addEventListener("mouseout", () => {
    if (curve !== selectedCurve) {
      curve.setAttribute("stroke-width", "1.5");
    }
    tooltip.style.display = "none";
  });

  hitbox.addEventListener("mousemove", (e) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    tooltip.setAttribute("x", svgPt.x + 8);
    tooltip.setAttribute("y", svgPt.y - 8);
  });

  hitbox.addEventListener("click", () => {
    if (selectedCurve && selectedCurve !== curve) {
      selectedCurve.setAttribute("stroke-width", "1.5");
    }
    selectedCurve = curve;
    curve.setAttribute("stroke-width", "3");
    if (ikminValue > 4) drawCrosshair(ikminValue, curve);
  });
});





  document.getElementById("ikminInput").addEventListener("input", e => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      ikminValue = val;
      if (selectedCurve && ikminValue > 4) drawCrosshair(ikminValue, selectedCurve);
    }
  });
}

function drawCrosshair(ikmin, curve) {
  const svg = document.getElementById("fuseGraph");

  const ikMin = 4;
  const ikMax = 4000;
  const tMin = 0.001;
  const tMax = 10000;

  const svgXmin = 34.576;
  const svgXmax = 491.316;
  const svgYmin = 65.782;
  const svgYmax = svgYmin + 533.138;

  svg.querySelectorAll('.marker').forEach(e => e.remove());

  const x = logToPx(ikmin, ikMin, ikMax, svgXmin, svgXmax);
  const y = getInterpolatedY(curve, x);
  const time = pxToLogValue(y, tMin, tMax, svgYmin, svgYmax);

  const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  vLine.setAttribute("x1", x);
  vLine.setAttribute("x2", x);
  vLine.setAttribute("y1", svgYmin);
  vLine.setAttribute("y2", svgYmax);
  vLine.setAttribute("stroke", "red");
  vLine.setAttribute("class", "marker");
  svg.appendChild(vLine);

  const hLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  hLine.setAttribute("x1", svgXmin);
  hLine.setAttribute("x2", svgXmax);
  hLine.setAttribute("y1", y);
  hLine.setAttribute("y2", y);
  hLine.setAttribute("stroke", "red");
  hLine.setAttribute("class", "marker");
  svg.appendChild(hLine);

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", 4);
  circle.setAttribute("fill", "#0376ea");
  circle.setAttribute("class", "marker");
  svg.appendChild(circle);

  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", svgXmax + 10);
  label.setAttribute("y", y + 4);
  label.setAttribute("fill", "black");
  label.setAttribute("class", "marker");
  label.textContent = `${time.toFixed(3)} s`;
  svg.appendChild(label);
}

window.addEventListener("DOMContentLoaded", setupFuseInteractivity);
