from app import app, db
from app.models import User, Device, BatteryLogger
import os

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Device': Device, 'BatteryLogger': BatteryLogger}
