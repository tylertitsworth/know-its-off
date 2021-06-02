#****************************************************************************************************
# FILENAME: __init__.py
# DESCRIPTION: Allows you to use the api folder as a package
# AUTHOR(S): Capstone 2020-2021
# NOTES: The __init.py__ allows the developer to treat the folder like a package, making imports easier.
# https://docs.python.org/3/reference/import.html#regular-packages
# The blueprint from flask in combination with the __init.py__ takes all of the files in this folder
# and allows them to be called with /api prepended.
#****************************************************************************************************
from flask import Blueprint

bp = Blueprint('api', __name__)

#Remember to import your file here if you create any, otherwise Flask will not recognise it.
from app.api import user, errors, device, logout, handler