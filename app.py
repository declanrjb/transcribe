from flask import Flask, render_template, request
import os

from flask import Flask, jsonify, request, Response
import math
import itertools
import flask_csv
import pandas as pd
import re
import json
from elevenlabs.client import ElevenLabs

app = Flask(__name__)

# no modification required beyond function name
@app.route('/transcribe', methods=['GET', 'POST'])
def transcribe():
    #file = request.files[0]

    # elevenlabs = ElevenLabs(
    #     api_key=os.getenv("ELEVENLABS_API_KEY"),
    # )

    # transcription = elevenlabs.speech_to_text.convert(
    #     file=request.files[0],
    #     model_id="scribe_v1", # Model to use, for now only "scribe_v1" is supported
    #     tag_audio_events=True, # Tag audio events like laughter, applause, etc.
    #     language_code="eng", # Language of the audio file. If set to None, the model will detect the language automatically.
    #     diarize=True, # Whether to annotate who is speaking
    # )


    r = Response(json.dumps({
        'request': request.form,
        'response': len(request.files)
    }), mimetype='application/json')

    r.headers.add('Access-Control-Allow-Origin', '*')
    return r

if __name__ == '__main__':
    app.run(debug=True)