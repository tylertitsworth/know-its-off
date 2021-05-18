#****************************************************************************************************
# FILENAME: logout.py
# DESCRIPTION: This file contains the route to log the user out
# AUTHOR(S): Capstone 2020-2021
# NOTES: Remember that every route has an /api written before it.
# /device/id becomes /api/device/id
#****************************************************************************************************
from flask import redirect
from flask_login import login_required, logout_user
from app import db
from app.api import bp

#logs the user out
@bp.route('/logout')
@login_required
def logout():
    logout_user()
    db.session.close()
    return '', 204