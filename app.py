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
from io import BytesIO

app = Flask(__name__)

# no modification required beyond function name
@app.route('/transcribe', methods=['GET', 'POST'])
def transcribe():
    print('hello world')
    raw_audio = BytesIO(request.files['file'].read())

    elevenlabs = ElevenLabs(
        #api_key=os.environ.get('ELEVENLABS_API_KEY'),
        api_key='sk_412c599fb0a33891e818696239ecc14250afd1c2c8ae32f1'
    )

    transcription = elevenlabs.speech_to_text.convert(
        file=raw_audio,
        model_id="scribe_v1", # Model to use, for now only "scribe_v1" is supported
        tag_audio_events=True, # Tag audio events like laughter, applause, etc.
        language_code="eng", # Language of the audio file. If set to None, the model will detect the language automatically.
        diarize=True, # Whether to annotate who is speaking
    )

    transcript = dict(transcription)

    result = []
    i = 0
    prev_speaker = dict(transcript['words'][0])['speaker_id']
    result.append({
                'speaker_id': prev_speaker,
                'text': '',
                'words': []
            })
    for word in transcript['words']:
        word = dict(word)
        curr_speaker = word['speaker_id']
        if curr_speaker == prev_speaker:
            result[i]['text'] += word['text']
            result[i]['words'].append(word)
        else:
            i += 1
            result.append({
                'speaker_id': curr_speaker,
                'text': word['text'],
                'words': [word]
            })
        prev_speaker = curr_speaker


    for segment in result:
        segment['speaker_id'] = segment['speaker_id'].replace('_', ' ').title()

    result = {
        'transcript':{
            'segments': result
        }
    }

    r = Response(json.dumps(result), mimetype='application/json')

    r.headers.add('Access-Control-Allow-Origin', '*')
    return r

if __name__ == '__main__':
    app.run(debug=True)