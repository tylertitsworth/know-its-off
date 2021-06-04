#****************************************************************************************************
# FILENAME: device.py
# DESCRIPTION: This file contains routes that deal with the device.
# AUTHOR(S): Capstone 2020-2021 Douglas Wilson
# NOTES: Remember that every route has an /api written before it.
# /device/id becomes /api/device/id
# If you want to learn about SQLalchemy sessions look here
# https://www.pythoncentral.io/understanding-python-sqlalchemy-session/
#****************************************************************************************************
from flask import request, abort, jsonify
from flask_login import login_required, current_user
from app.api import bp
from app.models import Device, BatteryLogger
from app import db
from cerberus import Validator
from flask import abort


#The device shema in combination with the Validator user Ceberus to ensure that the incoming requests
#dealing with the device are good. (I.e. if they are missing a field it will freak out.)
device_schema = {
                    "appliance_name": {"type": "string", "maxlength": 64, "nullable": True}, 
                    "device_state": {"type": "integer", "default": False, "nullable": False},
                    "device_battery": {"type": "float", "nullable": True},
                    "timestamp": {"type": "datetime", "nullable": True}
}

v = Validator(device_schema, allow_unknown=True)

#Multi use Route to get and modify specific information about devices 
@bp.route('/device/<id>', methods=['GET', 'PATCH', 'DELETE'])
#The login_required route requires the user to be logged in otherwise
#401 UNAUTHORIZED will be returned.
@login_required
def device_get_patch_delete_by_id(id):
    #SELECT *
    #FROM device
    #WHERE device.id = id AND device.user_id = current_user id
    #LIMIT 1
    #We make sure that the current_user can't put down devices 
    #that they do not have access to
    myDevice = Device.query.filter_by(id=id, user_id=current_user.get_id()).first()
    
    #Returns the specific device
    if request.method == 'GET':
        #Values need to be in JSON to be sent back correctly
        #But they need to be turned into a dictionary before
        #they can be turned into JSON
        returnValue = jsonify(myDevice.to_dict())
        #db.session.close gives the thread back to the connection pool, 
        #read the tutorial back in the notes
        db.session.close
        return returnValue, 200
    #Updates the device tuple with new information
    elif request.method == 'PATCH':
        if not v.validate(request.get_json()):
            abort(400, description=v.errors)

        #Update each battery log with a matching ID
        print("Looking for ID: ", request.get_json().get("id"))
        num_rows_updated = BatteryLogger.query.filter_by(device_id = id).update(dict(device_id = request.get_json().get("id")))

        myDevice.update(request.get_json())
        #The changes are not saved to the database until you commit them.
        db.session.commit()
        returnValue = jsonify(myDevice.to_dict())
        db.session.close()
        print(myDevice, " Updated")
        return returnValue, 200
    #Deletes device from database
    elif request.method == 'DELETE':
        db.session.delete(myDevice)
        db.session.commit()
        db.session.close()
        print(myDevice, " Removed")
        return '', 204

#Gets every single device in the database, used in the edit device page.
@bp.route('/allDevices', methods=['GET'])
@login_required
def getAllDevices():
    myQuery = Device.query.all()
    myList = []
    for row in myQuery:
        myList.append(row.to_dict())
    return jsonify(myList), 200

#This route takes in a device id and returns all of the associated battery logs with the device.
@bp.route('/batteryLogs/<id>', methods=['GET'])
@login_required
def getDeviceLogs(id):
    if request.method == 'GET':
        #SELECT * 
        #FROM BatteryLogger
        #WHERE device_id = id
        myLogs = BatteryLogger.query.filter_by(device_id = id).all()
        returnValue = []
        for row in myLogs:
            returnValue.append(row.to_dict())
        for row in returnValue:
            del row["id"]
        return jsonify(returnValue), 200

#This route returns all of the devices that belong to the current user
#It can get the current users id from flask
#It also does some work on the timestamp to make it prettier
#Be warned that the timestamp is based upon the servers timezone.
#This must be handled on the front end.
@bp.route('/devices', methods=['GET'])
@login_required
def getUserDevices():
    #SELECT * 
    #FROM BatteryLogger
    #WHERE device_id = id
    results = Device.query.filter_by(user_id = current_user.get_id())
    myList = []
    for row in results:
        rowDict = row.to_dict() 
        if rowDict['timestamp'] != None:
            given_date = rowDict['timestamp']
            #Format M/D/Y HR:MIN AM/PM
            given_date = given_date.strftime("%A %-I:%M %p, %B %d %Y")
            rowDict['timestamp'] = given_date
            myList.append(rowDict)
        else:
            rowDict['timestamp'] = "N/A"
            myList.append(rowDict)

    db.session.close()

    return jsonify(myList), 200

#Gets information about a new device from the front end
#and saves it to the database.
@bp.route('/device', methods=['POST'])
@login_required
def device_get_post():
    if request.method == 'POST':
        #Validates the device, if it doesn't match the schema it will be thrown out.
        if not v.validate(request.get_json()):
            abort(400, description=v.errors)
        new_device = Device(**request.get_json())
        new_device.user_id = current_user.get_id()
        #Set the device state to 2 (uninitialized)
        new_device.device_state = 2
        db.session.add(new_device)
        db.session.commit()
        returnValue = jsonify(new_device.to_dict())
        db.session.close()
        print(new_device, " Added")
        return returnValue, 201

