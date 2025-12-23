// A* Search Algorithm Implementation
// Finds the shortest path between a starting point and a goal by combining the actual distance traveled with an estimate of the remaining distance
// f(n) = g(n) + h(n) -> total estimated cost
// g(n) = actual cost/distance from start to n
// h(n) = estimated cost/distance from n to goal (heuristic)
// Algorithm continuously selects nodes with the lowest f(n) value until it reaches the goal

// Pros: Efficient and optimal
// Cons: Requires a good heuristic function to estimate distances and memory intensive for large graphs

let openSet = []; // nodes to be evaluated
let closedSet = new Set(); // nodes already evaluated
let cameFrom = new Map(); 
let gScore = new Map();
let fScore = new Map();

// f(start) = g(start) + h(start) = 0 + h(start)
function initAStar(startId, endId) {
  openSet = [startId];
  closedSet.clear();
  cameFrom.clear();
  gScore.clear();
  fScore.clear();

  gScore.set(startId, 0);
  fScore.set(startId, heuristic(nodes.get(startId), nodes.get(endId)));
}

function stepAStar(endId) {
  if (openSet.length === 0) return false;

  // Get node in openSet with lowest fScore
  let current = openSet.reduce((a, b) =>
    fScore.get(a) < fScore.get(b) ? a : b
  );

  // Check if reached the goal
  if (current === endId) return true;

  // Move current from openSet to closedSet
  openSet = openSet.filter(n => n !== current);
  closedSet.add(current);

  for (let edge of edges.get(current) || []) {
    // Ignore already evaluated nodes
    if (closedSet.has(edge.to)) continue;

    let tentative = gScore.get(current) + edge.cost;

    // If neighbor not in openSet, add it
    if (!openSet.includes(edge.to)) {
      openSet.push(edge.to);
    // Else if this path is not better, skip
    } else if (tentative >= gScore.get(edge.to)) {
      continue;
    }

    // This path is the best until now, record it
    cameFrom.set(edge.to, current);
    gScore.set(edge.to, tentative);
    fScore.set(
      edge.to,
      tentative + heuristic(nodes.get(edge.to), nodes.get(endId))
    );
  }

  return false;
}


