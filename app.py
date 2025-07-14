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

def find_quote_start(quote_text, transcript):
    quote = quote_text
    window_size = min(6, len(quote.split(' ')))
    quote_sample = ' '.join(quote.split(' ')[0:window_size])
    quote_sample = re.sub(r"[^\w\s]", '', quote_sample).lower()

    words = transcript['words']
    words = [dict(word) for word in words]
    words = [word for word in words if len(word['text'].strip()) > 0]

    for i in range(0, len(words)):
        start = max(0, i - window_size)
        end = i
        window = ' '.join([word['text'] for word in words[start:end]])
        window = re.sub(r"[^\w\s]", '', window).lower()
        if window == quote_sample:
            return words[start]['start']
    return None

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
        You are a news reporter at a major national publication in the United States. You adhere strictly to the Associated Press Styleguide and the Society of Professional Journalists Code of Conduct.
        Given the following transcript of an interview, identify five key quotes that provide insight into the thoughts and experiences of the interview subject and the topics discussed in the interview.
        Return quotes exactly as they appear in the original transcript. Do not excerpt quotes where removing surrounding context would convey a different meaning than the speaker intended. If context is relevant, include the context.
        Structure your response as a JSON file. The JSON should contain a key, "quotes", which should point to a list of dictionary objects, one per quote.
        Each quote object should contain the following: 
        - A key "quote", which contains the exact quote. Ensure that the text of the quote exactly matches the text found in the transcript I am giving you. No modifications whatsoever.
        Return structured JSON only, no yapping.
        The transcript begins after the colon: {transcript}
        """

    response = client.responses.create(
        model="gpt-4.1-nano",
        input=prompt
    )

    # get timestamps for the quotes
    quotes = parse_json(response.output[0].content[0].text)['quotes']

    for quote in quotes:
        quote['start'] = find_quote_start(quote['quote'], transcript)

    quotes = [quote for quote in quotes if quote['start'] is not None]

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
        'quotes': quotes
    }

    r = Response(json.dumps(result), mimetype='application/json')

    r.headers.add('Access-Control-Allow-Origin', '*')
    return r

if __name__ == '__main__':
    app.run(debug=True)