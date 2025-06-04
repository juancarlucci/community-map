import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";
import "./App.css";

function App() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const loaderRef = useRef(null);
  const deckOverlayRef = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [],
      },
      center: [-73.98994, 40.749844],
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
      attributionControl: true,
    });

    mapInstance.current.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );

    mapRef.current.setAttribute("tabindex", "0");
    mapRef.current.setAttribute("aria-label", "Community Projects Map");

    const stadiaApiKey = import.meta.env.VITE_STADIA_API_KEY || "";
    const watercolorTileUrl = stadiaApiKey
      ? `https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=${stadiaApiKey}`
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    const labelsTileUrl = stadiaApiKey
      ? `https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}.png?api_key=${stadiaApiKey}`
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    deckOverlayRef.current = new MapboxOverlay({
      interleaved: true,
      layers: [
        new TileLayer({
          id: "watercolor",
          data: watercolorTileUrl,
          minZoom: 0,
          maxZoom: 18,
          tileSize: 256,
          renderSubLayers: (props) => {
            const {
              bbox: { west, south, east, north },
            } = props.tile;
            return new BitmapLayer(props, {
              data: null,
              image: props.data,
              bounds: [west, south, east, north],
            });
          },
          onTileError: (error) => {
            console.error("Tile loading error:", error);
          },
        }),
        new TileLayer({
          id: "toner-labels",
          data: labelsTileUrl,
          minZoom: 0,
          maxZoom: 18,
          tileSize: 256,
          opacity: 0.5,
          renderSubLayers: (props) => {
            const {
              bbox: { west, south, east, north },
            } = props.tile;
            return new BitmapLayer(props, {
              data: null,
              image: props.data,
              bounds: [west, south, east, north],
            });
          },
          onTileError: (error) => {
            console.error("Tile labels loading error:", error);
          },
        }),
      ],
    });

    mapInstance.current.addControl(deckOverlayRef.current);

    mapInstance.current.on("load", () => {
      if (loaderRef.current) {
        loaderRef.current.classList.add("hidden");
        mapRef.current.style.visibility = "visible";
        document.getElementById("legend-wrapper").style.visibility = "visible";
        document.getElementById("search-container").style.visibility =
          "visible";
      }
      console.log("MapLibre and Deck.GL loaded successfully.");
    });

    mapInstance.current.on("webglcontextlost", () => {
      console.error("WebGL context lost. Attempting to restore...");
    });
    mapInstance.current.on("webglcontextrestored", () => {
      console.log("WebGL context restored.");
    });

    mapInstance.current.on("error", (e) => {
      console.error("MapLibre error:", e);
      if (loaderRef.current) {
        loaderRef.current.textContent = "Failed to load map.";
        loaderRef.current.style.color = "red";
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="loader" ref={loaderRef} aria-live="polite">
        Loading map...
      </div>
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
