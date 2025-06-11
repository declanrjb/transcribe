

/*
const client = new ElevenLabsClient({ apiKey: "sk_412c599fb0a33891e818696239ecc14250afd1c2c8ae32f1" });
await client.speechToText.convert({
    modelId: "scribe_v1"
});
*/


$(function() {

  

  $('#upload-audio').on('click', function() {
    $('#audio-input').click()
  })

  $('#audio-input').on('change', function(e) {
    var file = e.target.files[0];
    //on change event  
    console.log(file)
    $('#audio-host').attr('src', URL.createObjectURL(file))
    console.log($('#audio-host').attr('src'))
    /*
    const reader = new FileReader();
    reader.onload = async (e) => {

        console.log(e.target.result)
        const audioBlob = new Blob([e.target.result], { type: "audio/mp3" });
        console.log(audioBlob)
        
        

        const client = new ElevenLabsClient({ apiKey: "" });
        await client.speechToText.convert({
            modelId: "scribe_v1",
            file: e.target.result
        });

        

        
    };
    reader.readAsDataURL(file);
    */
  })
})




/*
// example.mts
import { ElevenLabsClient } from "./node_modules/@elevenlabs/elevenlabs-js/index.js";
import "./node_modules/dotenv/config.js";

const elevenlabs = new ElevenLabsClient();

const response = await fetch(
  "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
);
const audioBlob = new Blob([await response.arrayBuffer()], { type: "audio/mp3" });

const transcription = await elevenlabs.speechToText.convert({
  file: audioBlob,
  modelId: "scribe_v1", // Model to use, for now only "scribe_v1" is supported.
  tagAudioEvents: true, // Tag audio events like laughter, applause, etc.
  languageCode: "eng", // Language of the audio file. If set to null, the model will detect the language automatically.
  diarize: true, // Whether to annotate who is speaking
});

console.log(transcription);
*/


/*

*/