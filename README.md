Transcribe and annotate audio from the web or the command line. Built by journalists, for journalists.

Mimir can be used on the web at [declanrjb.github.io/transcribe](https://declanrjb.github.io/transcribe/).

# Features

## Fast, reliable transcription

High quality transcripts processed using the [ElevenLabs](https://elevenlabs.io/) API and rendered in-line.

## Note taking

Highlight any section and press enter to create a new annotation in the right hand margin.

## Suggested Quotes

As journalists, we know that accuracy is the most important thing. Generated transcripts are fed into the OpenAI API with a prompt to identify key quotes while behaving as "a news reporter at a major national publication in the United States. You adhere strictly to the Associated Press Styleguide and the Society of Professional Journalists Code of Conduct." Quotes are then **manually** checked against the transcript by traditional non-ML Python, filtering out any hallucinations or modifications to the quote.

For extra verification, clicking on any quote jumps the audio track to the time stamp at which the quote occurs, so the journalist can easily listen and verify the phrasing.

## Save your work offline

Download your work as a JSON file to keep on your own hard drive. Reupload it to Mimir's homepage at any time to continue working.