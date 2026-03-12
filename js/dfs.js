// Depth-First Search
// Dives as deep as possible before backtracking.
// Uses a stack (LIFO): always processes the most recently discovered node first.
// Does NOT guarantee shortest path — purely for exploration visualization.
// NOT OPTIMAL

let dfsVisited = new Set(); // tracks pushed nodes to prevent re-pushing

function initDFS(startId, endId) {
  clearAlgoState();
  dfsVisited = new Set();

  dfsVisited.add(startId);
  vizOpen = [startId]; // stack
}

function stepDFS(endId) {
  if (vizOpen.length === 0) return 'no-path';

  let current = vizOpen.pop(); // pop from end (stack = LIFO)

  if (current === endId) return 'found';

  vizClosed.add(current);

  for (let edge of edges.get(current) || []) {
    if (dfsVisited.has(edge.to)) continue;
    dfsVisited.add(edge.to);      // mark on push to avoid re-pushing
    vizCameFrom.set(edge.to, current);
    vizOpen.push(edge.to);
  }

  return 'running';
}
