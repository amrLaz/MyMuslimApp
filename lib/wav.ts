/** Encode des échantillons mono (entre -1 et 1) en fichier WAV 16 bits. */
export function pcm16Wav(samples: Float32Array, rate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true); // taille du bloc fmt
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true); // octets par seconde
  view.setUint16(32, 2, true); // octets par échantillon
  view.setUint16(34, 16, true); // bits par échantillon
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => {
    const v = Math.max(-1, Math.min(1, s));
    view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  });
  return new Blob([buffer], { type: "audio/wav" });
}

export const SPEECH_RATE = 16000;

/**
 * Convertit un enregistrement du navigateur (webm sur Android, mp4 sur iPhone)
 * en WAV mono 16 kHz, le seul format que la reconnaissance vocale accepte partout.
 */
export async function recordingToWav(recording: Blob): Promise<Blob> {
  const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
  const Ctx = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctx) throw new Error("audio");
  const ctx = new Ctx();
  try {
    const decoded = await ctx.decodeAudioData(await recording.arrayBuffer());
    const frames = Math.max(1, Math.ceil(decoded.duration * SPEECH_RATE));
    const offline = new OfflineAudioContext(1, frames, SPEECH_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return pcm16Wav(rendered.getChannelData(0), SPEECH_RATE);
  } finally {
    void ctx.close();
  }
}
