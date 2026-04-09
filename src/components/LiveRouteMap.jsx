import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Apple Maps-style tiles via ESRI
const APPLE_LIKE_TILE = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

const makeIcon = (emoji, size = 36) => L.divIcon({
  html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5))">${emoji}</div>`,
  className: "",
  iconAnchor: [size / 2, size],
  popupAnchor: [0, -size],
});

function FitBounds({ from, to }) {
  const map = useMap();
  useEffect(() => {
    if (!from || !to) return;
    const bounds = L.latLngBounds([from, to]).pad(0.25);
    map.fitBounds(bounds, { animate: true, duration: 0.8 });
  }, [from?.[0], from?.[1], to?.[0], to?.[1]]);
  return null;
}

async function fetchRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    }
  } catch {}
  return [from, to]; // fallback straight line
}

export default function LiveRouteMap({ driverCoords, customerCoords, customerName, customerAddress }) {
  const [route, setRoute] = useState([]);
  const prevDriverRef = useRef(null);

  useEffect(() => {
    if (!driverCoords || !customerCoords) return;
    const prev = prevDriverRef.current;
    const moved = !prev || Math.abs(prev[0] - driverCoords[0]) > 0.0001 || Math.abs(prev[1] - driverCoords[1]) > 0.0001;
    if (!moved && route.length) return;
    prevDriverRef.current = driverCoords;
    fetchRoute(driverCoords, customerCoords).then(setRoute);
  }, [driverCoords?.[0], driverCoords?.[1], customerCoords?.[0], customerCoords?.[1]]);

  if (!customerCoords) return null;

  const center = driverCoords || customerCoords;

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ height: 320, border: '2px solid rgba(0,191,255,0.3)' }}>
      <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}
        zoomControl={true} scrollWheelZoom={false}>
        <TileLayer url={APPLE_LIKE_TILE} attribution="" />

        {/* Route polyline */}
        {route.length > 0 && (
          <Polyline positions={route} pathOptions={{
            color: "#0066FF", weight: 5, opacity: 0.9,
            lineCap: "round", lineJoin: "round",
            dashArray: undefined,
          }} />
        )}

        {/* Customer marker */}
        <Marker position={customerCoords} icon={makeIcon("📍", 36)}>
          <Popup>
            <strong>{customerName}</strong><br />{customerAddress}
          </Popup>
        </Marker>

        {/* Driver marker */}
        {driverCoords && (
          <Marker position={driverCoords} icon={makeIcon("🛵", 38)}>
            <Popup>Pozicioni Juaj (Live)</Popup>
          </Marker>
        )}

        {driverCoords && <FitBounds from={driverCoords} to={customerCoords} />}
      </MapContainer>
    </div>
  );
}