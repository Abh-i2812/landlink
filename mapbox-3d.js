(function (global) {
  /**
   * LandLink 3D map helper.
   */
  class LandLinkMap3D {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.options = options;
      this.map = null;
      this.mode = null;
      this.token =
        options.token ||
        global.MAPBOX_TOKEN ||
        localStorage.getItem("landlinkMapboxToken") ||
        "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmZmZmangifQ.-g_vE53SY2O0Q1AMJ1e13A";
    }

    async init() {
      const el = document.getElementById(this.containerId);
      if (!el) throw new Error(`Container #${this.containerId} not found`);
      el.innerHTML = "";
      el.style.minHeight = el.style.minHeight || "400px";

      const lat = Number(this.options.lat ?? 18.5204);
      const lng = Number(this.options.lng ?? 73.8567);
      const title = this.options.title || "Property";
      let areaLabel = this.options.areaLabel || "";
      const boundaryGeojson = this.options.boundaryGeojson;

      if (this.token && global.mapboxgl) {
        this.mode = "mapbox";
        global.mapboxgl.accessToken = this.token;
        this.map = new global.mapboxgl.Map({
          container: this.containerId,
          style: "mapbox://styles/mapbox/satellite-streets-v12",
          center: [lng, lat],
          zoom: 14,
          pitch: 0,
          bearing: 0,
          antialias: true,
        });

        this.map.addControl(new global.mapboxgl.NavigationControl(), 'top-right');

        this.map.on("load", () => {
          if (!this.map.getSource("mapbox-dem")) {
            this.map.addSource("mapbox-dem", {
              type: "raster-dem",
              url: "mapbox://mapbox.mapbox-terrain-dem-v1",
              tileSize: 512,
              maxzoom: 14,
            });
            this.map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
          }

          if (boundaryGeojson) {
            let geojson = typeof boundaryGeojson === 'string' ? JSON.parse(boundaryGeojson) : boundaryGeojson;
            if (global.turf) {
              const polygonAreaSqM = global.turf.area(geojson);
              const acres = (polygonAreaSqM * 0.000247105).toFixed(2);
              const guntha = (polygonAreaSqM * 0.00988422).toFixed(1);
              areaLabel = `≈ ${guntha} Guntha / ${acres} Acres`;
            }
            this.map.addSource("boundary", { type: "geojson", data: geojson });
            this.map.addLayer({
              id: "boundary-fill",
              type: "fill",
              source: "boundary",
              paint: { "fill-color": "#E8A83A", "fill-opacity": 0.3 }
            });
            this.map.addLayer({
              id: "boundary-outline",
              type: "line",
              source: "boundary",
              paint: { "line-color": "#E8A83A", "line-width": 3 }
            });
          } else {
            const radiusMeters = Math.max(40, Number(this.options.areaSqft || 1000) * 0.02);
            if (global.turf) {
              const circle = global.turf.circle([lng, lat], radiusMeters / 1000, { units: 'kilometers' });
              this.map.addSource("boundary", { type: "geojson", data: circle });
              this.map.addLayer({
                id: "boundary-fill",
                type: "fill",
                source: "boundary",
                paint: { "fill-color": "#E8A83A", "fill-opacity": 0.3 }
              });
              this.map.addLayer({
                id: "boundary-outline",
                type: "line",
                source: "boundary",
                paint: { "line-color": "#E8A83A", "line-width": 3 }
              });
            }
          }

          new global.mapboxgl.Marker({ color: "#412817" })
            .setLngLat([lng, lat])
            .setPopup(new global.mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`<strong>${title}</strong><br>${areaLabel}`))
            .addTo(this.map)
            .togglePopup();

          this.map.flyTo({
            center: [lng, lat],
            pitch: 60,
            bearing: -20,
            zoom: 17,
            duration: 2500,
            essential: true
          });
        });
        return this;
      }

      this.mode = "leaflet";
      if (!global.L) throw new Error("Leaflet is required for 3D fallback map");
      this.map = global.L.map(this.containerId).setView([lat, lng], 16);
      global.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri", maxZoom: 19 },
      ).addTo(this.map);
      const radius = Math.max(40, Number(this.options.radiusMeters) || 80);
      global.L.circle([lat, lng], {
        color: "#fdba4b",
        fillColor: "#fdba4b",
        fillOpacity: 0.25,
        weight: 3,
        radius,
      })
        .addTo(this.map)
        .bindPopup(`<strong>${title}</strong><br>${areaLabel}`);
      global.L.marker([lat, lng]).addTo(this.map);
      return this;
    }

    resetView() {
      if (!this.map) return;
      const lat = Number(this.options.lat ?? 18.5204);
      const lng = Number(this.options.lng ?? 73.8567);
      if (this.mode === "mapbox") {
        this.map.flyTo({ center: [lng, lat], zoom: 17, pitch: 60, bearing: -20, duration: 1500 });
      } else {
        this.map.setView([lat, lng], 16);
      }
    }

    destroy() {
      if (!this.map) return;
      this.map.remove();
      this.map = null;
    }
  }

  global.LandLinkMap3D = LandLinkMap3D;
})(typeof window !== "undefined" ? window : globalThis);
