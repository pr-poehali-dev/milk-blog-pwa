import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

type SoundType = "forest" | "rain" | "stream" | "wind" | "fire" | "ocean" | "thunder" | "birds";

interface Sound {
  id: SoundType;
  label: string;
  emoji: string;
  description: string;
}

const SOUNDS: Sound[] = [
  { id: "forest",  label: "Лес",           emoji: "🌲", description: "Шелест листвы" },
  { id: "rain",    label: "Дождь",          emoji: "🌧", description: "Равномерный дождь" },
  { id: "stream",  label: "Ручей",          emoji: "💧", description: "Горный ручей" },
  { id: "wind",    label: "Ветер",          emoji: "🍃", description: "Степной ветер" },
  { id: "fire",    label: "Костёр",         emoji: "🔥", description: "Потрескивание огня" },
  { id: "ocean",   label: "Океан",          emoji: "🌊", description: "Волны у берега" },
  { id: "thunder", label: "Гроза",          emoji: "⛈",  description: "Далёкие раскаты" },
  { id: "birds",   label: "Птицы",          emoji: "🐦", description: "Рассветный хор" },
];

// ── Генераторы звуков ────────────────────────────────────────────────

function makeNoise(ctx: AudioContext, seconds = 3): AudioBufferSourceNode {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

function makeLFO(ctx: AudioContext, freq: number, depth: number): GainNode {
  const lfo = ctx.createOscillator();
  lfo.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = depth;
  lfo.connect(g);
  lfo.start();
  return g;
}

function createForestSound(ctx: AudioContext): AudioNode {
  const out = ctx.createGain(); out.gain.value = 0.3;
  const src = makeNoise(ctx, 4);
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 0.5;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass";  lp.frequency.value = 1400;
  const lfoG = makeLFO(ctx, 0.15, 150); lfoG.connect(bp.frequency);
  src.connect(bp); bp.connect(lp); lp.connect(out); src.start();
  return out;
}

function createRainSound(ctx: AudioContext): AudioNode {
  const out = ctx.createGain(); out.gain.value = 0.35;
  // Основной шум дождя
  const src = makeNoise(ctx, 2);
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 600;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass";  lp.frequency.value = 8000;
  src.connect(hp); hp.connect(lp); lp.connect(out); src.start();
  // Капли — случайные щелчки
  const scheduleDrops = () => {
    const delay = 0.05 + Math.random() * 0.12;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = 800 + Math.random() * 1200;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(g); g.connect(out);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.07);
    setTimeout(scheduleDrops, delay * 1000);
  };
  scheduleDrops();
  return out;
}

function createStreamSound(ctx: AudioContext): AudioNode {
  const out = ctx.createGain(); out.gain.value = 0.28;
  for (let i = 0; i < 4; i++) {
    const src = makeNoise(ctx, 2 + i);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.value = 500 + i * 350; bp.Q.value = 0.9;
    const lfoG = makeLFO(ctx, 0.25 + i * 0.18, 90); lfoG.connect(bp.frequency);
    const g = ctx.createGain(); g.gain.value = 0.25;
    src.connect(bp); bp.connect(g); g.connect(out); src.start(ctx.currentTime + i * 0.25);
  }
  return out;
}

function createWindSound(ctx: AudioContext): AudioNode {
  const out = ctx.createGain(); out.gain.value = 0.38;
  const src = makeNoise(ctx, 5);
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
  const lfoG = makeLFO(ctx, 0.07, 220); lfoG.connect(lp.frequency);
  // Порыв-гейн
  const gusts = ctx.createGain(); gusts.gain.value = 1;
  const gustLFO = ctx.createOscillator(); gustLFO.frequency.value = 0.04;
  const gustG = ctx.createGain(); gustG.gain.value = 0.4;
  gustLFO.connect(gustG); gustG.connect(gusts.gain); gustLFO.start();
  src.connect(lp); lp.connect(gusts); gusts.connect(out); src.start();
  return out;
}

function createFireSound(ctx: AudioContext): AudioNode {
  const out = ctx.createGain(); out.gain.value = 0.32;
  // Основной гул огня
  const src = makeNoise(ctx, 3);
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 400;
  const lfoG = makeLFO(ctx, 0.6, 80); lfoG.connect(lp.frequency);
  src.connect(lp); lp.connect(out); src.start();
  // Треск — случайные крекеры
  const crackle = () => {
    const gap = 0.15 + Math.random() * 0.8;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.3));
    const s = ctx.createBufferSource(); s.buffer = buf;
    const g = ctx.createGain(); g.gain.value = 0.25 + Math.random() * 0.35;
    s.connect(g); g.connect(out); s.start(); 
    setTimeout(crackle, gap * 1000);
  };
  crackle();
  return out;
}

function createOceanSound(ctx: AudioContext): AudioNode {
  const out = ctx.createGain(); out.gain.value = 0.38;
  // Белый шум — основа прибоя
  const src = makeNoise(ctx, 6);
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200;
  // Медленное нарастание/спад — волна
  const waveLFO = ctx.createOscillator(); waveLFO.frequency.value = 0.12; waveLFO.type = "sine";
  const waveG = ctx.createGain(); waveG.gain.value = 0.45;
  waveLFO.connect(waveG);
  const masterG = ctx.createGain(); masterG.gain.value = 0.7;
  waveG.connect(masterG.gain); waveLFO.start();
  src.connect(lp); lp.connect(masterG); masterG.connect(out); src.start();
  // Низкочастотный гул глубины
  const deep = makeNoise(ctx, 4);
  const deepLP = ctx.createBiquadFilter(); deepLP.type = "lowpass"; deepLP.frequency.value = 80;
  const deepG = ctx.createGain(); deepG.gain.value = 0.5;
  deep.connect(deepLP); deepLP.connect(deepG); deepG.connect(out); deep.start();
  return out;
}

function createThunderSound(ctx: AudioContext): AudioNode {
  const out = ctx.createGain(); out.gain.value = 0.3;
  // Непрерывный далёкий гром (низкий шум)
  const src = makeNoise(ctx, 5);
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 150;
  const rumbleLFO = makeLFO(ctx, 0.05, 40); rumbleLFO.connect(lp.frequency);
  const g = ctx.createGain(); g.gain.value = 0.6;
  src.connect(lp); lp.connect(g); g.connect(out); src.start();
  // Дождь на фоне
  const rain = makeNoise(ctx, 3);
  const rainHP = ctx.createBiquadFilter(); rainHP.type = "highpass"; rainHP.frequency.value = 1500;
  const rainG = ctx.createGain(); rainG.gain.value = 0.18;
  rain.connect(rainHP); rainHP.connect(rainG); rainG.connect(out); rain.start();
  // Удары грома
  const thunder = () => {
    const gap = 4000 + Math.random() * 12000;
    const dur = 1.5 + Math.random() * 2;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const env = Math.exp(-i / (d.length * 0.4));
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const s = ctx.createBufferSource(); s.buffer = buf;
    const thunderLP = ctx.createBiquadFilter(); thunderLP.type = "lowpass"; thunderLP.frequency.value = 200;
    const tg = ctx.createGain(); tg.gain.value = 0.5 + Math.random() * 0.4;
    s.connect(thunderLP); thunderLP.connect(tg); tg.connect(out); s.start();
    setTimeout(thunder, gap);
  };
  setTimeout(thunder, 2000 + Math.random() * 3000);
  return out;
}

function createBirdsSound(ctx: AudioContext): AudioNode {
  const out = ctx.createGain(); out.gain.value = 0.3;
  // Лёгкий фон — тихий шорох листьев
  const bg = makeNoise(ctx, 4);
  const bgBP = ctx.createBiquadFilter(); bgBP.type = "bandpass"; bgBP.frequency.value = 1000; bgBP.Q.value = 0.3;
  const bgG = ctx.createGain(); bgG.gain.value = 0.06;
  bg.connect(bgBP); bgBP.connect(bgG); bgG.connect(out); bg.start();
  // Пение птиц — серия тональных трелей
  const BIRD_PATTERNS = [
    [800, 1200, 1000, 1400],
    [600, 900, 1100, 800, 1300],
    [1500, 1200, 1600, 1400],
    [700, 1000, 700, 1100, 900],
    [2000, 1800, 2200, 1900],
  ];
  const singBird = () => {
    const pattern = BIRD_PATTERNS[Math.floor(Math.random() * BIRD_PATTERNS.length)];
    const noteDur = 0.06 + Math.random() * 0.08;
    const gap = 0.04 + Math.random() * 0.06;
    let t = ctx.currentTime + Math.random() * 0.2;
    pattern.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const vibLFO = ctx.createOscillator(); vibLFO.frequency.value = 8 + Math.random() * 4;
      const vibG = ctx.createGain(); vibG.gain.value = freq * 0.02;
      vibLFO.connect(vibG); vibG.connect(osc.frequency); vibLFO.start(t); vibLFO.stop(t + noteDur + 0.01);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.07, t + 0.01);
      env.gain.setValueAtTime(0.07, t + noteDur - 0.01);
      env.gain.linearRampToValueAtTime(0, t + noteDur);
      osc.connect(env); env.connect(out);
      osc.start(t); osc.stop(t + noteDur + 0.02);
      t += noteDur + gap;
    });
    const nextBird = 0.5 + Math.random() * 2.5;
    setTimeout(singBird, nextBird * 1000);
  };
  // Запускаем 2-4 птицы с разными задержками
  const count = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    setTimeout(singBird, i * (800 + Math.random() * 600));
  }
  return out;
}

// ── Компонент ────────────────────────────────────────────────────────

export default function NaturePlayer() {
  const [active, setActive] = useState<SoundType | null>(null);
  const [volume, setVolume] = useState(0.65);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) ctxRef.current = new Ctx();
    }
    if (ctxRef.current?.state === "suspended") ctxRef.current.resume();
    return ctxRef.current!;
  }, []);

  const stopAll = useCallback(() => {
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.4);
    }
  }, []);

  const play = useCallback((id: SoundType) => {
    const ctx = getCtx();
    stopAll();
    setTimeout(() => {
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      masterRef.current = master;
      let node: AudioNode;
      if (id === "forest")  node = createForestSound(ctx);
      else if (id === "rain")    node = createRainSound(ctx);
      else if (id === "stream")  node = createStreamSound(ctx);
      else if (id === "wind")    node = createWindSound(ctx);
      else if (id === "fire")    node = createFireSound(ctx);
      else if (id === "ocean")   node = createOceanSound(ctx);
      else if (id === "thunder") node = createThunderSound(ctx);
      else                       node = createBirdsSound(ctx);
      node.connect(master);
      master.gain.setTargetAtTime(volume, ctx.currentTime, 0.6);
    }, active ? 500 : 0);
  }, [volume, stopAll, active, getCtx]);

  const toggle = (id: SoundType) => {
    if (active === id) { stopAll(); setActive(null); }
    else { play(id); setActive(id); }
  };

  useEffect(() => {
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(volume, ctxRef.current.currentTime, 0.15);
    }
  }, [volume]);

  useEffect(() => () => stopAll(), [stopAll]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-2">
        {SOUNDS.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            style={{
              backgroundColor: active === s.id ? "#f9f0e3" : "#fdf9f4",
              border: active === s.id ? "1px solid #9a7d5c" : "1px solid #f0e0c8",
              transform: active === s.id ? "scale(0.96)" : "scale(1)",
              transition: "all 0.25s ease",
              borderRadius: "12px",
              padding: "10px 6px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "22px" }}>{s.emoji}</span>
            <span style={{ fontFamily: "'Golos Text', sans-serif", fontSize: "11px", color: active === s.id ? "#5e4630" : "#b89d78" }}>
              {s.label}
            </span>
            {active === s.id && (
              <span style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "12px" }}>
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="animate-sound-bar"
                    style={{ width: "2px", height: "10px", backgroundColor: "#b89d78", borderRadius: "1px", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Icon name="Volume1" size={13} style={{ color: "#d9c4a0", flexShrink: 0 } as React.CSSProperties} />
          <input
            type="range" min="0" max="1" step="0.02" value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#9a7d5c", height: "3px" }}
          />
          <Icon name="Volume2" size={13} style={{ color: "#9a7d5c", flexShrink: 0 } as React.CSSProperties} />
        </div>
      )}

      <p style={{ fontFamily: "'Golos Text', sans-serif", fontSize: "11px", color: "#b89d78", textAlign: "center", fontStyle: "italic" }}>
        {active
          ? `${SOUNDS.find(s => s.id === active)?.description} · нажмите снова, чтобы остановить`
          : "Выберите звук природы для медитации или работы"}
      </p>
    </div>
  );
}
