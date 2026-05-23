import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

type SoundType = "forest" | "rain" | "stream" | "wind";

interface Sound {
  id: SoundType;
  label: string;
  icon: string;
  emoji: string;
}

const SOUNDS: Sound[] = [
  { id: "forest", label: "Лес", icon: "Trees", emoji: "🌲" },
  { id: "rain", label: "Дождь", icon: "CloudRain", emoji: "🌧" },
  { id: "stream", label: "Ручей", icon: "Waves", emoji: "💧" },
  { id: "wind", label: "Ветер", icon: "Wind", emoji: "🍃" },
];

function createForestSound(ctx: AudioContext): AudioNode {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.12;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter1 = ctx.createBiquadFilter();
  filter1.type = "bandpass";
  filter1.frequency.value = 800;
  filter1.Q.value = 0.4;

  const filter2 = ctx.createBiquadFilter();
  filter2.type = "lowpass";
  filter2.frequency.value = 1200;

  const gain = ctx.createGain();
  gain.gain.value = 0.35;

  source.connect(filter1);
  filter1.connect(filter2);
  filter2.connect(gain);
  source.start();
  return gain;
}

function createRainSound(ctx: AudioContext): AudioNode {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 400;

  const gain = ctx.createGain();
  gain.gain.value = 0.28;

  source.connect(filter);
  filter.connect(gain);
  source.start();
  return gain;
}

function createStreamSound(ctx: AudioContext): AudioNode {
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.3;

  for (let i = 0; i < 3; i++) {
    const bufferSize = ctx.sampleRate * (2 + i);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) data[j] = (Math.random() * 2 - 1) * 0.5;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 600 + i * 400;
    filter.Q.value = 0.8;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.3 + i * 0.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 80;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const g = ctx.createGain();
    g.gain.value = 0.33;
    source.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    source.start(ctx.currentTime + i * 0.3);
  }
  return masterGain;
}

function createWindSound(ctx: AudioContext): AudioNode {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  const gain = ctx.createGain();
  gain.gain.value = 0.4;

  source.connect(filter);
  filter.connect(gain);
  source.start();
  return gain;
}

export default function NaturePlayer() {
  const [active, setActive] = useState<SoundType | null>(null);
  const [volume, setVolume] = useState(0.6);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  const stopAll = useCallback(() => {
    if (sourceNodeRef.current && masterRef.current) {
      masterRef.current.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.5);
      setTimeout(() => {
        sourceNodeRef.current?.disconnect?.();
        sourceNodeRef.current = null;
      }, 600);
    }
  }, []);

  const play = useCallback((id: SoundType) => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) ctxRef.current = new Ctx();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    stopAll();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    let node: AudioNode;
    if (id === "forest") node = createForestSound(ctx);
    else if (id === "rain") node = createRainSound(ctx);
    else if (id === "stream") node = createStreamSound(ctx);
    else node = createWindSound(ctx);

    node.connect(master);
    sourceNodeRef.current = node;
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.8);
  }, [volume, stopAll]);

  const toggle = (id: SoundType) => {
    if (active === id) {
      stopAll();
      setActive(null);
    } else {
      play(id);
      setActive(id);
    }
  };

  useEffect(() => {
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(volume, ctxRef.current.currentTime, 0.2);
    }
  }, [volume]);

  useEffect(() => {
    return () => { stopAll(); };
  }, [stopAll]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-2">
        {SOUNDS.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-300 ${
              active === s.id
                ? "border-milk-500 bg-milk-100 shadow-sm scale-[0.97]"
                : "border-milk-200 bg-milk-50 hover:border-milk-300 hover:bg-milk-100"
            }`}
          >
            <span className="text-xl">{s.emoji}</span>
            <span className={`font-sans text-xs ${active === s.id ? "text-milk-700" : "text-milk-400"}`}>
              {s.label}
            </span>
            {active === s.id && (
              <span className="flex gap-0.5">
                {[0,1,2].map(i => (
                  <span
                    key={i}
                    className="w-0.5 bg-milk-400 rounded-full animate-sound-bar"
                    style={{ height: "10px", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div className="flex items-center gap-3">
          <Icon name="Volume2" size={14} className="text-milk-400 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-full h-1 rounded-full accent-amber-700 cursor-pointer"
            style={{ accentColor: "var(--milk-500)" }}
          />
          <Icon name="Volume1" size={14} className="text-milk-300 flex-shrink-0" />
        </div>
      )}

      <p className="font-sans text-xs text-milk-400 text-center italic">
        {active ? `Играет: ${SOUNDS.find(s => s.id === active)?.label.toLowerCase()} — нажмите повторно, чтобы остановить` : "Выберите звук природы для фона"}
      </p>
    </div>
  );
}