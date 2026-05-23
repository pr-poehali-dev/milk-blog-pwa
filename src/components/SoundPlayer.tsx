import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const SOUNDS = [
  {
    id: "waves",
    label: "Прибой",
    emoji: "🌊",
    // Web Audio API — генерируем звук волн программно (без внешних файлов)
    type: "waves",
  },
  {
    id: "rain",
    label: "Дождь",
    emoji: "🌧️",
    type: "rain",
  },
  {
    id: "forest",
    label: "Лес",
    emoji: "🌿",
    type: "forest",
  },
];

function createAmbientNode(
  ctx: AudioContext,
  type: string
): { start: () => void; stop: () => void } {
  const nodes: AudioNode[] = [];
  const sources: AudioBufferSourceNode[] = [];

  function makeNoise(bufSize = 4096) {
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function start() {
    if (type === "waves") {
      // Pink-ish noise with slow LFO for wave rhythm
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        nd[i] = (b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362) * 0.11;
      }

      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;

      // LFO for wave swell
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 2);

      src.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      src.start();

      sources.push(src);
      nodes.push(filter, gainNode, lfoGain);
    }

    if (type === "rain") {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) nd[i] = Math.random() * 2 - 1;

      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 1000;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 6000;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5);

      src.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(gainNode);
      gainNode.connect(ctx.destination);
      src.start();

      sources.push(src);
      nodes.push(highpass, lowpass, gainNode);
    }

    if (type === "forest") {
      // Soft wind-like noise with higher freq
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) nd[i] = (Math.random() * 2 - 1) * 0.3;

      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 800;
      filter.Q.value = 0.5;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 300;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 2.5);

      src.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      src.start();

      sources.push(src);
      nodes.push(filter, gainNode, lfoGain);
    }
  }

  function stop() {
    sources.forEach((s) => {
      try {
        s.stop();
        s.disconnect();
      } catch (ignored) {
        void ignored;
      }
    });
    nodes.forEach((n) => {
      try {
        n.disconnect();
      } catch (ignored) {
        void ignored;
      }
    });
  }

  return { start, stop };
}

export default function SoundPlayer() {
  const [active, setActive] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.6);
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      ambientRef.current?.stop();
      ctxRef.current?.close();
    };
  }, []);

  function getCtx() {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  function handleSelect(id: string) {
    if (active === id) {
      ambientRef.current?.stop();
      setActive(null);
      return;
    }

    ambientRef.current?.stop();

    const ctx = getCtx();
    const ambient = createAmbientNode(ctx, id);
    ambientRef.current = ambient;
    ambient.start();
    setActive(id);
  }

  function handleVolume(v: number) {
    setVolume(v);
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = v;
    }
  }

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2">
      {/* Sound buttons */}
      {active !== null && (
        <div className="flex flex-col items-end gap-2 animate-fade-up">
          {SOUNDS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-sans shadow-md transition-all duration-200 ${
                active === s.id
                  ? "bg-milk-800 text-milk-50 border-milk-800"
                  : "bg-white/80 backdrop-blur text-milk-600 border-milk-200 hover:border-milk-400"
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
              {active === s.id && (
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="w-0.5 h-3 bg-milk-300 rounded-full animate-[soundbar_0.8s_ease-in-out_infinite]" />
                  <span className="w-0.5 h-4 bg-milk-300 rounded-full animate-[soundbar_0.8s_ease-in-out_0.15s_infinite]" />
                  <span className="w-0.5 h-2 bg-milk-300 rounded-full animate-[soundbar_0.8s_ease-in-out_0.3s_infinite]" />
                </span>
              )}
            </button>
          ))}
          {/* Volume */}
          <div className="bg-white/80 backdrop-blur border border-milk-200 rounded-2xl px-4 py-3 shadow-md flex items-center gap-3">
            <Icon name="Volume2" size={14} className="text-milk-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="w-24 accent-[var(--milk-600)]"
            />
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => {
          if (active !== null) {
            ambientRef.current?.stop();
            setActive(null);
          } else {
            handleSelect("waves");
          }
        }}
        className={`w-12 h-12 rounded-full border shadow-lg flex items-center justify-center transition-all duration-300 ${
          active !== null
            ? "bg-milk-800 border-milk-800 text-milk-50"
            : "bg-white/80 backdrop-blur border-milk-200 text-milk-500 hover:border-milk-400"
        }`}
        title="Фоновые звуки"
      >
        <Icon name={active !== null ? "Volume2" : "VolumeX"} size={18} />
      </button>
    </div>
  );
}