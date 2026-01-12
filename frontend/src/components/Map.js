import React, { useState, useEffect, useCallback } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getStations, deleteStation, geocodeAddress } from '../services/api';
import StationPopup from './StationPopup';
import './Map.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

function VelibMap() {
    const [viewState, setViewState] = useState({
        latitude: 48.8566,
        longitude: 2.3522,
        zoom: 12
    });
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchAddress, setSearchAddress] = useState('');
    const [searching, setSearching] = useState(false);

    const loadStations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getStations(viewState.latitude, viewState.longitude, 0.015);
            setStations(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des stations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [viewState.latitude, viewState.longitude]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadStations();
        }, 500);

        return () => clearTimeout(timer);
    }, [loadStations]);

    const handleMarkerClick = (station) => {
        setSelectedStation(station);
    };

    const handleClosePopup = () => {
        setSelectedStation(null);
    };

    const handleStationUpdated = (updatedStation) => {
        setStations(stations.map(s => s.id === updatedStation.id ? updatedStation : s));
        setSelectedStation(updatedStation);
    };

    const handleStationDeleted = async (id) => {
        try {
            await deleteStation(id);
            setStations(stations.filter(s => s.id !== id));
            setSelectedStation(null);
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    const handleSearchAddress = async (e) => {
        e.preventDefault();
        if (!searchAddress.trim()) return;

        setSearching(true);
        setError(null);
        try {
            const response = await geocodeAddress(searchAddress);
            const { lat, lon } = response.data;
            
            setViewState({
                latitude: lat,
                longitude: lon,
                zoom: 14
            });
            
            const stationsResponse = await getStations(lat, lon, 0.015);
            setStations(stationsResponse.data);
            setSearchAddress('');
        } catch (err) {
            setError('Adresse introuvable. Essayez une autre adresse parisienne.');
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="map-container">
            <div className="map-header">
                <h1>Bornes Vélib - Paris</h1>
                <div className="map-header-content">
                    <form onSubmit={handleSearchAddress} className="search-form">
                        <input
                            type="text"
                            placeholder="Rechercher une adresse à Paris..."
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" disabled={searching} className="search-button">
                            {searching ? 'Recherche...' : 'Rechercher'}
                        </button>
                    </form>
                    <div className="map-controls">
                        {loading && <span className="loading-indicator">Chargement...</span>}
                        {error && <span className="error-indicator">{error}</span>}
                        {MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE' && (
                            <span className="error-indicator">Token Mapbox requis</span>
                        )}
                        <button onClick={handleLogout} className="logout-button">
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>
            {MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE' ? (
                <div className="map-placeholder">
                    <p>Configurez votre token Mapbox dans le fichier .env</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#666' }}>
                        REACT_APP_MAPBOX_TOKEN=votre_token_ici
                    </p>
                </div>
            ) : (
                <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    style={{ width: '100%', height: 'calc(100vh - 60px)' }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                >
                {stations.map(station => (
                    <Marker
                        key={station.id}
                        latitude={station.position.lat}
                        longitude={station.position.lon}
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            handleMarkerClick(station);
                        }}
                    >
                        <div className={`marker ${station.status === 'Operative' ? 'marker-active' : 'marker-inactive'}`}>
                            🚲
                        </div>
                    </Marker>
                ))}

                {selectedStation && (
                    <Popup
                        latitude={selectedStation.position.lat}
                        longitude={selectedStation.position.lon}
                        onClose={handleClosePopup}
                        closeButton={true}
                        closeOnClick={false}
                        anchor="bottom"
                    >
                        <StationPopup
                            station={selectedStation}
                            onUpdate={handleStationUpdated}
                            onDelete={handleStationDeleted}
                        />
                    </Popup>
                )}
                </Map>
            )}
        </div>
    );
}

export default VelibMap;
