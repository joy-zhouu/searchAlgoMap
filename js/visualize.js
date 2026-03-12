// p5.js overlay — draws algorithm state on top of the Mapbox map.
// The canvas has pointer-events: none so all clicks pass through to the map.

let finalPath     = [];  // reconstructed path (start → end) stored when algorithm finishes
let pathProgress  = 0;   // 0..1, drives the animated path draw
let animatingPath = false;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);
  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  clear();
  if (!map || !map.loaded()) return;

  // ── Exploration tree edges (closed set) ────────────────────────────────────
  // Dim phosphor green — already-explored roads recede into the background so
  // the active frontier and final path stay visually dominant.
  stroke(0, 255, 65, 50);
  strokeWeight(2);
  noFill();
  for (let id of vizClosed) {
    const parentId = vizCameFrom.get(id);
    if (!parentId) continue;
    const a = nodes.get(id);
    const b = nodes.get(parentId);
    if (!a || !b) continue;
    const pa = map.project([a.lng, a.lat]);
    const pb = map.project([b.lng, b.lat]);
    line(pa.x, pa.y, pb.x, pb.y);
  }

  // ── Frontier dots (open set) ────────────────────────────────────────────────
  // Bright phosphor green — the active scanning edge, same hue as the panel
  // accent but at full intensity so it pops against the dim explored lines.
  stroke(0, 255, 65, 210);
  strokeWeight(5);
  for (let id of vizOpen) {
    const n = nodes.get(id);
    if (!n) continue;
    const p = map.project([n.lng, n.lat]);
    point(p.x, p.y);
  }

  // ── Start marker — phosphor green circle with glow ─────────────────────────
  if (startNodeId && nodes.has(startNodeId)) {
    const n = nodes.get(startNodeId);
    const p = map.project([n.lng, n.lat]);
    noStroke();
    fill(0, 255, 65, 50);   // outer glow
    circle(p.x, p.y, 28);
    fill(0, 255, 65);        // solid core — exact terminal accent green
    circle(p.x, p.y, 14);
  }

  // ── End marker — amber circle with glow ────────────────────────────────────
  // Amber matches the [HOP-OPT] warning colour in the panel, giving the end
  // marker a consistent semantic role (target / caution) across the whole UI.
  if (endNodeId && nodes.has(endNodeId)) {
    const n = nodes.get(endNodeId);
    const p = map.project([n.lng, n.lat]);
    noStroke();
    fill(255, 200, 0, 50);   // outer glow
    circle(p.x, p.y, 28);
    fill(255, 200, 0);        // solid core
    circle(p.x, p.y, 14);
  }

  // ── Step the algorithm (one step per frame) ────────────────────────────────
  if (algoStatus === 'running' && !paused) {
    const result = algorithms[currentAlgorithm].step(endNodeId);

    if (result === 'found') {
      algoStatus     = 'found';
      finalPath      = reconstructPath(endNodeId);
      pathProgress   = 0;
      animatingPath  = true;
      updateStatus();
      // Keep loop() alive — the path animation still needs frames
    } else if (result === 'no-path') {
      algoStatus = 'no-path';
      updateStatus();
      noLoop();
    }
  }

  // ── Draw path (animated on first reveal, static on subsequent redraws) ─────
  if (algoStatus === 'found') {
    if (animatingPath) {
      // Advance progress ~0.05 per frame → completes in ~20 frames (~0.33 s)
      pathProgress  = min(pathProgress + 0.05, 1);
      drawPath(finalPath, pathProgress);
      if (pathProgress >= 1) {
        animatingPath = false;
        noLoop(); // animation done; map.on('move') handles any future redraws
      }
    } else {
      // Redrawn statically (e.g. after map pan/zoom)
      drawPath(finalPath, 1);
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Walk cameFrom pointers from end back to start, then reverse so the array
// runs start → end (needed for correct animated drawing direction).
function reconstructPath(endId) {
  const path = [];
  let current = endId;
  while (current !== undefined && current !== null) {
    path.unshift(current);
    current = vizCameFrom.get(current);
    if (path.length > nodes.size) break; // safety guard
  }
  return path;
}

// Draw path from start up to `progress` fraction of its length (0..1).
// Renders a wide glow layer beneath a solid core line.
function drawPath(path, progress) {
  const count   = max(2, Math.ceil(progress * path.length));
  const partial = path.slice(0, count);
  if (partial.length < 2) return;

  // Glow layer — wide, semi-transparent phosphor green
  stroke(0, 255, 65, 60);
  strokeWeight(14);
  noFill();
  beginShape();
  for (let id of partial) {
    const n = nodes.get(id);
    if (!n) continue;
    const p = map.project([n.lng, n.lat]);
    vertex(p.x, p.y);
  }
  endShape();

  // Core layer — full-brightness phosphor green, the brightest element on screen
  stroke(0, 255, 65);
  strokeWeight(3);
  beginShape();
  for (let id of partial) {
    const n = nodes.get(id);
    if (!n) continue;
    const p = map.project([n.lng, n.lat]);
    vertex(p.x, p.y);
  }
  endShape();
}

// ── Keyboard controls ──────────────────────────────────────────────────────────
function keyPressed() {
  if (key === ' ' && algoStatus === 'running') {
    paused = !paused;
    paused ? noLoop() : loop();
    updateStatus();
  }
  if (key === 'r' || key === 'R') resetSearch();

  // Number keys 1–4 switch algorithms (mirrors the [1]–[4] labels in the panel)
  if (key === '1') selectAlgorithm('astar');
  if (key === '2') selectAlgorithm('dijkstra');
  if (key === '3') selectAlgorithm('bfs');
  if (key === '4') selectAlgorithm('dfs');
}
