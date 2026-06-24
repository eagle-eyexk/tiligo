import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const makeIcon = (emoji) => L.divIcon({
  html: `<div style="font-size:24px;line-height:30px;width:30px;height:30px;text-align:center">${emoji}</div>`,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const businessIcon = makeIcon("🏪");
const courierIcon = makeIcon("🛵");
const homeIcon = makeIcon("🏠");

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

export default function LiveMap({ business, courier, height = 280 }) {
  const points = [];
  if (business?.lat && business?.lng) points.push([business.lat, business.lng]);
  if (courier?.current_lat && courier?.current_lng) points.push([courier.current_lat, courier.current_lng]);

  const center = points[0] || [42.6026, 20.903];

  const route = [];
  if (courier?.current_lat && courier?.current_lng) route.push([courier.current_lat, courier.current_lng]);
  if (business?.lat && business?.lng) route.push([business.lat, business.lng]);

  return (
    <div className="rounded-2xl overflow-hidden border border-border" style={{ height }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {business?.lat && business?.lng && (
          <Marker position={[business.lat, business.lng]} icon={businessIcon} />
        )}
        {courier?.current_lat && courier?.current_lng && (
          <Marker position={[courier.current_lat, courier.current_lng]} icon={courierIcon} />
        )}
        {route.length > 1 && (
          <Polyline positions={route} pathOptions={{ color: "#39FF6B", weight: 3, dashArray: "8,8" }} />
        )}
        <FitBounds positions={points} />
      </MapContainer>
    </div>
  );
}