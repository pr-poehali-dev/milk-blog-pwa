import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

type Phase = "inhale" | "hold1" | "exhale" | "hold2";

const PHASES: { key: Phase; label: string; duration: number; color: string }[] = [
  { key: "inhale", label: "Вдох", duration: 4, color: "#d9c4a0" },
  { key: "hold1", label: "Задержка", duration: 4, color: "#b89d78" },
  { key: "exhale", label: "Выдох", duration: 4, color: "#9a7d5c" },
  { key: "hold2", label: "Задержка", duration: 4, color: "#7a5f42" },
];

function playBowlSound(ctx: AudioContext, intensity = 1) {
  const fundamental = 432;
  const harmonics = [1, 2.756, 5.404, 8.933];
  const gains = [0.6, 0.25, 0.12, 0.06];

  harmonics.forEach((h, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = fundamental * h;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const attack = 0.01;
    const decay = 3.5 + i * 0.8;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gains[i] * intensity, ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decay);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + decay + 0.1);
  });
}

export default function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalCycles] = useState(4);

  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = PHASES[phaseIndex];
  const progress = tick / currentPhase.duration;

  const getAudioCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const ringBowl = useCallback(
    (intensity = 1) => {
      const ctx = getAudioCtx();
      playBowlSound(ctx, intensity);
    },
    [getAudioCtx]
  );

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setPhaseIndex(0);
    setTick(0);
    setCycles(0);
  }, []);

  useEffect(() => {
    if (!running) return;

    ringBowl(0.8);

    intervalRef.current = setInterval(() => {
      setTick((prev) => {
        const next = prev + 1;
        if (next >= PHASES[phaseIndex].duration) {
          // Move to next phase
          const nextPhase = (phaseIndex + 1) % PHASES.length;
          setPhaseIndex(nextPhase);

          if (nextPhase === 0) {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            if (newCycles >= totalCycles) {
              setTimeout(() => {
                ringBowl(1.2);
                stop();
              }, 100);
            } else {
              setTimeout(() => ringBowl(0.6), 50);
            }
          } else {
            setTimeout(() => ringBowl(0.5), 50);
          }

          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIndex]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ctxRef.current?.close();
    };
  }, []);

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const circumference = 2 * Math.PI * r;
  const strokeDash = circumference * (1 - progress);

  // Square animation: which side is "active"
  const squareSide = phaseIndex; // 0=top, 1=right, 2=bottom, 3=left

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-sans text-sm text-milk-500 italic text-center max-w-xs">
        Дыхание по квадрату 4-4-4-4. Тибетская чаша отмечает каждый переход.
      </p>

      {/* Main visual */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* BG circle */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f0e0c8"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={currentPhase.color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.4s ease" }}
          />
        </svg>

        {/* Center content */}
        <div className="relative z-10 text-center">
          {running ? (
            <>
              <p
                className="font-serif text-4xl leading-none"
                style={{ color: currentPhase.color }}
              >
                {currentPhase.duration - tick}
              </p>
              <p className="font-sans text-xs uppercase tracking-widest text-milk-400 mt-1">
                {currentPhase.label}
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-2xl text-milk-300">4·4·4·4</p>
              <p className="font-sans text-xs text-milk-400 mt-1">квадрат</p>
            </>
          )}
        </div>

        {/* Pulsing outer ring when running */}
        {running && (
          <div
            className="absolute inset-0 rounded-full border-2 opacity-30"
            style={{
              borderColor: currentPhase.color,
              animation: "breathePulse 1s ease-in-out infinite alternate",
            }}
          />
        )}
      </div>

      {/* Square phase indicators */}
      <div className="relative w-36 h-36">
        {/* Square border */}
        <div className="absolute inset-0 rounded-xl border-2 border-milk-200" />

        {/* Active side highlight */}
        {running && (
          <>
            {squareSide === 0 && (
              <div className="absolute top-0 left-2 right-2 h-0.5 rounded-full transition-all duration-500" style={{ background: currentPhase.color }} />
            )}
            {squareSide === 1 && (
              <div className="absolute right-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-500" style={{ background: currentPhase.color }} />
            )}
            {squareSide === 2 && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all duration-500" style={{ background: currentPhase.color }} />
            )}
            {squareSide === 3 && (
              <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-500" style={{ background: currentPhase.color }} />
            )}
          </>
        )}

        {/* Labels */}
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-milk-400 font-sans whitespace-nowrap">Вдох</span>
        <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-xs text-milk-400 font-sans">Стоп</span>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-milk-400 font-sans whitespace-nowrap">Выдох</span>
        <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-milk-400 font-sans">Стоп</span>

        {/* Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          {running && (
            <div className="text-center">
              <p className="font-sans text-xs text-milk-400">{cycles + 1}/{totalCycles}</p>
            </div>
          )}
        </div>
      </div>

      {/* Phases strip */}
      <div className="flex gap-2">
        {PHASES.map((p, i) => (
          <div
            key={p.key}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-sans transition-all duration-300"
              style={{
                background: running && i === phaseIndex ? p.color : "var(--milk-100)",
                color: running && i === phaseIndex ? "#fdf9f4" : "var(--milk-400)",
                transform: running && i === phaseIndex ? "scale(1.1)" : "scale(1)",
              }}
            >
              {p.duration}
            </div>
            <span className="text-[10px] text-milk-400 font-sans">{p.label}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        onClick={() => {
          if (running) {
            stop();
          } else {
            setPhaseIndex(0);
            setTick(0);
            setCycles(0);
            setRunning(true);
          }
        }}
        className={`flex items-center gap-2 px-8 py-3 rounded-full font-sans text-sm transition-all duration-300 ${
          running
            ? "bg-milk-200 text-milk-700 hover:bg-milk-300"
            : "bg-milk-800 text-milk-50 hover:bg-milk-700"
        }`}
      >
        <Icon name={running ? "Square" : "Play"} size={14} />
        {running ? "Остановить" : "Начать дыхание"}
      </button>

      <p className="font-sans text-xs text-milk-400 text-center">
        Звук тибетской чаши на каждом переходе · {totalCycles} цикла
      </p>

      <style>{`
        @keyframes breathePulse {
          from { transform: scale(0.97); opacity: 0.2; }
          to { transform: scale(1.04); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
