mapboxgl.accessToken = '';

let map;
let startNodeId   = null;
let endNodeId     = null;
let selectingStart = true;
let algoStatus    = 'idle'; // 'idle' | 'selecting-end' | 'running' | 'found' | 'no-path'
let paused        = false;
let currentAlgorithm = 'astar';

const algorithms = {
  astar:    { init: initAStar,    step: stepAStar    },
  dijkstra: { init: initDijkstra, step: stepDijkstra },
  bfs:      { init: initBFS,      step: stepBFS      },
  dfs:      { init: initDFS,      step: stepDFS      }
};

const algoReadouts = {
  astar:    ['> LOADED: A*',         '> STRATEGY: HEURISTIC_GUIDED', '> GUARANTEE: DISTANCE_OPTIMAL'],
  dijkstra: ['> LOADED: DIJKSTRA',   '> STRATEGY: COST_EXPANSION',   '> GUARANTEE: DISTANCE_OPTIMAL'],
  bfs:      ['> LOADED: BFS',        '> STRATEGY: BREADTH_FIRST',    '> GUARANTEE: HOP_OPTIMAL'     ],
  dfs:      ['> LOADED: DFS',        '> STRATEGY: DEPTH_FIRST',      '> GUARANTEE: !! NONE !!'      ]
};

function initMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-73.56399250, 45.50866990],
    zoom: 15
  });

  map.on('load', () => {
    loadGraph();

    map.getCanvas().addEventListener('click', (e) => {
      const rect  = map.getCanvas().getBoundingClientRect();
      const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      handleMapClick({ lngLat: map.unproject(point) });
    });
  });

  // Keep p5 overlay in sync when map is panned / zoomed
  // redraw() forces one extra draw() even when noLoop() is active
  map.on('move', () => redraw());
  map.on('zoom', () => redraw());
}

function handleMapClick(e) {
  if (!nodes || nodes.size === 0) return; // graph not loaded yet

  const nearestId = findClosestNode(e.lngLat.lng, e.lngLat.lat);
  if (!nearestId) return;

  if (selectingStart) {
    // --- Picking start ---
    startNodeId    = nearestId;
    endNodeId      = null;
    selectingStart = false;
    paused         = false;
    algoStatus     = 'selecting-end';
    clearAlgoState();
    noLoop();        // stop any in-progress algorithm
    updateStatus();
    redraw();
  } else {
    // --- Picking end → kick off algorithm ---
    endNodeId      = nearestId;
    selectingStart = true;
    paused         = false;
    algoStatus     = 'running';
    algorithms[currentAlgorithm].init(startNodeId, endNodeId);
    updateStatus();
    loop();          // start the p5 draw loop
  }
}

// Full reset — clears everything and waits for a new start click
function resetSearch() {
  startNodeId    = null;
  endNodeId      = null;
  selectingStart = true;
  paused         = false;
  algoStatus     = 'idle';
  clearAlgoState();
  updateStatus();
  noLoop();
  redraw();
}

// Called by algorithm selector buttons in the UI
function selectAlgorithm(algo) {
  currentAlgorithm = algo;
  resetSearch();
  updateAlgoButtons();
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function updateStatus() {
  const text   = document.getElementById('status-text');
  const cursor = document.getElementById('status-cursor');
  if (!text) return;

  const msgs = {
    'idle':          '> AWAITING INPUT',
    'selecting-end': '> START SET. SELECT END',
    'running':       paused ? '> EXECUTION PAUSED' : '> SCANNING NETWORK',
    'found':         '> PATH LOCATED',
    'no-path':       '> ERROR: NO ROUTE FOUND'
  };

  text.textContent = msgs[algoStatus] || msgs['idle'];

  // Show blinking cursor only when actively waiting or running
  if (cursor) {
    const active = algoStatus === 'idle' || algoStatus === 'selecting-end' ||
                   (algoStatus === 'running' && !paused);
    cursor.style.visibility = active ? 'visible' : 'hidden';
  }
}

function updateAlgoButtons() {
  document.querySelectorAll('.algo-item').forEach(btn => {
    const isActive = btn.dataset.algo === currentAlgorithm;
    btn.classList.toggle('active', isActive);
    const ind = btn.querySelector('.algo-indicator');
    if (ind) ind.innerHTML = isActive ? '&#9654;' : '&nbsp;';
  });

  const readout = document.getElementById('algo-readout');
  if (readout) {
    readout.innerHTML = algoReadouts[currentAlgorithm]
      .map(line => `<div>${line}</div>`)
      .join('');
  }
}
