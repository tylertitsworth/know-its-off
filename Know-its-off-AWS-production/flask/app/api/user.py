#****************************************************************************************************
# FILENAME: device.py
# DESCRIPTION: This file contains routes that deal with the device.
# AUTHOR(S): Capstone 2020-2021
# NOTES: Remember that every route has an /api written before it.
# /device/id becomes /api/device/id
# If you want to learn about SQLalchemy sessions look here
# https://www.pythoncentral.io/understanding-python-sqlalchemy-session/
#****************************************************************************************************
from flask import request, abort, jsonify, Response, redirect, session, render_template
from flask_login import login_required, current_user, login_user
from flask_cors import cross_origin
from cerberus import Validator
from app.models import User, Device
from app.api import bp
from app import db

#The user shema in combination with the Validator user Ceberus to ensure that the incoming requests
#dealing with the device are good. (I.e. if they are missing a field it will freak out.)
user_schema = {
                    "email": {"type": "string", "maxlength": 64, "nullable": False}
}

v = Validator(user_schema, allow_unknown=True)

#This route checks the user password against the hashed version in the database.
@bp.route('/user/check/<passw>', methods=['POST'])
@login_required
def check_pass(passw):
    if current_user is None:
        db.session.close()
        abort(404, description="This user does not exist")
    if current_user.check_password(passw):
        return '', 204
    else:
        return '', 401

#Multifunction route that deals with various operations on individual users
#You will notice that this route does not actually use the id passed in and
#instead only uses the current user (currently logged in).
#This has been left in for compatability purposes with the front end's inherited
#code base.
@bp.route('/user/<id>', methods=['GET', 'PATCH', 'DELETE'])
@login_required
def user_get_patch_delete_by_id(id):
    if current_user is None:
        db.session.close()
        abort(404, description="This user does not exist")
    #Returns the current user
    if request.method == 'GET':
        returnValue = jsonify(current_user.to_dict())
        db.session.close()
        return returnValue, 200
    #Updates the user password
    elif request.method == 'PATCH':
        obj = request.get_json()
        if not v.validate(obj):
            abort(400, description=v.errors)
        # Note that this update function is specified in models.py
        if "password" in obj:
            myPassword = obj.pop('password', None)
            current_user.set_password(myPassword)
        current_user.update(obj) 
        db.session.commit()
        returnValue = jsonify(current_user.to_dict())
        db.session.close()
        return returnValue, 200
    #Removes the user and its devices from the database
    elif request.method == 'DELETE':
        user = User.query.filter_by(id = current_user.get_id())
        for o in user:
            db.session.delete(o)
            db.session.flush()
        db.session.delete(current_user)
        db.session.commit()
        db.session.close()
        return '', 204

#Logs the user in using the flask framework
@bp.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        if not v.validate(request.get_json()):
            abort(400, description=v.errors)
        user_data = request.get_json()
        user_email = user_data['email']
        check_user = User.query.filter_by(email=user_email).first()
        #Notice how we don't work with the user objects password directly, and instead use the check_password functions
        #to deal with the hashing procedure.
        if not check_user or not check_user.check_password(user_data['password']):
            abort(403, description="The credentials you entered were incorrect")
        result = login_user(check_user)
        db.session.close()
        if result:
            return '', 204
        else:
            return 'Unauthorized', 401

#Adds a new user to the database
@bp.route('/user', methods=['POST'])
def user_post():
    if request.method == 'POST':
        obj = request.get_json()
        if not v.validate(obj):
            abort(400, description=v.errors)
        myPassword = obj.pop('password', None)
        new_user = User(**obj)
        new_user.set_password(myPassword)
        db.session.add(new_user)
        db.session.commit()
        returnValue = jsonify(new_user.to_dict())
        db.session.close()
        print("New user added")
        return returnValue, 201
