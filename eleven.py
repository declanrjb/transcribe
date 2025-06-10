#!/usr/bin/env python
# coding: utf-8

# In[1]:

from dotenv import load_dotenv
import json
import os
from pathlib import Path
from pydub import AudioSegment
import shutil, errno
import pandas as pd
from elevenlabs.client import ElevenLabs
from elevenlabs import play
from io import BytesIO
from elevenlabs.client import ElevenLabs
import sys

def extension(file):
    return Path(file).suffix.replace('.', '')

load_dotenv('openai.env')

if (len(sys.argv) > 1):
    file = sys.argv[1]
    if (len(sys.argv) > 2):
        output_name = sys.argv[2]
    else:
        output_name = Path(file).stem.replace(' ', '_')
else:
    print("Please give a path to file")
    sys.exit()

elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)

with open(file, 'rb') as in_file:
    raw_audio = BytesIO(in_file.read())

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
            'text': ''
        })
for word in transcript['words']:
    word = dict(word)
    curr_speaker = word['speaker_id']
    if curr_speaker == prev_speaker:
        result[i]['text'] += word['text']
    else:
        i += 1
        result.append({
            'speaker_id': curr_speaker,
            'text': word['text']
        })
    prev_speaker = curr_speaker

result = {
    'segments': result
}

with open(f'{output_name}_transcript.json', 'w') as out_path:  
    json.dump(result, out_path)

