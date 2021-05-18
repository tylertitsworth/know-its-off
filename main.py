#****************************************************************************************************
# FILENAME: __init__.py
# DESCRIPTION: This file is a context proccesor for the flask app, it runs before the main flask app
# to inject variables. If you add anything to the models, you should also add it here as well.
# From here, the rest of the flask app in the app to the api folders are run. 
# AUTHOR(S): Capstone 2020-2021
# NOTES: https://roytuts.com/context-processors-in-flask-api/
#****************************************************************************************************
from app import app, db
from app.models import User, Device, BatteryLogger
import os

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Device': Device, 'BatteryLogger': BatteryLogger}
