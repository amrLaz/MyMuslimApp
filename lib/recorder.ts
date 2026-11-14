export type Recorder = { stop(): Promise<Blob> };

export class MicError extends Error {
  constructor(public reason: "denied" | "none" | "unsupported") {
    super(reason);
  }
}

export function canRecord(): boolean {
  return typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

/** Démarre l'enregistrement du micro ; `stop()` rend le son enregistré. */
export async function startRecording(): Promise<Recorder> {
  if (!canRecord()) throw new MicError("unsupported");
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    const name = (err as DOMException).name;
    throw new MicError(name === "NotFoundError" || name === "OverconstrainedError" ? "none" : "denied");
  }
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
  recorder.start();
  return {
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(new Blob(chunks, { type: recorder.mimeType }));
        };
        if (recorder.state === "inactive") recorder.onstop(new Event("stop"));
        else recorder.stop();
      }),
  };
}
