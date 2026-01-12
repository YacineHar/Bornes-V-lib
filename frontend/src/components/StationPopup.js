import React, { useState } from 'react';
import { updateStation } from '../services/api';
import './StationPopup.css';

function StationPopup({ station, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: station.name,
        status: station.status,
        capacity: station.capacity || 0,
        bikes_available: station.bikes_available || 0
    });
    const [loading, setLoading] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: station.name,
            status: station.status,
            capacity: station.capacity || 0,
            bikes_available: station.bikes_available || 0
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await updateStation(station.id, formData);
            onUpdate(response.data);
            setIsEditing(false);
        } catch (err) {
            alert('Erreur lors de la mise à jour');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la station "${station.name}" ?`)) {
            onDelete(station.id);
        }
    };

    return (
        <div className="station-popup">
            {!isEditing ? (
                <>
                    <h3>{station.name}</h3>
                    <div className="station-info">
                        <p><strong>ID:</strong> {station.id}</p>
                        <p><strong>Statut:</strong> 
                            <span className={`status-badge status-${station.status.toLowerCase()}`}>
                                {station.status}
                            </span>
                        </p>
                        <p><strong>Capacité:</strong> {station.capacity || 'N/A'}</p>
                        <p><strong>Vélos disponibles:</strong> {station.bikes_available || 0}</p>
                        <p><strong>Position:</strong> {station.position.lat.toFixed(6)}, {station.position.lon.toFixed(6)}</p>
                    </div>
                    <div className="popup-actions">
                        <button onClick={handleEdit} className="btn-edit">
                            Modifier
                        </button>
                        <button onClick={handleDelete} className="btn-delete">
                            Supprimer
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <h3>Modifier la station</h3>
                    <div className="edit-form">
                        <div className="form-field">
                            <label>Nom</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="form-field">
                            <label>Statut</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Operative">Opérationnelle</option>
                                <option value="Out of service">Hors service</option>
                                <option value="Closed">Fermée</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Capacité</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="form-field">
                            <label>Vélos disponibles</label>
                            <input
                                type="number"
                                value={formData.bikes_available}
                                onChange={(e) => setFormData({ ...formData, bikes_available: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="popup-actions">
                            <button onClick={handleSave} disabled={loading} className="btn-save">
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            <button onClick={handleCancel} className="btn-cancel">
                                Annuler
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default StationPopup;
