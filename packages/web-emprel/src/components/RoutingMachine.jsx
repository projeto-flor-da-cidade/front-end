// Caminho: src/components/RoutingMachine.jsx (ou onde preferir)

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // Cria a rota com os pontos de partida e chegada
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{ color: '#2563eb', weight: 6, opacity: 0.8 }]
      },
      show: false, // Esconde as instruções padrão, pois você tem uma sidebar
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    // Limpa a rota quando o componente é desmontado
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]);

  return null; // Este componente não renderiza nada diretamente
};

export default RoutingMachine;