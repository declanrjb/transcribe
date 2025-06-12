
import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({ apiKey: "sk_412c599fb0a33891e818696239ecc14250afd1c2c8ae32f1" });

await client.speechToText.convert({
	model_id: "scribe_v1",
	file: file,
});