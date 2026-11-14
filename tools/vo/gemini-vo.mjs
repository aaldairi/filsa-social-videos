// Voice over clips with Gemini TTS (same model and voice as Sara in the app).
// usage: GEMINI_API_KEY must be in the environment (never printed). node gemini-vo.mjs <lines.json> <outdir>
// Writes <outdir>/<lang>-<n>.wav (24 kHz mono). Prints only file names and sizes.
import fs from 'node:fs'; import path from 'node:path';
const [,, linesFile, outDir] = process.argv;
const key = process.env.GEMINI_API_KEY; if (!key) { console.error('GEMINI_API_KEY missing'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(linesFile, 'utf8')); fs.mkdirSync(outDir, { recursive: true });
const wav = (pcm, rate) => { const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40); return Buffer.concat([h, pcm]); };
for (const lang of ['en', 'ar']) for (const [i, text] of cfg[lang].entries()) {
  const style = cfg.style || 'warmly, calmly and clearly';
  const prompt = `Say the following ${style} as a friendly woman from Bahrain narrating a short business video, in ${lang === 'ar' ? 'Bahraini Gulf Arabic' : 'English'}. ${cfg.pace || 'Unhurried pace.'} Speak only the words after this line:\n${text}`;
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent`, { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.voice } } } } }) });
    if (!r.ok) { console.error(`${lang}-${i + 1}: HTTP ${r.status} (attempt ${attempt})`); await new Promise(s => setTimeout(s, 3000)); continue; }
    const d = await r.json(); const a = d.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
    if (!a) { console.error(`${lang}-${i + 1}: no audio (attempt ${attempt})`); continue; }
    const rate = Number(/rate=(\d+)/.exec(a.mimeType)?.[1] || 24000);
    const f = path.join(outDir, `${lang}-${i + 1}.wav`); fs.writeFileSync(f, wav(Buffer.from(a.data, 'base64'), rate));
    console.log(f, fs.statSync(f).size); ok = true;
  }
  if (!ok) process.exitCode = 1;
}
