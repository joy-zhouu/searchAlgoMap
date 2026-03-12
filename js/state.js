// Shared algorithm visualization state
// All algorithm files read/write these globals; visualize.js renders them.

let vizOpen   = [];           // frontier nodes (shown in cyan)
let vizClosed = new Set();    // explored nodes (shown in orange)
let vizCameFrom = new Map();  // parent pointers for path reconstruction

function clearAlgoState() {
  vizOpen = [];
  vizClosed.clear();
  vizCameFrom.clear();
}
