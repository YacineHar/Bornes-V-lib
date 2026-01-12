import pandas as pd
from app import app
from models import db, Station

def load_data():
    print("Lecture du fichier CSV...")
    df = pd.read_csv('velib-pos (1).csv', sep=';', encoding='utf-8')
    
    print(f"Nombre de lignes dans le CSV: {len(df)}")
    
    stations = []
    errors = []
    
    for idx, row in df.iterrows():
        try:
            geo_str = str(row['geo']).strip()
            if ',' in geo_str:
                lat_str, lon_str = geo_str.split(',', 1)
                lat = float(lat_str.strip())
                lon = float(lon_str.strip())
            else:
                errors.append(f"Ligne {idx}: Format geo invalide")
                continue
            
            station_id = int(row['Code de la station'])
            name = str(row['Nom de la station']).strip()
            capacity = int(row['Nombres de bornes en station']) if pd.notna(row['Nombres de bornes en station']) else 0
            bikes_available = int(row['Nombre de bornes disponibles']) if pd.notna(row['Nombre de bornes disponibles']) else 0
            status = str(row['Etat des stations']).strip() if pd.notna(row['Etat des stations']) else 'Operative'
            
            station = Station(
                id=station_id,
                name=name,
                lat=lat,
                lon=lon,
                capacity=capacity,
                bikes_available=bikes_available,
                status=status
            )
            stations.append(station)
            
        except Exception as e:
            errors.append(f"Ligne {idx} (Code: {row.get('Code de la station', 'N/A')}): {str(e)}")
            continue

    print(f"\n{len(errors)} erreurs rencontrées lors du parsing")
    if errors:
        print("Premières erreurs:")
        for err in errors[:5]:
            print(f"  - {err}")

    with app.app_context():
        print("\nCréation des tables...")
        db.create_all()
        
        print(f"Insertion de {len(stations)} stations...")
        for station in stations:
            existing = Station.query.get(station.id)
            if existing:
                existing.name = station.name
                existing.lat = station.lat
                existing.lon = station.lon
                existing.capacity = station.capacity
                existing.bikes_available = station.bikes_available
                existing.status = station.status
            else:
                db.session.add(station)
        
        db.session.commit()
        print(f"✓ {len(stations)} stations importées avec succès!")

if __name__ == '__main__':
    load_data()
