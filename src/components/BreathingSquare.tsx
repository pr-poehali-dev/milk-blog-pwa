import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

type Phase = "inhale" | "hold1" | "exhale" | "hold2";

interface PhaseConfig {
  id: Phase;
  label: string;
  sublabel: string;
  duration: number;
  color: string;
  side: "top" | "right" | "bottom" | "left";
}

const PHASES: PhaseConfig[] = [
  { id: "inhale", label: "Вдох", sublabel: "носом", duration: 4, color: "#d9c4a0", side: "top" },
  { id: "hold1", label: "Задержка", sublabel: "не дышите", duration: 4, color: "#b89d78", side: "right" },
  { id: "exhale", label: "Выдох", sublabel: "медленно", duration: 4, color: "#9a7d5c", side: "bottom" },
  { id: "hold2", label: "Пауза", sublabel: "расслабьтесь", duration: 4, color: "#c8ae8a", side: "left" },
];

function playBowl(ctx: AudioContext, intensity: number = 1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  osc.frequency.value = 432;
  osc2.frequency.value = 432 * 1.005;
  osc.type = "sine";
  osc2.type = "sine";

  const vol = 0.18 * intensity;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.linearRampToValueAtTime(vol * 0.5, ctx.currentTime + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);

  osc.connect(gain);
  osc2.connect(gain2);
  gain.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 4);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 4);
}

export default function BreathingSquare() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(4);
  const [cycle, setCycle] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setPhaseIdx(0);
    setTick(4);
    setCycle(0);
  }, []);

  const start = useCallback(() => {
    const ctx = getCtx();
    playBowl(ctx, 0.8);
    setPhaseIdx(0);
    setTick(4);
    setCycle(0);
    setRunning(true);
  }, [getCtx]);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setTick(prev => {
        if (prev <= 1) {
          setPhaseIdx(pi => {
            const next = (pi + 1) % PHASES.length;
            const ctx = getCtx();
            const intensity = next === 0 ? 1 : 0.55;
            playBowl(ctx, intensity);
            if (next === 0) setCycle(c => c + 1);
            return next;
          });
          return PHASES[(phaseIdx + 1) % PHASES.length].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phaseIdx, getCtx]);

  const phase = PHASES[phaseIdx];
  const progress = running ? ((phase.duration - tick) / phase.duration) : 0;

  const squareSize = 160;
  const r = 12;
  const perim = (squareSize - r * 2) * 4;
  const strokeDash = perim * progress;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* SVG живой квадрат */}
      <div className="relative" style={{ width: squareSize, height: squareSize }}>
        <svg width={squareSize} height={squareSize} className="absolute inset-0">
          {/* Фон */}
          <rect
            x={2} y={2}
            width={squareSize - 4} height={squareSize - 4}
            rx={r} ry={r}
            fill="#fdf9f4"
            stroke="#f0e0c8"
            strokeWidth={1.5}
          />
          {/* Прогресс-трек */}
          <rect
            x={2} y={2}
            width={squareSize - 4} height={squareSize - 4}
            rx={r} ry={r}
            fill="none"
            stroke={running ? phase.color : "#f0e0c8"}
            strokeWidth={3}
            strokeDasharray={`${strokeDash} ${perim}`}
            strokeLinecap="round"
            style={{ transition: "stroke 0.6s ease", pathLength: 1 }}
          />
          {/* Пульсирующий внутренний круг */}
          {running && (
            <circle
              cx={squareSize / 2}
              cy={squareSize / 2}
              r={phase.id === "inhale" ? 32 : phase.id === "exhale" ? 20 : 26}
              fill={phase.color}
              fillOpacity={0.15}
              style={{ transition: "r 1s ease, fill-opacity 1s ease" }}
            />
          )}
        </svg>

        {/* Центральный текст */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {running ? (
            <>
              <span
                className="font-serif leading-none"
                style={{
                  fontSize: "42px",
                  color: phase.color,
                  transition: "color 0.5s ease",
                  fontWeight: 300,
                }}
              >
                {tick}
              </span>
              <span className="font-sans text-xs text-milk-400 mt-0.5">{phase.sublabel}</span>
            </>
          ) : (
            <>
              <span className="font-serif text-3xl text-milk-300" style={{ fontWeight: 300 }}>4·4·4·4</span>
              <span className="font-sans text-xs text-milk-400 mt-1">квадрат</span>
            </>
          )}
        </div>

        {/* Подписи сторон */}
        <div className="absolute -top-6 left-0 right-0 flex justify-center">
          <span className={`font-sans text-xs transition-all duration-500 ${running && phase.side === "top" ? "text-milk-700 font-medium" : "text-milk-300"}`}>
            Вдох
          </span>
        </div>
        <div className="absolute -right-10 top-0 bottom-0 flex items-center">
          <span className={`font-sans text-xs transition-all duration-500 ${running && phase.side === "right" ? "text-milk-700 font-medium" : "text-milk-300"}`}>
            Стоп
          </span>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
          <span className={`font-sans text-xs transition-all duration-500 ${running && phase.side === "bottom" ? "text-milk-700 font-medium" : "text-milk-300"}`}>
            Выдох
          </span>
        </div>
        <div className="absolute -left-10 top-0 bottom-0 flex items-center">
          <span className={`font-sans text-xs transition-all duration-500 ${running && phase.side === "left" ? "text-milk-700 font-medium" : "text-milk-300"}`}>
            Стоп
          </span>
        </div>
      </div>

      {/* Фаза-индикатор */}
      {running && (
        <div className="flex gap-2">
          {PHASES.map((p, i) => (
            <div
              key={p.id}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="w-8 h-1 rounded-full transition-all duration-500"
                style={{ backgroundColor: i === phaseIdx ? p.color : "#f0e0c8" }}
              />
              <span className={`font-sans text-xs transition-colors duration-500 ${i === phaseIdx ? "text-milk-600" : "text-milk-300"}`}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Счётчик циклов */}
      {running && cycle > 0 && (
        <p className="font-sans text-xs text-milk-400">
          Цикл {cycle} из 4 рекомендуемых
        </p>
      )}

      {/* Кнопки */}
      <div className="flex gap-3">
        {!running ? (
          <button
            onClick={start}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-milk-800 text-milk-50 font-sans text-sm transition-all duration-200 hover:bg-milk-700 active:scale-95"
          >
            <Icon name="Play" size={14} />
            Начать дыхание
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-milk-300 text-milk-600 font-sans text-sm transition-all duration-200 hover:border-milk-400 active:scale-95"
          >
            <Icon name="Square" size={14} />
            Остановить
          </button>
        )}
      </div>

      <p className="font-sans text-xs text-milk-400 text-center max-w-xs italic">
        {running
          ? "Тибетская чаша отмечает каждую фазу — дышите вместе с ней"
          : "4 секунды вдох · 4 задержка · 4 выдох · 4 пауза"}
      </p>
    </div>
  );
}
