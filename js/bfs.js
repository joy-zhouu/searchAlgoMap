// Breadth-First Search
// Explores nodes level by level (by hop count, not distance).
// Optimal for unweighted graphs — finds path with fewest edges.
// On weighted road networks it does NOT minimize distance, only hop count.
// Uses a queue (FIFO): neighbours are processed in discovery order.

let bfsVisited = new Set(); // tracks enqueued nodes to prevent duplicates

function initBFS(startId, endId) {
  clearAlgoState();
  bfsVisited = new Set();

  bfsVisited.add(startId);
  vizOpen = [startId]; // queue
}

function stepBFS(endId) {
  if (vizOpen.length === 0) return 'no-path';

  let current = vizOpen.shift(); // dequeue from front

  if (current === endId) return 'found';

  vizClosed.add(current);

  for (let edge of edges.get(current) || []) {
    if (bfsVisited.has(edge.to)) continue;
    bfsVisited.add(edge.to);       // mark on enqueue to avoid duplicates
    vizCameFrom.set(edge.to, current);
    vizOpen.push(edge.to);
  }

  return 'running';
}
