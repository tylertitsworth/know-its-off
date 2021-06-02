#Replace the secret key with a random string
#The constants file must be created for this to work properly.
#Never upload this file to Github once it's in use to protect your secret key.
import os
import constants
basedir = os.path.abspath(os.path.dirname(__file__)) 

class Config(object):
    DEBUG = True
    TESTING = True
    CSRF_ENABLED = True
    SECRET_KEY = ‘<secret key of your choice>’
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://" + constants.username + ":" + constants.password + "@" + constants.host + "/" + constants.database
