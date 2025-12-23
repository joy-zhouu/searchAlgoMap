// Convert geojson to graph

let nodes = new Map();
let edges = new Map();

class Node {
  constructor(id, lng, lat) {
    this.id = id;
    this.lng = lng;
    this.lat = lat;
  }
}

class Edge {
  constructor(to, cost) {
    this.to = to;
    this.cost = cost;
  }
}

function loadGraph() {
  fetch('data/roads.geojson')
  .then(res => res.json())
  .then(data => {
    console.log('GeoJSON loaded:', data);
    buildGraph(data);
  })
  .catch(err => console.error('Failed to load GeoJSON', err));
}

function buildGraph(geojson) {
  geojson.features.forEach(feature => {
    let coords = feature.geometry.coordinates;

    for (let i = 0; i < coords.length - 1; i++) {
      let a = coords[i];
      let b = coords[i + 1];

      let idA = `${a[0]},${a[1]}`;
      let idB = `${b[0]},${b[1]}`;

      if (!nodes.has(idA)) nodes.set(idA, new Node(idA, a[0], a[1]));
      if (!nodes.has(idB)) nodes.set(idB, new Node(idB, b[0], b[1]));

      let cost = haversine(a, b);

      if (!edges.has(idA)) edges.set(idA, []);
      if (!edges.has(idB)) edges.set(idB, []);

      edges.get(idA).push(new Edge(idB, cost));
      edges.get(idB).push(new Edge(idA, cost));
    }
  });
}

function findClosestNode(lng, lat) {
  let closest = null;
  let minDist = Infinity;

  for (let node of nodes.values()) {
    let d = haversine([lng, lat], [node.lng, node.lat]);
    if (d < minDist) {
      minDist = d;
      closest = node.id;
    }
  }
  return closest;
}

