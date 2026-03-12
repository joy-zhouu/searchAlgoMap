// A* Search Algorithm
// f(n) = g(n) + h(n)
// g(n) = actual cost from start to n
// h(n) = heuristic estimate from n to goal (haversine straight-line distance)
// Optimal — explores fewest nodes when heuristic is admissible

let astarGScore = new Map(); // actual cost from start to each node
let astarFScore = new Map(); // g + h estimate for each node

function initAStar(startId, endId) {
  clearAlgoState();
  astarGScore.clear();
  astarFScore.clear();

  vizOpen = [startId];
  astarGScore.set(startId, 0);
  astarFScore.set(startId, heuristic(nodes.get(startId), nodes.get(endId)));
}

function stepAStar(endId) {
  if (vizOpen.length === 0) return 'no-path';

  // Pick node in frontier with lowest f-score
  let current = vizOpen.reduce((a, b) =>
    (astarFScore.get(a) ?? Infinity) < (astarFScore.get(b) ?? Infinity) ? a : b
  );

  if (current === endId) return 'found';

  vizOpen = vizOpen.filter(n => n !== current);
  vizClosed.add(current);

  for (let edge of edges.get(current) || []) {
    if (vizClosed.has(edge.to)) continue;

    let tentative = (astarGScore.get(current) ?? 0) + edge.cost;

    // Only update if this path to edge.to is strictly better
    if (tentative < (astarGScore.get(edge.to) ?? Infinity)) {
      vizCameFrom.set(edge.to, current);
      astarGScore.set(edge.to, tentative);
      astarFScore.set(edge.to, tentative + heuristic(nodes.get(edge.to), nodes.get(endId)));
      if (!vizOpen.includes(edge.to)) vizOpen.push(edge.to);
    }
  }

  return 'running';
}
