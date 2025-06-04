import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

function App() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // Initialize MapLibre map
    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], // Temporary OSM tiles
            tileSize: 256,
            attribution: 'Map tiles: <a href="https://openstreetmap.org">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 18,
          },
        ],
      },
      center: [-73.98994, 40.749844],
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
    });

    // Add zoom controls
    mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Accessibility: Ensure map container is keyboard-focusable
    mapRef.current.setAttribute('tabindex', '0');
    mapRef.current.setAttribute('aria-label', 'Community Projects Map');

    console.log('MapLibre initialized. Ready for Deck.GL layers.');

    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="loader" aria-live="polite">Loading map...</div>
      <div
        id="map"
        ref={mapRef}
        role="application"
        aria-label="Interactive community projects map"
      ></div>
      <div id="legend-wrapper" aria-label="Map legend">
        <ul id="category-title"></ul>
      </div>
      <div id="search-container" aria-label="Search projects"></div>
    </div>
  );
}

export default App;