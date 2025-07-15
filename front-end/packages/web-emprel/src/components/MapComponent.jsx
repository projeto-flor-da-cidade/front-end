import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet-geometryutil'; 
// import 'leaflet-smoothwheelzoom'; // <<< LINHA COMENTADA/REMOVIDA
import {
    FiCompass, FiLoader, FiAlertTriangle, FiArrowRight, FiMaximize, FiMinimize,
    FiSearch, FiNavigation, FiX, FiMenu, FiChevronDown, FiPlus, FiMinus, FiList
} from 'react-icons/fi';
import screenfull from 'screenfull';

import api, { BACKEND_URL } from '../services/api';

import HortaComunitariaIcon from '../assets/icons/horta-comunitaria.svg';
import HortaDefaultIcon from '../assets/icons/horta-default.svg';
import HortaEscolarIcon from '../assets/icons/horta-escolar.svg';
import HortaInstitucionalIcon from '../assets/icons/horta-institucional.svg';
import SeauIcon from '../assets/icons/seau.svg';
import TerreiroIcon from '../assets/icons/terreiro.svg';
import UnidadeDeSaudeIcon from '../assets/icons/unidade-de-saude.svg';

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
        ? `${BACKEND_URL}/uploads/imagem/${horta.imagemCaminho}`
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
                {horta.usuario?.pessoa?.nome && (
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
                        onClick={() => {
                            onSetAsDestination(horta);
                        }} 
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
            if (routeInstructions.length > 0) {
                setIsInstructionsOpen(true);
            }
        } else {
            setDestinationSearchTerm('');
        }
    }, [currentDestinationHorta, routeInstructions]);

    useEffect(() => {
        if (instructionRefs.current[currentStepIndex] && instructionsContainerRef.current) {
            instructionRefs.current[currentStepIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
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
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
    };

     useEffect(() => {
        const handleClickOutside = (event) => {
            if (destinationInputRef.current && !destinationInputRef.current.contains(event.target)) {
                 setShowDestinationSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
                 <section>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Buscar Horta</h3>
                    <form onSubmit={onSearchSubmit} className="flex gap-2">
                        <input type="text" placeholder="Nome ou endereço..." value={searchTerm} onChange={onSearchTermChange} className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
                        <button type="submit" className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"><FiSearch /></button>
                    </form>
                </section>
                <section>
                    <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="flex items-center justify-between w-full py-2 text-left font-semibold text-gray-700">
                        <span className="text-sm uppercase text-gray-500">Filtrar por Tipo</span>
                        <FiChevronDown className={`transform transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isFiltersOpen && (
                        <div className="mt-2 space-y-1.5 text-sm">
                            <label className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded-md cursor-pointer">
                                <input type="checkbox" checked={isEffectivelyAllSelected} onChange={() => onSelectAllFilters(!allFiltersActuallySelected)} disabled={tiposDeHorta.length === 0} className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                                <span className="text-gray-700">Todos os Tipos</span>
                            </label>
                            {tiposDeHorta.map(tipo => (
                                <label key={tipo.idTipoDeHorta} className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded-md cursor-pointer">
                                    <input type="checkbox" checked={activeFilters.includes(tipo.nome)} onChange={() => onToggleFilter(tipo.nome)} className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                                    <span className="text-gray-700">{tipo.nome}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </section>
                <section>
                     <button onClick={() => setIsRoutePlannerOpen(!isRoutePlannerOpen)} className="flex items-center justify-between w-full py-2 text-left font-semibold text-gray-700">
                        <span className="text-sm uppercase text-gray-500">Planejar Rota</span>
                        <FiChevronDown className={`transform transition-transform ${isRoutePlannerOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isRoutePlannerOpen && (
                        <div className="mt-2 space-y-3 text-sm">
                            <div>
                                <label htmlFor="startPoint" className="block text-xs font-medium text-gray-600 mb-0.5">Ponto de Partida</label>
                                <input 
                                    type="text" 
                                    id="startPoint" 
                                    placeholder="Meu local ou endereço" 
                                    value={startPoint} 
                                    onChange={onStartPointChange} 
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                                />
                            </div>
                            <div className="relative" ref={destinationInputRef}>
                                <label htmlFor="destinationPoint" className="block text-xs font-medium text-gray-600 mb-0.5">Destino (Horta)</label>
                                <input 
                                    type="text" 
                                    id="destinationPoint" 
                                    placeholder="Digite o nome da horta..." 
                                    value={destinationSearchTerm} 
                                    onChange={handleDestinationSearchChange}
                                    onFocus={() => { if (destinationSearchTerm.length > 1 && destinationSuggestions.length > 0) setShowDestinationSuggestions(true);}}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                                />
                                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                                        {destinationSuggestions.map(horta => (
                                            <li 
                                                key={horta.idHorta} 
                                                onClick={() => handleSuggestionClick(horta)}
                                                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            >
                                                {horta.nomeHorta}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onCalculateRoute()} 
                                    disabled={isCalculatingRoute || !currentDestinationHorta}
                                    className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    {isCalculatingRoute ? <FiLoader className="animate-spin"/> : <FiNavigation size={16}/>}
                                    Calcular
                                </button>
                                <button onClick={onClearRoute} className="py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><FiX size={16}/></button>
                            </div>
                        </div>
                    )}
                </section>
                 {routeInstructions && routeInstructions.length > 0 && (
                    <section>
                        <button onClick={() => setIsInstructionsOpen(!isInstructionsOpen)} className="flex items-center justify-between w-full py-2 text-left font-semibold text-gray-700">
                            <span className="text-sm uppercase text-gray-500">Instruções da Rota</span>
                            <FiChevronDown className={`transform transition-transform ${isInstructionsOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isInstructionsOpen && (
                            <div ref={instructionsContainerRef} className="mt-2 space-y-1 text-sm max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                                {routeInstructions.map((step, index) => (
                                    <div 
                                        key={index} 
                                        ref={el => instructionRefs.current[index] = el}
                                        className={`p-2 rounded-md ${index === currentStepIndex ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-50'}`}
                                    >
                                        <p>{index + 1}. {step.maneuver.instruction}
                                            {index === currentStepIndex && distanceToNextManeuver > 0 && (
                                                <span className="text-xs ml-2 font-normal">({formatDistance(distanceToNextManeuver)})</span>
                                            )}
                                        </p>
                                        {step.name && step.name.trim() !== '' && <p className="text-xs text-gray-500 pl-4">{step.name} ({formatDistance(step.distance)})</p>}
                                    </div>
                                ))}
                                {currentStepIndex >= routeInstructions.length && routeInstructions.length > 0 && (
                                    <div className="p-2 text-green-600 font-semibold">Você chegou ao seu destino!</div>
                                )}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

const MapControls = ({ 
    onToggleFullScreen, isFullScreen, onToggleSidebar, 
    onLocationUpdate, isRouteActive, isFollowingUser, onToggleFollowMe 
}) => {
    const map = useMap();
    const userMarkerRef = useRef(null);
    const accuracyCircleRef = useRef(null);

    const zoomIn = () => map.zoomIn();
    const zoomOut = () => map.zoomOut();
    
    const handleWatchLocationFound = useCallback((e) => {
        const radius = e.accuracy;
        const latlng = e.latlng;
        let popupMessage = `Você está aqui (precisão de ${radius.toFixed(0)} m).`;
        if (radius > 1000) {
            popupMessage = `Sua localização é aproximada (raio de ${radius.toFixed(0)} m). Para maior precisão, tente em um local aberto ou verifique as configurações do seu dispositivo.`;
        }

        if (!userMarkerRef.current) {
            userMarkerRef.current = L.marker(latlng).addTo(map);
            userMarkerRef.current.bindPopup(popupMessage).openPopup();
        } else {
            userMarkerRef.current.setLatLng(latlng);
            userMarkerRef.current.setPopupContent(popupMessage).openPopup();
        }

        if (!accuracyCircleRef.current) {
            accuracyCircleRef.current = L.circle(latlng, radius).addTo(map);
        } else {
            accuracyCircleRef.current.setLatLng(latlng).setRadius(radius);
        }
        if(onLocationUpdate) {
            onLocationUpdate(latlng);
        }
    }, [map, onLocationUpdate]);

    const handleWatchLocationError = useCallback((e) => {
        map.stopLocate();
        if(onToggleFollowMe && isFollowingUser) onToggleFollowMe(false); 

        let message = "Erro ao seguir sua localização: ";
        switch (e.code) {
            case 1: message += "Permissão negada."; break;
            case 2: message += "Localização indisponível."; break;
            case 3: message += "Tempo esgotado."; break;
            default: message += e.message;
        }
        alert(message);
        if (userMarkerRef.current && map.hasLayer(userMarkerRef.current)) {
            map.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
        }
        if (accuracyCircleRef.current && map.hasLayer(accuracyCircleRef.current)) {
            map.removeLayer(accuracyCircleRef.current);
            accuracyCircleRef.current = null;
        }
    }, [map, onToggleFollowMe, isFollowingUser]);

    const localToggleFollowMe = useCallback(() => {
        if (isFollowingUser) {
            map.stopLocate();
            map.off('locationfound', handleWatchLocationFound);
            map.off('locationerror', handleWatchLocationError);
            if (onToggleFollowMe) onToggleFollowMe(false);
            if (userMarkerRef.current && map.hasLayer(userMarkerRef.current)) {
                map.removeLayer(userMarkerRef.current);
                userMarkerRef.current = null;
            }
            if (accuracyCircleRef.current && map.hasLayer(accuracyCircleRef.current)) {
                map.removeLayer(accuracyCircleRef.current);
                accuracyCircleRef.current = null;
            }
        } else {
            if (userMarkerRef.current && map.hasLayer(userMarkerRef.current)) map.removeLayer(userMarkerRef.current);
            if (accuracyCircleRef.current && map.hasLayer(accuracyCircleRef.current)) map.removeLayer(accuracyCircleRef.current);
            userMarkerRef.current = null;
            accuracyCircleRef.current = null;
            
            map.on('locationfound', handleWatchLocationFound);
            map.on('locationerror', handleWatchLocationError);
            map.locate({ setView: !isRouteActive, maxZoom: 16, enableHighAccuracy: true, watch: true, timeout: 10000, maximumAge: 0 });
            if (onToggleFollowMe) onToggleFollowMe(true);
        }
    }, [map, isFollowingUser, handleWatchLocationFound, handleWatchLocationError, onToggleFollowMe, isRouteActive]);

    useEffect(() => {
        return () => {
            if (map && isFollowingUser) { 
                map.stopLocate();
                map.off('locationfound', handleWatchLocationFound);
                map.off('locationerror', handleWatchLocationError);
                 if (userMarkerRef.current && map.hasLayer(userMarkerRef.current)) map.removeLayer(userMarkerRef.current);
                 if (accuracyCircleRef.current && map.hasLayer(accuracyCircleRef.current)) map.removeLayer(accuracyCircleRef.current);
            }
        };
    }, [map, isFollowingUser, handleWatchLocationFound, handleWatchLocationError]);


    return (
        <>
            <div className="leaflet-top leaflet-left">
                <div className="leaflet-control leaflet-bar mt-2 ml-2">
                    <button onClick={onToggleSidebar} title="Unidades Produtivas" className="p-2.5 bg-white hover:bg-gray-100">
                        <FiMenu className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>
            
            <div className="leaflet-top leaflet-right">
                 <div className="leaflet-control leaflet-bar mt-2 mr-2">
                    <button onClick={zoomIn} title="Aproximar" className="p-2.5 bg-white hover:bg-gray-100"><FiPlus className="w-5 h-5 text-gray-700"/></button>
                    <button onClick={zoomOut} title="Afastar" className="p-2.5 bg-white hover:bg-gray-100 border-t border-gray-200"><FiMinus className="w-5 h-5 text-gray-700"/></button>
                 </div>
                 <div className="leaflet-control leaflet-bar mt-2 mr-2">
                    <button 
                        onClick={localToggleFollowMe} 
                        title={isFollowingUser ? "Parar de seguir" : "Achar minha localização e seguir"} 
                        className="p-2.5 bg-white hover:bg-gray-100"
                    >
                        <FiCompass className={`w-5 h-5 ${isFollowingUser ? (isRouteActive ? 'text-green-500 animate-pulse' : 'text-blue-500 animate-pulse') : 'text-gray-700'}`} />
                    </button>
                    {screenfull.isEnabled && (
                        <button onClick={onToggleFullScreen} title={isFullScreen ? "Sair da Tela Cheia" : "Tela Cheia"} className="p-2.5 bg-white hover:bg-gray-100 border-t border-gray-200">
                            {isFullScreen ? <FiMinimize className="w-5 h-5 text-gray-700" /> : <FiMaximize className="w-5 h-5 text-gray-700" />}
                        </button>
                    )}
                 </div>
            </div>
        </>
    );
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
    
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const speechSupported = typeof window !== 'undefined' && window.speechSynthesis;

    const offRouteRecalculateTimeoutRef = useRef(null);
    const lastRecalculationTimeRef = useRef(0);


    useEffect(() => {
        const loadVoices = () => {
            if (!speechSupported) return;
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                const ptBRVoice = availableVoices.find(voice => voice.lang === 'pt-BR') || 
                                  availableVoices.find(voice => voice.lang === 'pt-PT') ||
                                  availableVoices.find(voice => voice.lang.startsWith('pt-')) ||
                                  availableVoices.find(voice => voice.default && voice.lang.startsWith('pt')) ||
                                  availableVoices[0]; 
                setSelectedVoice(ptBRVoice);
            }
        };
        loadVoices();
        if (speechSupported) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        return () => {
            if (speechSupported) {
                window.speechSynthesis.onvoiceschanged = null;
                window.speechSynthesis.cancel();
            }
        };
    }, [speechSupported]);

    const speak = useCallback((text) => {
        if (!speechSupported || !selectedVoice || !text) return;
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        utterance.rate = 1; 
        utterance.pitch = 1; 
        window.speechSynthesis.speak(utterance);
    }, [speechSupported, selectedVoice]);

    const cancelSpeech = useCallback(() => {
        if (speechSupported) {
            window.speechSynthesis.cancel();
        }
    }, [speechSupported]);


    useEffect(() => {
        if (!isFollowingUser || !speechSupported || !selectedVoice) {
            cancelSpeech();
            return;
        }
    
        if (routeInstructions.length > 0 && currentStepIndex > 0 && currentStepIndex < routeInstructions.length) {
            const currentInstruction = routeInstructions[currentStepIndex];
            let textToSpeak = currentInstruction.maneuver.instruction;
            speak(textToSpeak);
        } else if (routeInstructions.length > 0 && currentStepIndex >= routeInstructions.length) {
            speak("Você chegou ao seu destino.");
        }
    }, [currentStepIndex, routeInstructions, speak, isFollowingUser, speechSupported, selectedVoice, cancelSpeech]);


    const initialPosition = [-8.05428, -34.8813];

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const response = await api.get('/hortas/tipo');
                setTiposDeHortaOptions(response.data || []);
            } catch (err) { console.error("Erro ao buscar tipos de horta:", err); }
        };
        fetchTipos();
    }, []);

    const fetchAndGeocodeHortas = useCallback(async (term = "") => {
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
                setLoadingMessage(term ? 'Nenhuma horta encontrada com o termo pesquisado.' : 'Nenhuma horta ativa encontrada no momento.');
                 setAllHortas([]); 
                 setFilteredHortas([]);
                return;
            }
            setLoadingMessage(`Geocodificando ${hortasParaGeocodificar.length} endereços... Isso pode levar alguns instantes.`);

            const geocodePromises = hortasParaGeocodificar.map(async (horta) => {
                const fullAddress = `${horta.endereco}, Recife, PE, Brasil`;
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=br&addressdetails=1`;

                try {
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 100));
                    const geoResponse = await fetch(url, { headers: { 'User-Agent': 'FlorDaCidadeMap/1.0 (https://flordacidade.recife.pe.gov.br)' }});
                    if (!geoResponse.ok) {
                        return null;
                    }
                    const data = await geoResponse.json();
                    if (data && data[0]) {
                        return { ...horta, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
                    }
                    return null;
                } catch (err) {
                    return null;
                }
            });
            const results = await Promise.all(geocodePromises);
            const validHortas = results.filter(h => h !== null && typeof h.latitude === 'number' && typeof h.longitude === 'number');
            setAllHortas(validHortas);

             if (validHortas.length === 0 && hortasParaGeocodificar.length > 0) {
                setError(term ? "Não foi possível localizar as hortas com o termo pesquisado." : "Não foi possível geocodificar os endereços das hortas ativas.");
            } else if (validHortas.length > 0) {
                setError(null);
            }
        } catch (err) {
            setError("Erro crítico: Não foi possível carregar os dados das hortas. Verifique sua conexão ou tente mais tarde.");
        } finally {
            setLoadingMessage('');
        }
    }, []);


    useEffect(() => {
        fetchAndGeocodeHortas();
    }, [fetchAndGeocodeHortas]);

    useEffect(() => {
        let hortasToShow = allHortas;
        if (activeFilters.length > 0) {
            hortasToShow = hortasToShow.filter(horta =>
                horta.tipoDeHorta && activeFilters.includes(horta.tipoDeHorta.nome)
            );
        }
        setFilteredHortas(hortasToShow);
    }, [activeFilters, allHortas]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchAndGeocodeHortas(searchTerm);
    };

    const handleSetAsDestination = (horta) => {
        setDestinationHorta(horta);
        if (isEmbedded || !isSidebarOpen) {
            setIsSidebarOpen(true);
        }
    };

    const handleToggleFollowMeState = useCallback((following) => {
        setIsFollowingUser(following);
        if (!following) {
            cancelSpeech();
            clearTimeout(offRouteRecalculateTimeoutRef.current);
            offRouteRecalculateTimeoutRef.current = null;
        }
    }, [cancelSpeech]);

    const handleCalculateRoute = useCallback(async (arg) => {
        const isForcedStart = arg instanceof L.LatLng;
        const forcedStartLatLng = isForcedStart ? arg : null;

        console.log("Attempting to calculate route. Is ForcedStart:", isForcedStart, "ForcedCoords:", forcedStartLatLng);

        if (!mapRef.current) {
            console.error("Map reference is not available.");
            return;
        }
        if (!destinationHorta) { 
            alert("Por favor, selecione uma horta de destino.");
            return;
        }
        
        const isUsingCurrentLocationAsStart = !startPoint.trim() || startPoint.toLowerCase().includes('minha localização') || startPoint.toLowerCase().includes('local atual'); 

        setIsCalculatingRoute(true);
        cancelSpeech();
        if (routingControl && mapRef.current.hasLayer(routingControl)) {
            mapRef.current.removeLayer(routingControl);
        }
        setRoutingControl(null);
        currentRoutePolylineRef.current = null;
        clearTimeout(offRouteRecalculateTimeoutRef.current);
        offRouteRecalculateTimeoutRef.current = null;
        
        setRouteInstructions([]);
        setCurrentStepIndex(-1);
        setDistanceToNextManeuver(null);

        try {
            let startLatLng;
            let startPointDisplay = startPoint;

            if (forcedStartLatLng) {
                startLatLng = forcedStartLatLng;
                startPointDisplay = "Localização Atual (Rota Recalculada)";
            } else if (isUsingCurrentLocationAsStart) {
                startPointDisplay = "Minha Localização Atual";
                if (!isFollowingUser && startPoint.trim() === '') { 
                     alert("Por favor, ative o seguimento da sua localização ou digite um ponto de partida.");
                     setIsCalculatingRoute(false); return;
                }
                await new Promise((resolve, reject) => {
                    mapRef.current.locate({
                        setView: false, maxZoom: 16, watch: false, enableHighAccuracy: true,
                        timeout: 15000, maximumAge: 0
                    });
                    mapRef.current.once('locationfound', (e) => {
                        if (e.accuracy > 2000 && !window.confirm(`Sua localização inicial tem uma precisão de ${e.accuracy.toFixed(0)} metros. A rota pode não ser exata. Deseja continuar?`)) {
                            reject(new Error("Localização com baixa precisão, cálculo de rota cancelado pelo usuário.")); return;
                        }
                        startLatLng = e.latlng; resolve();
                    });
                    mapRef.current.once('locationerror', (e) => {
                         let msg = "Não foi possível obter sua localização atual para a rota. ";
                         switch (e.code) { case 1: msg += "Permissão negada."; break; case 2: msg += "Localização indisponível."; break; case 3: msg += "Tempo esgotado."; break; default: msg += "Erro desconhecido.";}
                         alert(msg + " Verifique as permissões e tente novamente, ou digite um endereço de partida.");
                         reject(new Error("Erro de localização para rota: " + e.message));
                    });
                });
            } else {
                startPointDisplay = startPoint;
                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startPoint + ", Recife, PE, Brasil")}&limit=1&countrycodes=br&addressdetails=1`, { headers: { 'User-Agent': 'FlorDaCidadeMap/1.0 (https://flordacidade.recife.pe.gov.br)' }});
                const geoData = await geoResponse.json();
                if (geoData && geoData[0]) {
                    startLatLng = L.latLng(parseFloat(geoData[0].lat), parseFloat(geoData[0].lon));
                } else {
                    alert("Ponto de partida digitado não encontrado."); setIsCalculatingRoute(false); return;
                }
            }

            if (!startLatLng || typeof startLatLng.lat !== 'number' || typeof startLatLng.lng !== 'number' || isNaN(startLatLng.lat) || isNaN(startLatLng.lng)) {
                console.error("Invalid startLatLng before OSRM call:", startLatLng);
                alert("Ponto de partida inválido (NaN ou não numérico). Não foi possível calcular a rota.");
                setIsCalculatingRoute(false); return;
            }
             if (!destinationHorta || typeof destinationHorta.latitude !== 'number' || typeof destinationHorta.longitude !== 'number' || isNaN(destinationHorta.latitude) || isNaN(destinationHorta.longitude)) {
                console.error("Invalid destinationHorta coordinates before OSRM call:", destinationHorta);
                alert("Coordenadas do destino inválidas (NaN ou não numéricas). Não foi possível calcular a rota.");
                setIsCalculatingRoute(false); return;
            }


            const destLatLng = L.latLng(destinationHorta.latitude, destinationHorta.longitude);

            console.log("Start Coords for OSRM:", { lat: startLatLng.lat, lng: startLatLng.lng });
            console.log("Dest Coords for OSRM:", { lat: destLatLng.lat, lng: destLatLng.lng });

            if (startLatLng.distanceTo(destLatLng) < 1) { 
                alert("O ponto de partida e o destino estão muito próximos ou são idênticos. Não é possível calcular a rota.");
                setIsCalculatingRoute(false); return;
            }

            const osrmBaseUrl = 'https://router.project-osrm.org/route/v1';
            const profile = 'driving'; 
            const osrmUrl = `${osrmBaseUrl}/${profile}/${startLatLng.lng},${startLatLng.lat};${destLatLng.lng},${destLatLng.lat}?overview=full&geometries=geojson&steps=true`;
            
            console.log("Constructed OSRM URL:", osrmUrl);

            const routeResponse = await fetch(osrmUrl);
            
            console.log("OSRM Response Status:", routeResponse.status, routeResponse.statusText);

            if (!routeResponse.ok) {
                const errorText = await routeResponse.text();
                console.error("OSRM Error Raw Response:", errorText);
                let errorDataMessage = 'Erro desconhecido do servidor de rotas.';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorDataMessage = errorJson.message || errorDataMessage;
                } catch (e) {
                    if(errorText.length < 200) errorDataMessage = errorText;
                }
                alert(`Falha ao calcular rota. Servidor respondeu com status ${routeResponse.status}. Detalhe: ${errorDataMessage}`);
                currentRoutePolylineRef.current = null;
                setIsCalculatingRoute(false);
                return; 
            }

            const routeData = await routeResponse.json();

            if (routeData.routes && routeData.routes.length > 0) {
                const route = routeData.routes[0];
                const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                const polyline = L.polyline(routeCoordinates, { color: 'blue', weight: 5 });
                currentRoutePolylineRef.current = polyline;

                const newRouteDisplayLayer = L.layerGroup([
                    L.marker(startLatLng).bindPopup(startPointDisplay),
                    L.marker(destLatLng).bindPopup(destinationHorta.nomeHorta),
                    polyline
                ]).addTo(mapRef.current);

                mapRef.current.fitBounds(polyline.getBounds());
                setRoutingControl(newRouteDisplayLayer);

                if (route.legs && route.legs.length > 0 && route.legs[0].steps) {
                    const newInstructions = route.legs[0].steps;
                    setRouteInstructions(newInstructions);
                    
                    if (isFollowingUser && newInstructions.length > 0 && newInstructions[0]?.maneuver?.instruction) {
                         const initialInstructionText = forcedStartLatLng ? "Rota recalculada. " : "Iniciando rota. ";
                        speak(initialInstructionText + newInstructions[0].maneuver.instruction);
                    } else if (isFollowingUser) {
                        speak(forcedStartLatLng ? "Rota recalculada." : "Iniciando rota.");
                    }
                    setCurrentStepIndex(0);
                }

            } else {
                console.warn("OSRM response OK, but no routes found in data:", routeData);
                alert("Não foi possível calcular a rota. Verifique os pontos ou tente novamente (nenhuma rota retornada).");
                currentRoutePolylineRef.current = null;
            }
        } catch (error) {
             console.error("Erro ao calcular rota (bloco catch):", error);
             currentRoutePolylineRef.current = null;
            if (error.message && !error.message.startsWith("Erro de localização") && !error.message.startsWith("Localização com baixa precisão")) {
                alert("Ocorreu um erro ao tentar calcular a rota: " + error.message);
            }
        } finally {
            setIsCalculatingRoute(false);
        }
    }, [mapRef, startPoint, destinationHorta, cancelSpeech, isFollowingUser, speak]);


    const checkOffRouteAndRecalculate = useCallback((userLatLng) => {
        if (!isFollowingUser || !routeInstructions.length || !currentRoutePolylineRef.current || !mapRef.current || currentStepIndex >= routeInstructions.length) {
            clearTimeout(offRouteRecalculateTimeoutRef.current); 
            offRouteRecalculateTimeoutRef.current = null;
            return;
        }
    
        if (!userLatLng || typeof userLatLng.lat !== 'number' || typeof userLatLng.lng !== 'number' || isNaN(userLatLng.lat) || isNaN(userLatLng.lng)) {
            console.warn("checkOffRouteAndRecalculate skipped: userLatLng inválido.", userLatLng);
            return;
        }
        if (!destinationHorta) { 
             console.warn("checkOffRouteAndRecalculate skipped: destinationHorta é nulo.");
             clearTimeout(offRouteRecalculateTimeoutRef.current); 
             offRouteRecalculateTimeoutRef.current = null;
             return;
        }
    
        let distanceToRoute = Infinity;
        try {
            if (L.GeometryUtil && typeof L.GeometryUtil.closest === 'function' && currentRoutePolylineRef.current.getLatLngs().length > 0) {
                const closestPointOnRoute = L.GeometryUtil.closest(mapRef.current, currentRoutePolylineRef.current, userLatLng, false);
                 if (closestPointOnRoute && closestPointOnRoute.latlng) { 
                    distanceToRoute = userLatLng.distanceTo(closestPointOnRoute.latlng);
                } else if (closestPointOnRoute instanceof L.LatLng) { 
                     distanceToRoute = userLatLng.distanceTo(closestPointOnRoute);
                }
            } else {
                 if (!L.GeometryUtil || typeof L.GeometryUtil.closest !== 'function') {
                    console.warn("L.GeometryUtil.closest não está disponível. A detecção de fora da rota será menos precisa.");
                }
            }
        } catch (e) {
            console.error("Erro ao calcular distância para a rota:", e);
        }
    
        if (distanceToRoute > OFF_ROUTE_THRESHOLD_METERS) {
            if (!offRouteRecalculateTimeoutRef.current) {
                speak("Você saiu da rota. Recalculando em alguns segundos.");
    
                offRouteRecalculateTimeoutRef.current = setTimeout(() => {
                    if (Date.now() - lastRecalculationTimeRef.current > MIN_TIME_BETWEEN_RECALCS_MS) {
                        if (destinationHorta && userLatLng) { 
                            console.log("Recalculating route due to being off-route. User at:", userLatLng);
                            handleCalculateRoute(userLatLng); 
                            lastRecalculationTimeRef.current = Date.now();
                        } else {
                             console.warn("Recalculation skipped (timeout): destinationHorta or userLatLng missing.");
                        }
                    } else {
                        console.log("Recálculo de rota ignorado (timeout), muito próximo do último.");
                    }
                    offRouteRecalculateTimeoutRef.current = null;
                }, RECALCULATION_DEBOUNCE_MS);
            }
        } else {
            if (offRouteRecalculateTimeoutRef.current) {
                clearTimeout(offRouteRecalculateTimeoutRef.current);
                offRouteRecalculateTimeoutRef.current = null;
            }
        }
    }, [isFollowingUser, routeInstructions, currentStepIndex, speak, handleCalculateRoute, mapRef, destinationHorta]);


    const handleLocationUpdateForRoute = useCallback((userLatLng) => {
        if (isFollowingUser && routeInstructions.length > 0 && currentStepIndex >= 0) {
            if (currentStepIndex >= routeInstructions.length) {
                 setDistanceToNextManeuver(0);
            } else {
                const currentManeuver = routeInstructions[currentStepIndex].maneuver.location;
                const maneuverLatLng = L.latLng(currentManeuver[1], currentManeuver[0]);
                const distance = userLatLng.distanceTo(maneuverLatLng);
                setDistanceToNextManeuver(distance);
    
                if (distance < ADVANCE_THRESHOLD_METERS) {
                     setCurrentStepIndex(prevIndex => prevIndex + 1);
                }
            }
        } else {
            setDistanceToNextManeuver(null);
        }
        checkOffRouteAndRecalculate(userLatLng);
    }, [isFollowingUser, routeInstructions, currentStepIndex, checkOffRouteAndRecalculate]);
    

    const handleClearRoute = () => {
        cancelSpeech();
        if (routingControl && mapRef.current && mapRef.current.hasLayer(routingControl)) { 
            mapRef.current.removeLayer(routingControl);
        }
        setRoutingControl(null);
        currentRoutePolylineRef.current = null;
        clearTimeout(offRouteRecalculateTimeoutRef.current);
        offRouteRecalculateTimeoutRef.current = null;

        setDestinationHorta(null); 
        setRouteInstructions([]);
        setCurrentStepIndex(-1);
        setDistanceToNextManeuver(null);
    };

    const handleToggleFullScreen = useCallback(() => {
        if (screenfull.isEnabled && mapContainerRef.current) {
            screenfull.toggle(mapContainerRef.current);
        }
    }, []);

    useEffect(() => {
        if (screenfull.isEnabled) {
            const handleChange = () => setIsFullScreen(screenfull.isFullscreen);
            screenfull.on('change', handleChange);
            return () => screenfull.off('change', handleChange);
        }
    }, []);

    return (
        <div
            ref={mapContainerRef}
            className={`relative w-full ${isEmbedded ? "h-[600px] rounded-xl overflow-hidden" : "h-screen"}`}
        >
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
                    searchTerm={searchTerm}
                    onSearchTermChange={(e) => setSearchTerm(e.target.value)}
                    onSearchSubmit={handleSearchSubmit}
                    startPoint={startPoint}
                    onStartPointChange={(e) => setStartPoint(e.target.value)}
                    allHortasForSearch={allHortas}
                    currentDestinationHorta={destinationHorta}
                    onDestinationHortaSelected={setDestinationHorta}
                    onCalculateRoute={handleCalculateRoute}
                    onClearRoute={handleClearRoute}
                    isCalculatingRoute={isCalculatingRoute}
                    routeInstructions={routeInstructions}
                    currentStepIndex={currentStepIndex}
                    distanceToNextManeuver={distanceToNextManeuver}
                />
            </div>

            <MapContainer
                ref={mapRef}
                center={initialPosition}
                zoom={12}
                scrollWheelZoom={true} 
                className="h-full w-full z-0"
                zoomControl={false}
            >
                <MapControls
                    onToggleFullScreen={handleToggleFullScreen}
                    isFullScreen={isFullScreen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onLocationUpdate={handleLocationUpdateForRoute}
                    isRouteActive={routeInstructions.length > 0 && currentStepIndex >=0 && currentStepIndex < routeInstructions.length}
                    isFollowingUser={isFollowingUser}
                    onToggleFollowMe={handleToggleFollowMeState}
                />
                <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <MarkerClusterGroup 
                    key={filteredHortas.map(h => h.idHorta).join('-') + `-${activeFilters.join('')}`}
                    chunkedLoading 
                >
                    {filteredHortas.map(horta => (
                        <Marker
                            key={horta.idHorta}
                            position={[horta.latitude, horta.longitude]}
                            icon={Icons[normalizeTipoNome(horta.tipoDeHorta?.nome)] || Icons.DEFAULT}
                        >
                            <Popup>
                                <HortaPopup horta={horta} onSetAsDestination={handleSetAsDestination} />
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {(loadingMessage || error) && (!filteredHortas.length && !allHortas.length || error) && (
                 <div className="absolute inset-0 flex items-center justify-center z-[500] bg-gray-200/80 backdrop-blur-sm pointer-events-none">
                    <div className="text-center p-4 bg-white/80 rounded-lg shadow-lg max-w-sm">
                        {loadingMessage && !error && <FiLoader className="animate-spin text-4xl text-green-600 mx-auto mb-2" />}
                        {error && <FiAlertTriangle className="text-4xl text-red-500 mx-auto mb-2" />}
                        <p className={`font-medium ${error ? 'text-red-600' : 'text-gray-700'}`}>
                            {error || loadingMessage}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;