from flask import Flask, render_template, request
import os

from flask import Flask, jsonify, request, Response
import math
import itertools
import flask_csv
import pandas as pd
import re
import json

app = Flask(__name__)

# no modification required beyond function name
@app.route('/transcribe')
def transcribe():

    r = Response(json.dumps({
        'request': request.args
    }), mimetype='application/json')
    
    r.headers.add('Access-Control-Allow-Origin', '*')
    return r

if __name__ == '__main__':
    app.run(debug=True)