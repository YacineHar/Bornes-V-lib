from flask import request, jsonify
from flask_jwt_extended import jwt_required, create_access_token
from models import db, Station
import requests
import os

def register_routes(app):
    @app.route('/api/login', methods=['POST'])
    def login():
        username = request.json.get('username')
        password = request.json.get('password')
        
        if username == 'admin' and password == 'admin':
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token), 200
        
        return jsonify({"msg": "Bad credentials"}), 401

    @app.route('/api/geocode', methods=['GET'])
    @jwt_required()
    def geocode_address():
        address = request.args.get('address', '')
        if not address:
            return jsonify({"msg": "Address parameter required"}), 400
        
        mapbox_token = os.getenv('MAPBOX_TOKEN')
        if not mapbox_token:
            return jsonify({"msg": "Mapbox token not configured"}), 500
        
        try:
            url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json"
            params = {
                'access_token': mapbox_token,
                'country': 'FR',
                'limit': 1,
                'proximity': '2.3522,48.8566'
            }
            
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if data.get('features') and len(data['features']) > 0:
                feature = data['features'][0]
                coords = feature['geometry']['coordinates']
                return jsonify({
                    'lat': coords[1],
                    'lon': coords[0],
                    'name': feature.get('place_name', address)
                }), 200
            else:
                return jsonify({"msg": "Address not found"}), 404
                
        except requests.exceptions.RequestException as e:
            return jsonify({"msg": f"Geocoding error: {str(e)}"}), 500

    @app.route('/api/stations', methods=['GET'])
    @jwt_required()
    def get_stations():
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        address = request.args.get('address', '')
        radius = request.args.get('radius', type=float, default=0.01)
        
        if address and not (lat and lon):
            mapbox_token = os.getenv('MAPBOX_TOKEN')
            if mapbox_token:
                try:
                    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json"
                    params = {
                        'access_token': mapbox_token,
                        'country': 'FR',
                        'limit': 1,
                        'proximity': '2.3522,48.8566'
                    }
                    response = requests.get(url, params=params, timeout=5)
                    response.raise_for_status()
                    data = response.json()
                    
                    if data.get('features') and len(data['features']) > 0:
                        coords = data['features'][0]['geometry']['coordinates']
                        lon = coords[0]
                        lat = coords[1]
                except:
                    pass
        
        query = Station.query
        
        if lat and lon:
            query = query.filter(
                Station.lat.between(lat - radius, lat + radius),
                Station.lon.between(lon - radius, lon + radius)
            )
        
        stations = query.limit(200).all()
        return jsonify([s.to_dict() for s in stations]), 200

    @app.route('/api/stations', methods=['POST'])
    @jwt_required()
    def create_station():
        data = request.json
        
        if not all(k in data for k in ['id', 'name', 'lat', 'lon']):
            return jsonify({"msg": "Missing required fields"}), 400
        
        if Station.query.get(data['id']):
            return jsonify({"msg": "Station already exists"}), 409
        
        new_station = Station(
            id=data['id'],
            name=data['name'],
            lat=data['lat'],
            lon=data['lon'],
            capacity=data.get('capacity', 0),
            bikes_available=data.get('bikes_available', 0),
            status=data.get('status', 'Operative')
        )
        
        try:
            db.session.add(new_station)
            db.session.commit()
            return jsonify(new_station.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": str(e)}), 500

    @app.route('/api/stations/<int:station_id>', methods=['PUT'])
    @jwt_required()
    def update_station(station_id):
        station = Station.query.get_or_404(station_id)
        data = request.json
        
        if 'name' in data:
            station.name = data['name']
        if 'lat' in data:
            station.lat = data['lat']
        if 'lon' in data:
            station.lon = data['lon']
        if 'capacity' in data:
            station.capacity = data['capacity']
        if 'bikes_available' in data:
            station.bikes_available = data['bikes_available']
        if 'status' in data:
            station.status = data['status']
        
        try:
            db.session.commit()
            return jsonify(station.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": str(e)}), 500

    @app.route('/api/stations/<int:station_id>', methods=['DELETE'])
    @jwt_required()
    def delete_station(station_id):
        station = Station.query.get_or_404(station_id)
        
        try:
            db.session.delete(station)
            db.session.commit()
            return jsonify({"msg": "Station deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": str(e)}), 500

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "ok"}), 200
