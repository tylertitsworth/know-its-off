#****************************************************************************************************
# FILENAME: errors.py
# DESCRIPTION: This file contains the functions relating to error handling
# AUTHOR(S): Capstone 2020-2021
# NOTES: Notice how there are no actual routes in this file, the functions are used in other files
# to handle errors.
#****************************************************************************************************
from flask import jsonify
from werkzeug.http import HTTP_STATUS_CODES
from app.api import bp

#Returns a 400 code with the message in combination with the error_response function
def bad_request():
    return error_response(400, message)

def error_response(status_code, message=None):
    payload = {'error': HTTP_STATUS_CODES.get(status_code, 'Unknown error')}
    if message:
        payload['message'] = message
    response = jsonify(payload)
    response.status_code = status_code
    return response