#!/usr/bin/env python
# coding: utf-8

# In[40]:


from dotenv import load_dotenv
import json
import whisper
from pyannote.audio import Pipeline
from pyannote_whisper.utils import diarize_text
import os
from pathlib import Path
from pydub import AudioSegment
import shutil, errno
import pandas as pd


# In[24]:


def extension(file):
    return Path(file).suffix.replace('.', '')

def copydir(src, dst):
    try:
        shutil.copytree(src, dst)
    except OSError as exc: # python >2.5
        if exc.errno in (errno.ENOTDIR, errno.EINVAL):
            shutil.copy(src, dst)
        else: raise


# In[25]:


file = 'data/Parker Sams DJNF profile.m4a'


# In[26]:


output_name = Path(file).stem.replace(' ', '_')
copyanything('web', output_name)


# In[27]:


raw_audio = AudioSegment.from_file(file, format=extension(file))
formatted_file = f'{output_name}/audio.mp3'
raw_audio.export(formatted_file, format='mp3')


# In[28]:


load_dotenv('openai.env')


# In[29]:


pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1",
                                    use_auth_token=os.getenv('PYANNOTE'))


# In[8]:


diarization_result = pipeline(formatted_file)


# In[9]:


model = whisper.load_model("base")


# In[10]:


asr_result = model.transcribe(formatted_file)


# In[11]:


final_result = diarize_text(asr_result, diarization_result)


# In[55]:


speaker_matches = {list(final_result[i])[0].start : list(final_result[i])[1] for i in range(0, len(final_result))}
for i in range(0, len(speaker_matches.keys())):
    k = list(speaker_matches.keys())[i]
    if speaker_matches[k] is None:
        speaker_matches[k] = speaker_matches[list(speaker_matches.keys())[i-1]]


# In[56]:


switches = list(speaker_matches.keys())
for i in range(0, len(asr_result['segments'])):
    curr_start = asr_result['segments'][i]['start']
    for j in range(0, len(switches)):
        if curr_start < switches[j]:
            switch = switches[j-1]
            break
    asr_result['segments'][i]['speaker'] = speaker_matches[switch]


# In[57]:


result = asr_result


# In[58]:


with open(f'{output_name}/transcript.json', 'w') as out_path:  
    json.dump(result, out_path)

