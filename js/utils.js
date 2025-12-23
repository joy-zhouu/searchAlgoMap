// Calculates the shortest distance (great-circle distance) between two points on a sphere, like Earth, using their latitude and longitude

function haversine(a, b) {
  const R = 6371;
  let dLat = radians(b[1] - a[1]);
  let dLng = radians(b[0] - a[0]);

  let h =
    sin(dLat / 2) ** 2 +
    cos(radians(a[1])) *
      cos(radians(b[1])) *
      sin(dLng / 2) ** 2;

  return R * 2 * atan2(sqrt(h), sqrt(1 - h));
}

// Heuristic function for A* algorithm: estimates straight-line distance between two nodes
function heuristic(a, b) {
  return haversine([a.lng, a.lat], [b.lng, b.lat]);
}
