from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Station(db.Model):
    __tablename__ = 'stations'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    capacity = db.Column(db.Integer)
    bikes_available = db.Column(db.Integer)
    status = db.Column(db.String(50), default='Operative')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'position': {'lat': self.lat, 'lon': self.lon},
            'capacity': self.capacity,
            'bikes_available': self.bikes_available,
            'status': self.status
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
