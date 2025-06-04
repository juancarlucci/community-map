import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

function App() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    // Prevent reinitialization
    if (mapInstance.current) return;

    try {
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
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

      // Accessibility
      mapRef.current.setAttribute('tabindex', '0');
      mapRef.current.setAttribute('aria-label', 'Community Projects Map');

      // Hide loader when map is loaded
      mapInstance.current.on('load', () => {
        if (loaderRef.current) {
          loaderRef.current.classList.add('hidden');
          mapRef.current.style.visibility = 'visible';
        }
        console.log('MapLibre loaded successfully.');
      });

      // Handle WebGL context loss
      mapInstance.current.on('webglcontextlost', () => {
        console.error('WebGL context lost. Attempting to restore...');
      });
      mapInstance.current.on('webglcontextrestored', () => {
        console.log('WebGL context restored.');
      });
    } catch (error) {
      console.error('MapLibre initialization failed:', error);
      if (loaderRef.current) {
        loaderRef.current.textContent = 'Failed to load map.';
        loaderRef.current.style.color = 'red';
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="loader" ref={loaderRef} aria-live="polite">Loading map...</div>
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