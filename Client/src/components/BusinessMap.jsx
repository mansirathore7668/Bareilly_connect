import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { getCoordinates } from "../utils/map";

const defaultCenter = [28.367, 79.43];

const markerIconConfig = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function createPopupContent(name, address) {
  const content = document.createElement("div");
  const title = document.createElement("strong");
  const location = document.createElement("span");

  title.textContent = name || "Business location";
  location.textContent = address || "Business location";
  content.append(title, document.createElement("br"), location);

  return content;
}

function BusinessMap({ latitude, longitude, name, address, selectable = false, onLocationSelect }) {
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const initialCoordinates = useRef(getCoordinates(latitude, longitude));
  const nameRef = useRef(name);
  const addressRef = useRef(address);
  const onLocationSelectRef = useRef(onLocationSelect);
  const coordinates = getCoordinates(latitude, longitude);

  useEffect(() => {
    nameRef.current = name;
    addressRef.current = address;
    onLocationSelectRef.current = onLocationSelect;
  }, [name, address, onLocationSelect]);

  useEffect(() => {
    if (!mapElement.current) {
      return undefined;
    }

    const map = L.map(mapElement.current, { scrollWheelZoom: !selectable }).setView(
      initialCoordinates.current || defaultCenter,
      initialCoordinates.current ? 16 : 12,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    const updateMarker = (nextCoordinates) => {
      if (markerInstance.current) {
        markerInstance.current.remove();
      }

      markerInstance.current = L.marker(nextCoordinates, { icon: markerIconConfig }).addTo(map);
      if (!selectable) {
        markerInstance.current
          .bindPopup(createPopupContent(nameRef.current, addressRef.current))
          .openPopup();
      }
    };

    if (initialCoordinates.current) {
      updateMarker(initialCoordinates.current);
    }

    if (selectable) {
      map.on("click", (event) => {
        const nextCoordinates = [event.latlng.lat, event.latlng.lng];
        updateMarker(nextCoordinates);
        onLocationSelectRef.current?.(nextCoordinates);
      });
    }

    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    };
  }, [selectable]);

  useEffect(() => {
    if (!mapInstance.current || !coordinates) {
      return;
    }

    mapInstance.current.setView(coordinates, 16);
    if (markerInstance.current) {
      markerInstance.current.setLatLng(coordinates);
    }
  }, [latitude, longitude, coordinates]);

  return <div ref={mapElement} className="business-map" role="application" aria-label={`${name || "Business"} location map`} />;
}

export default BusinessMap;