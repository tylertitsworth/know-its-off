#****************************************************************************************************
# FILENAME: models.py
# DESCRIPTION: This file defines each table in the database. For example, the Appliance table
# has several columns -- the name of the appliance, its ID, the status of the appliance,
# and its alert details. You can access the tables using SQLAlchemy, and you can intialize/setup the
# database using flask_migrate
# AUTHOR(S): Capstone 2020-2021 Douglas Wilson
# NOTES: Most of this file was written with the aid of this tutorial, read it if you get stuck.
# https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-iv-database
# The creation of the tables in the database is handled by flask_migrate
# https://flask-migrate.readthedocs.io/en/latest/index.html
#****************************************************************************************************
from app import db
from sqlalchemy import inspect, UniqueConstraint, TIMESTAMP
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime, timedelta
import os, base64

#The BatteryLogger keeps track of when a device has switched states.
#You may notice that the device variable has a relationship,
#in this case a device has a batterylog using backrefs.
#This allows access to that device through the battery log
#Read this for more information
#https://docs.sqlalchemy.org/en/14/orm/backref.html
class BatteryLogger(db.Model):
    __tablename__ = "battery_logger"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    timestamp_time = db.Column(db.TIMESTAMP, nullable = False)
    device_battery = db.Column(db.Float, nullable=False) 
    #The cascade allows the deletion of the battery logs automatically when the device is deleted.
    device_id = db.Column(db.Integer, db.ForeignKey('device.id', ondelete='CASCADE', onupdate="cascade"), nullable=False)

    device = relationship("Device", backref = "battery_logger")

    #To dictionary functions are used to format the data to make it easier to JSONIFY    
    def to_dict(self):
        return {c.key: getattr(self, c.key)
            for c in inspect(self).mapper.column_attrs}

   #Takes in values from a dictionary to update the BatteryLogger
   #Read the tutorial mentioned in the notes for more information       
    def update(self, myDict):
        for key, value in myDict.items():
            setattr(self, key, value)

    #When you print a BatteryLogger, it will print the id of the log, not the entire object.
    def __repr__(self):
        return '<BatteryLog: >'.format(self.id)

#The Device represents metadata about the physical device attached to a status light.
#Users can own multiple devices, but a device belongs to one user.
class Device(db.Model):
    __name__ = "device"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    appliance_name = db.Column(db.String(64), nullable=False)
    #The state is an integer to handle future expansion for when devices have
    #more than 2 states, off and on.
    device_state = db.Column(db.Integer, default=False, nullable=False)
    device_battery = db.Column(db.Float, nullable=True) 
    timestamp = db.Column(db.TIMESTAMP, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    users = db.relationship('User', backref=db.backref('device', passive_deletes=True))


    def to_dict(self):
        return {c.key: getattr(self, c.key)
            for c in inspect(self).mapper.column_attrs}
            
    def update(self, myDict):
        for key, value in myDict.items():
            setattr(self, key, value)

    def __repr__(self):
        return '<Device {}>'.format(self.id)

#The user is the person that owns all of the devices.
#This object includes information about the user in order to validate their user session.
#The user class will require signfigant remodeling if OAuth is implemented, which needs\
#to be done if better Google Assistant intergration is to be added.
class User(UserMixin, db.Model):
    __name__ = "user"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    password = db.Column(db.String(512), nullable=False)
    email = db.Column(db.String(64), nullable=False, unique=True)
    devices = db.relationship('Device', backref='owner', lazy='dynamic')

    def to_dict(self):
        return {c.key: getattr(self, c.key)
            for c in inspect(self).mapper.column_attrs}

    def update(self, myDict):
        for key, value in myDict.items():
            setattr(self, key, value)

    #You should only set the password using this function as it hashes the password.
    #Plaintext passwords in a database is a bad idea.
    def set_password(self, password):
        self.password = generate_password_hash(password)

    #As all of the passwords are hashed, you need this function
    #to verify that the passwords match.
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    # This is how the object looks when printed out.
    def __repr__(self):
        return '<User {}>'.format(self.email)
