// Dijkstra's Algorithm
// Like A* but with h(n) = 0 — no heuristic, explores by cost alone.
// Guarantees shortest path by actual travel distance.
// Explores in all directions uniformly, so it's slower than A* on geographic maps.
// Optimal

let dijkstraDist = new Map(); // shortest known distance from start to each node

function initDijkstra(startId, endId) {
  clearAlgoState();
  dijkstraDist.clear();

  dijkstraDist.set(startId, 0);
  vizOpen = [startId];
}

function stepDijkstra(endId) {
  if (vizOpen.length === 0) return 'no-path';

  // Pick node in frontier with lowest known distance
  let current = vizOpen.reduce((a, b) =>
    (dijkstraDist.get(a) ?? Infinity) < (dijkstraDist.get(b) ?? Infinity) ? a : b
  );

  if (current === endId) return 'found';

  vizOpen = vizOpen.filter(n => n !== current);
  vizClosed.add(current);

  for (let edge of edges.get(current) || []) {
    if (vizClosed.has(edge.to)) continue;

    let newDist = (dijkstraDist.get(current) ?? Infinity) + edge.cost;

    if (newDist < (dijkstraDist.get(edge.to) ?? Infinity)) {
      dijkstraDist.set(edge.to, newDist);
      vizCameFrom.set(edge.to, current);
      if (!vizOpen.includes(edge.to)) vizOpen.push(edge.to);
    }
  }

  return 'running';
}
