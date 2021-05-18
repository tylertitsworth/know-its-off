#****************************************************************************************************
# FILENAME: __init__.py
# DESCRIPTION: Provides the skeleton for the Flask Backend, as well as Google Assistant functionality
# AUTHOR(S): Capstone 2020-2021
# NOTES: The __init.py__ allows the developer to treat the folder like a package, making imports easier.
# https://docs.python.org/3/reference/import.html#regular-packages
# This program was made with the help of this awesome tutorial!
# https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world
# You MUST have a constants and config file ready for this program to work
# You MUST have access to a database that has already been configured to work this program.
# Search up flask migrate to learn more about database setup
# https://flask-migrate.readthedocs.io/en/latest/index.html
# Flask Webframework Documentation
# https://flask.palletsprojects.com/en/1.1.x/
#****************************************************************************************************
from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_cors import CORS
from flask_assistant import Assistant, ask, tell

#Intial configuration of the flask app/database.
app = Flask(__name__, static_folder='../build', static_url_path='/')
app.config.from_object(Config)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db, compare_type=True)
#Imports are done here to avoid circular import errors
#https://stackabuse.com/python-circular-imports/
from app import models
from app.api import bp as api_bp
from app.models import User, Device

CORS(app)
#Blueprint allows functionality to be split between different files.
app.register_blueprint(api_bp, url_prefix='/api')

#Activate login functionality and turn redirects to login page
login_manager = LoginManager(app)
login_manager.login_view = 'api.login'
login_manager.init_app(app)
login_manager.session_protection = "strong"
#Enables google Assistant, and registers the route
assist = Assistant(app, route='/assist', project_id='know-its-off-303802')

#This will only be used with static webpages, if you are using the React Development server,
#you will not be using this route, but after building and running the server standalone this
#will be useful.
@app.route('/')
def index():
    return app.send_static_file('index.html')

#The route that google assistant uses to communicate with the backend.
#The user asks google assistant using the name of the device.
#The app will query the ENTIRE database and return the first match.
#Future developers should add authentication with specific users to this route.
#They may also want to implement fuzzy matching to help get the correct device.
@assist.action('deviceStateCheck')
def deviceStateCheck(deviceName):
    print(deviceName)
    #SELECT *
    #FROM Device
    #WHERE appliance_name = deviceName
    #LIMIT 1
    #This is how you will access the program throughout the Flask App
    #The function will return an object filled with the information from the above query
    #in a device, you can then manipulate the device using the functions outlined in models
    #and access the fields as normal.
    # https://www.tutorialspoint.com/sqlalchemy/sqlalchemy_orm_using_query.htm
    myDevice = Device.query.filter_by(appliance_name = deviceName).first()
    if myDevice is None:
        return tell("Can you try again?")
    if myDevice.device_state == 1:
        speech = "Your " + deviceName + " is on"
    elif myDevice.device_state == 0:
        speech = "Your " + deviceName + " is off"
    else:
        speech = "Your " + deviceName + " is not set up yet"
    return tell(speech)

#Returns 401 errors if you access pages while not logged in
@login_manager.unauthorized_handler
def unauthorized():
    return 'not authorized', 401

#Gets the current user from cookie data stored in browser
@login_manager.user_loader
def load_user(user_id):
    #SELECT *
    #FROM USER
    #WHERE User.id = user_id
    user_id = User.query.get(int(user_id))
    db.session.commit()
    return user_id

#Used to shutdown the session
#https://flask.palletsprojects.com/en/1.1.x/appcontext/
@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()
