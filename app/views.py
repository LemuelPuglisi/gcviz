import json

from flask import Blueprint, render_template
from flask_cors import CORS, cross_origin

views = Blueprint('views', __name__, url_prefix='/')
cors = CORS(views)

@views.route('/')
@cross_origin()
def index():
    return render_template('index.html')