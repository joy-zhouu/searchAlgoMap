mapboxgl.accessToken = 'pk.eyJ1Ijoiam95emhvdSIsImEiOiJja3k0cjBmbDQwOXpsMm9vYWxiZzU3bnRpIn0.UgZTLd8-0YEpX0Fnq28rMA';

let map;
let startNodeId = null;
let endNodeId = null;
let selectingStart = true;
let pathFound = false;

function initMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-73.56399250,45.50866990],
    zoom: 15
  });

  map.on('load', () => {
    console.log('Map loaded');
    loadGraph();

    const canvas = map.getCanvas();

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      const lngLat = map.unproject(point);

      handleMapClick({ lngLat });
    });
  });

  
  //map.on('click', handleMapClick);
}

function handleMapClick(e) {
  console.log('Map clicked:', e.lngLat);

  let nearestId = findClosestNode(e.lngLat.lng, e.lngLat.lat);
  if (!nearestId) return;

  if (selectingStart) {
    startNodeId = nearestId;
    endNodeId = null;
    selectingStart = false;
    pathFound = false;
  } else {
    endNodeId = nearestId;
    selectingStart = true;
    pathFound = false;
    initAStar(startNodeId, endNodeId);
    loop();
  }

  console.log('Start:', startNodeId, 'End:', endNodeId);
}



