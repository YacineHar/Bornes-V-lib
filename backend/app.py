from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from models import db
from routes import register_routes

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///velib.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-me-in-production'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    
    db.init_app(app)
    CORS(app)
    jwt = JWTManager(app)
    
    register_routes(app)
    
    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001, host='0.0.0.0')
