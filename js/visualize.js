let paused = false;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);
  clear();
  noLoop(); // pause until start & end selected
}

function draw() {
  clear();

  if (!map || !map.loaded()) return;

  // Draw closed set
  stroke(255, 165, 0);
  strokeWeight(3);
  for (let id of closedSet) {
    const n = nodes.get(id);
    if (!n) continue;
    const p = map.project([n.lng, n.lat]);
    point(p.x, p.y);
  }

  // Draw open set
  stroke(0, 255, 255);
  for (let id of openSet) {
    const n = nodes.get(id);
    if (!n) continue;
    const p = map.project([n.lng, n.lat]);
    point(p.x, p.y);
  }

    // Draw start node (green)
  if (startNodeId) {
    const n = nodes.get(startNodeId);
    const p = map.project([n.lng, n.lat]);
    fill(0, 255, 0);
    noStroke();
    circle(p.x, p.y, 12);
  }

  // Draw end node (red)
  if (endNodeId) {
    const n = nodes.get(endNodeId);
    const p = map.project([n.lng, n.lat]);
    fill(255, 0, 0);
    noStroke();
    circle(p.x, p.y, 12);
  }

  if (startNodeId && endNodeId && !pathFound && !paused) {
    pathFound = stepAStar(endNodeId);
  }

  if (pathFound) {
    drawPath(endNodeId);
  }
}

// Draw path after goal reached
function drawPath(endId) {
  stroke(0, 0, 255);
  strokeWeight(5);
  noFill();
  beginShape();

  let current = endId;
  while (current) {
    let n = nodes.get(current);
    if (!n) break;
    let p = map.project([n.lng, n.lat]);
    vertex(p.x, p.y);
    current = cameFrom.get(current);
  }

  endShape();
}


// Keyboard controls
function keyPressed() {
  if (key === ' ') {
    paused = !paused;
    paused ? noLoop() : loop();
  }
}
