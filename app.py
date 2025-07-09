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
from openai import OpenAI
from dotenv import load_dotenv

app = Flask(__name__)

def parse_json(text):
    if '```json' in text:
        text = text.replace('```json', '')
    if '```' in text:
        text = text.replace('```', '')
    return json.loads(text)

# no modification required beyond function name
@app.route('/transcribe', methods=['GET', 'POST'])
def transcribe():

    load_dotenv('openai.env')

    raw_audio = BytesIO(request.files['file'].read())

    elevenlabs = ElevenLabs(
        api_key=os.environ.get('ELEVENLABS_API_KEY'),
    )

    transcription = elevenlabs.speech_to_text.convert(
        file=raw_audio,
        model_id="scribe_v1", # Model to use, for now only "scribe_v1" is supported
        tag_audio_events=True, # Tag audio events like laughter, applause, etc.
        language_code="eng", # Language of the audio file. If set to None, the model will detect the language automatically.
        diarize=True, # Whether to annotate who is speaking
    )

    transcript = dict(transcription)

    client = OpenAI()

    # chatgpt's summary
    prompt = f"""
            Summarize the following transcript in 300 words or less. Cite notable quotes exactly as they appear in the original transcript. 
            Structure your response as a JSON file. The JSON should include the summary under a key 'summary'.
            The JSON should have a second key, "quotes", which should point to a list of dictionary objects. Include each quote cited in the summary under this list of quotes.
            Each quote object should contain the following: 
            - A key "quote", which contains the exact quote, and 
            - A key "insight", which contains your assessment of the quote's value. 
            - A key "start" which contains the start timestamp for the excerpted quote
            - A key "end" which contains the end timestamp for the excerpted quote
            The transcript begins after the colon: {transcript}
            """

    response = client.responses.create(
        model="gpt-4.1-nano",
        input=prompt
    )

    summary = parse_json(response.output[0].content[0].text)


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

    total_chars = 0
    for segment in result:
        segment['speaker_id'] = segment['speaker_id'].replace('_', ' ').title()
        total_chars += len(segment['text']) + len(segment['speaker_id'])

    result = {
        'transcript':{
            'segments': result
        },
        'totalChars': total_chars,
        'summary': summary
    }

    r = Response(json.dumps(result), mimetype='application/json')

    r.headers.add('Access-Control-Allow-Origin', '*')
    return r

if __name__ == '__main__':
    app.run(debug=True)