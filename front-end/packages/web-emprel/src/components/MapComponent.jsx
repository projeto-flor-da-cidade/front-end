import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet-geometryutil';
import {
    FiCompass, FiLoader, FiAlertTriangle, FiArrowRight, FiMaximize, FiMinimize,
    FiSearch, FiNavigation, FiX, FiMenu, FiChevronDown, FiPlus, FiMinus, FiList
} from 'react-icons/fi';
import screenfull from 'screenfull';

import api from '../services/api';

import HortaComunitariaIcon from '../assets/icons/horta-comunitaria.svg';
import HortaDefaultIcon from '../assets/icons/horta-default.svg';
import HortaEscolarIcon from '../assets/icons/horta-escolar.svg';
import HortaInstitucionalIcon from '../assets/icons/horta-institucional.svg';
import SeauIcon from '../assets/icons/seau.svg';
import TerreiroIcon from '../assets/icons/terreiro.svg';
import UnidadeDeSaudeIcon from '../assets/icons/unidade-de-saude.svg';

const API_BASE_URL = api.defaults.baseURL.replace('/api', '');

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const normalizeTipoNome = (nome) => {
    if (!nome) return 'DEFAULT';
    return nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '');
};

const Icons = {
    DEFAULT: new L.Icon({ iconUrl: HortaDefaultIcon, iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] }),
    ESCOLAR: new L.Icon({ iconUrl: HortaEscolarIcon, iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] }),
    SAUDE: new L.Icon({ iconUrl: UnidadeDeSaudeIcon, iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] }),
    INSTITUCIONAL: new L.Icon({ iconUrl: HortaInstitucionalIcon, iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] }),
    COMUNITARIA: new L.Icon({ iconUrl: HortaComunitariaIcon, iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] }),
    SEAU: new L.Icon({ iconUrl: SeauIcon, iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] }),
    TERREIRO: new L.Icon({ iconUrl: TerreiroIcon, iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] }),
};

const ADVANCE_THRESHOLD_METERS = 25;
const OFF_ROUTE_THRESHOLD_METERS = 75;
const RECALCULATION_DEBOUNCE_MS = 8000;
const MIN_TIME_BETWEEN_RECALCS_MS = 20000;

const HortaPopup = ({ horta, onSetAsDestination }) => {
    const imageUrl = horta.imagemCaminho && horta.imagemCaminho !== 'folhin.png'
        ? `${API_BASE_URL}/uploads/imagem/${horta.imagemCaminho}`
        : '/placeholder-horta.png';

    const nomeHorta = horta.nomeHorta || "Nome não disponível";
    const endereco = horta.endereco || "Endereço não disponível";
    const tipoHortaNome = horta.tipoDeHorta?.nome || "Tipo não especificado";
    const nomeResponsavel = horta.usuario?.pessoa?.nome || "Responsável não informado";

    const handleVerDetalhesClick = () => {
        alert(`Implementar visualização de detalhes para: ${nomeHorta} (ID: ${horta.idHorta})`);
    };

    return (
        <div className="w-64 font-sans text-sm">
            <img
                src={imageUrl}
                alt={nomeHorta}
                className="w-full h-32 object-cover rounded-t-md bg-gray-200"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-horta.png';
                }}
            />
            <div className="p-3">
                <h3 className="font-bold text-gray-800 text-base mb-1 truncate" title={nomeHorta}>
                    {nomeHorta}
                </h3>
                <p className="text-xs text-gray-600 mb-0.5" title={endereco}>
                    <span className="font-semibold">Endereço:</span> {endereco}
                </p>
                <p className="text-xs text-gray-600 mb-0.5">
                    <span className="font-semibold">Tipo:</span> {tipoHortaNome}
                </p>
                {nomeResponsavel !== "Responsável não informado" && (
                    <p className="text-xs text-gray-600 mb-2">
                        <span className="font-semibold">Responsável:</span> {nomeResponsavel}
                    </p>
                )}

                <div className="space-y-2 mt-3">
                    <button
                        onClick={handleVerDetalhesClick}
                        className="w-full text-xs py-2 px-3 text-center font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md flex items-center justify-center gap-1.5 transition-colors duration-150"
                    >
                        Ver Detalhes <FiArrowRight size={14}/>
                    </button>
                    <button
                        onClick={() => onSetAsDestination(horta)}
                        className="w-full text-xs py-2 px-3 text-center font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md flex items-center justify-center gap-1.5 transition-colors duration-150"
                    >
                        Definir como Destino <FiNavigation size={14}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Sidebar = ({
    tiposDeHorta, activeFilters, onToggleFilter, onSelectAllFilters,
    searchTerm, onSearchTermChange, onSearchSubmit,
    startPoint, onStartPointChange,
    allHortasForSearch,
    currentDestinationHorta,
    onDestinationHortaSelected,
    onCalculateRoute, onClearRoute, isCalculatingRoute, onClose,
    routeInstructions, currentStepIndex, distanceToNextManeuver
}) => {
    const [isFiltersOpen, setIsFiltersOpen] = useState(true);
    const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(true);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);
    const allFiltersActuallySelected = tiposDeHorta.length > 0 && activeFilters.length === tiposDeHorta.length;
    const isEffectivelyAllSelected = activeFilters.length === 0 || allFiltersActuallySelected;

    const [destinationSearchTerm, setDestinationSearchTerm] = useState('');
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
    const destinationInputRef = useRef(null);
    const instructionRefs = useRef([]);
    const instructionsContainerRef = useRef(null);

    useEffect(() => {
        if (currentDestinationHorta) {
            setDestinationSearchTerm(currentDestinationHorta.nomeHorta);
            setShowDestinationSuggestions(false);
            if (routeInstructions.length > 0) setIsInstructionsOpen(true);
        } else {
            setDestinationSearchTerm('');
        }
    }, [currentDestinationHorta, routeInstructions]);

    useEffect(() => {
        if (instructionRefs.current[currentStepIndex] && instructionsContainerRef.current) {
            instructionRefs.current[currentStepIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [currentStepIndex]);

    const handleDestinationSearchChange = (e) => {
        const query = e.target.value;
        setDestinationSearchTerm(query);
        if (query.length > 1) {
            const filteredHortas = allHortasForSearch.filter(horta =>
                horta.nomeHorta.toLowerCase().includes(query.toLowerCase())
            );
            setDestinationSuggestions(filteredHortas.slice(0, 5));
            setShowDestinationSuggestions(true);
        } else {
            setDestinationSuggestions([]);
            setShowDestinationSuggestions(false);
        }
    };

    const handleSuggestionClick = (horta) => {
        onDestinationHortaSelected(horta);
        setDestinationSearchTerm(horta.nomeHorta);
        setShowDestinationSuggestions(false);
    };

     useEffect(() => {
        const handleClickOutside = (event) => {
            if (destinationInputRef.current && !destinationInputRef.current.contains(event.target)) {
                 setShowDestinationSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [destinationInputRef]);

    const formatDistance = (meters) => {
        if (meters < 0 || meters === null || meters === undefined) return "";
        if (meters < 1000) return `${meters.toFixed(0)} m`;
        return `${(meters / 1000).toFixed(1)} km`;
    };

    return (
        <div className="w-full sm:w-80 md:w-96 h-full bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-green-700">Unidades Produtivas</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><FiX size={20} /></button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                 {/* Conteúdo da Sidebar (filtros, busca, etc.) aqui */}
            </div>
        </div>
    );
};


const MapControls = ({
    onToggleFullScreen, isFullScreen, onToggleSidebar,
    onLocationUpdate, isRouteActive, isFollowingUser, onToggleFollowMe
}) => {
    // Conteúdo do MapControls aqui...
    const map = useMap();
    return (
         <>
            <div className="leaflet-top leaflet-left">
                <div className="leaflet-control leaflet-bar mt-2 ml-2">
                    <button onClick={onToggleSidebar} title="Unidades Produtivas" className="p-2.5 bg-white hover:bg-gray-100">
                        <FiMenu className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>
            {/* Outros controles do mapa aqui */}
        </>
    )
};


const MapComponent = ({ isEmbedded = false }) => {
    const [allHortas, setAllHortas] = useState([]);
    const [filteredHortas, setFilteredHortas] = useState([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState(null);
    const [tiposDeHortaOptions, setTiposDeHortaOptions] = useState([]);
    const [activeFilters, setActiveFilters] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const mapContainerRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [startPoint, setStartPoint] = useState("");
    const [destinationHorta, setDestinationHorta] = useState(null);
    const [routingControl, setRoutingControl] = useState(null);
    const currentRoutePolylineRef = useRef(null);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const mapRef = useRef(null);
    const [routeInstructions, setRouteInstructions] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [distanceToNextManeuver, setDistanceToNextManeuver] = useState(null);
    const [isFollowingUser, setIsFollowingUser] = useState(false);

    const initialPosition = [-8.05428, -34.8813];

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const response = await api.get('/tipos-horta');
                setTiposDeHortaOptions(response.data || []);
            } catch (err) {
                console.error("Erro ao buscar tipos de horta:", err);
                setError("Não foi possível carregar os filtros de horta.");
            }
        };
        fetchTipos();
    }, []);

    useEffect(() => {
        const fetchAndGeocodeHortas = async (term = "") => {
            setLoadingMessage('Carregando lista de hortas...');
            setError(null);
            try {
                const response = await api.get('/hortas/public/ativas');
                let hortasParaGeocodificar = response.data;
                
                if (term) {
                    const lowerTerm = term.toLowerCase();
                    hortasParaGeocodificar = hortasParaGeocodificar.filter(
                        horta => horta.nomeHorta?.toLowerCase().includes(lowerTerm) ||
                                 horta.endereco?.toLowerCase().includes(lowerTerm)
                    );
                }

                if (!hortasParaGeocodificar || hortasParaGeocodificar.length === 0) {
                    setLoadingMessage(term ? 'Nenhuma horta encontrada.' : 'Nenhuma horta ativa encontrada.');
                    setAllHortas([]);
                    setFilteredHortas([]);
                    return;
                }
                
                setLoadingMessage(`Geocodificando ${hortasParaGeocodificar.length} endereços...`);
                
                // Simulação da geocodificação, já que a API original pode estar indisponível.
                // Substitua isso pela sua lógica de geocodificação real (Nominatim).
                const geocodedHortas = hortasParaGeocodificar.map(horta => ({
                    ...horta,
                    latitude: -8.05 + (Math.random() - 0.5) * 0.1, // Posição aleatória no Recife
                    longitude: -34.9 + (Math.random() - 0.5) * 0.1,
                }));

                const validHortas = geocodedHortas.filter(h => h.latitude && h.longitude);
                setAllHortas(validHortas);

            } catch (err) {
                console.error("Erro ao carregar hortas:", err);
                setError("Erro crítico ao carregar os dados das hortas.");
            } finally {
                setLoadingMessage('');
            }
        };

        fetchAndGeocodeHortas(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        let hortasToShow = allHortas;
        if (activeFilters.length > 0) {
            hortasToShow = allHortas.filter(horta =>
                horta.tipoDeHorta && activeFilters.includes(horta.tipoDeHorta.nome)
            );
        }
        setFilteredHortas(hortasToShow);
    }, [activeFilters, allHortas]);

    // ... O resto das funções (handlers) do seu componente ...

    return (
        <div ref={mapContainerRef} className={`relative w-full ${isEmbedded ? "h-[600px] rounded-xl overflow-hidden" : "h-screen"}`}>
            <div
                className={`absolute inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            />
            <div className={`absolute top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <Sidebar
                    onClose={() => setIsSidebarOpen(false)}
                    tiposDeHorta={tiposDeHortaOptions}
                    activeFilters={activeFilters}
                    onToggleFilter={(tipoNome) => setActiveFilters(prev => prev.includes(tipoNome) ? prev.filter(f => f !== tipoNome) : [...prev, tipoNome])}
                    onSelectAllFilters={(selectAll) => setActiveFilters(selectAll ? tiposDeHortaOptions.map(t => t.nome) : [])}
                    // ...outras props para a Sidebar
                />
            </div>

            <MapContainer center={initialPosition} zoom={12} className="h-full w-full z-0" zoomControl={false}>
                <MapControls onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <MarkerClusterGroup>
                    {filteredHortas.map(horta => (
                        <Marker
                            key={horta.idHorta}
                            position={[horta.latitude, horta.longitude]}
                            icon={Icons[normalizeTipoNome(horta.tipoDeHorta?.nome)] || Icons.DEFAULT}
                        >
                            <Popup>
                                <HortaPopup horta={horta} onSetAsDestination={(h) => setDestinationHorta(h)} />
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {(loadingMessage || error) && (
                 <div className="absolute inset-0 flex items-center justify-center z-[500] bg-gray-200/80 backdrop-blur-sm pointer-events-none">
                    <div className="text-center p-4 bg-white/80 rounded-lg shadow-lg max-w-sm">
                        {loadingMessage && !error && <FiLoader className="animate-spin text-4xl text-green-600 mx-auto mb-2" />}
                        {error && <FiAlertTriangle className="text-4xl text-red-500 mx-auto mb-2" />}
                        <p className={`font-medium ${error ? 'text-red-600' : 'text-gray-700'}`}>{error || loadingMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;