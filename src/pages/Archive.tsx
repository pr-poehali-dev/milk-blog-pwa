import { useState } from "react";
import { blogData } from "@/data/blogData";
import Icon from "@/components/ui/icon";

const DAYS_OF_WEEK = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

export default function Archive() {
  const [selected, setSelected] = useState<number | null>(null);

  const today = new Date();
  const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const start = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const currentWeek = Math.floor(dayOfYear / 7) % 2;
  const todayDataIndex = currentWeek * 7 + todayDayIndex;

  // Показываем только 7 уникальных дней недели (первую или вторую неделю)
  const weekEntries = blogData.slice(currentWeek * 7, currentWeek * 7 + 7);

  return (
    <main className="max-w-2xl mx-auto px-5 pb-24 animate-fade-up">
      <section className="pt-16 pb-10 text-center">
        <div
          className="inline-block mb-4 px-3 py-1 rounded-full border font-sans uppercase"
          style={{ borderColor: "#d9c4a0", color: "#9a7d5c", fontSize: "11px", letterSpacing: "0.1em" }}
        >
          Архив
        </div>
        <h1 className="font-serif text-3xl mb-3" style={{ color: "#3d2d1c" }}>Дни тишины</h1>
        <p className="font-sans text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "#9a7d5c" }}>
          Контент меняется каждую неделю. Нажмите на день — раскроется полный preview.
        </p>
      </section>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((dayName, i) => {
          const day = weekEntries[i] ?? blogData[i];
          const isToday = i === todayDayIndex;
          const isOpen = selected === i;

          return (
            <div
              key={i}
              className="rounded-2xl transition-all duration-300"
              style={{
                border: isOpen ? "1px solid #b89d78" : "1px solid #f0e0c8",
                backgroundColor: isOpen ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)",
              }}
            >
              <button
                onClick={() => setSelected(isOpen ? null : i)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-2xl" style={{ color: "#d9c4a0" }}>{i + 1}</span>
                    <div>
                      <p className="font-serif text-base" style={{ color: "#3d2d1c" }}>{dayName}</p>
                      {isToday && (
                        <span className="font-sans uppercase tracking-widest" style={{ fontSize: "10px", color: "#9a7d5c" }}>
                          сегодня
                        </span>
                      )}
                    </div>
                  </div>
                  <Icon
                    name={isOpen ? "ChevronUp" : "ChevronDown"}
                    size={16}
                    className="transition-transform duration-200"
                    style={{ color: "#d9c4a0" } as React.CSSProperties}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 space-y-5" style={{ borderTop: "1px solid #f0e0c8", paddingTop: "20px" }}>
                  {/* Эфемерида */}
                  <div>
                    <p className="font-sans uppercase tracking-widest mb-2" style={{ fontSize: "10px", color: "#b89d78" }}>Эфемерида</p>
                    <p className="font-serif text-base italic leading-relaxed" style={{ color: "#5e4630", fontWeight: 500 }}>
                      {day.ephemeris}
                    </p>
                  </div>

                  {/* История */}
                  <div>
                    <p className="font-sans uppercase tracking-widest mb-2" style={{ fontSize: "10px", color: "#b89d78" }}>Тихая история</p>
                    <p className="font-sans text-sm leading-relaxed" style={{ color: "#7a5f42" }}>
                      {day.quietStory.text}
                    </p>
                    <p className="font-sans mt-2 italic" style={{ fontSize: "11px", color: "#b89d78" }}>
                      — {day.quietStory.source}
                    </p>
                  </div>

                  {/* Цитата */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: "#fdf9f4", border: "1px solid #f0e0c8" }}>
                    <p className="font-sans uppercase tracking-widest mb-2" style={{ fontSize: "10px", color: "#b89d78" }}>Цитата дня</p>
                    <p className="font-serif text-base italic leading-relaxed" style={{ color: "#5e4630" }}>
                      «{day.literaryQuote.text}»
                    </p>
                    <p className="font-sans mt-1" style={{ fontSize: "12px", color: "#b89d78" }}>
                      — {day.literaryQuote.author} · {day.literaryQuote.work}
                    </p>
                  </div>

                  {/* Рецепт */}
                  <div>
                    <p className="font-sans uppercase tracking-widest mb-1" style={{ fontSize: "10px", color: "#b89d78" }}>Рецепт тепла</p>
                    <p className="font-serif text-base italic" style={{ color: "#3d2d1c" }}>{day.warmRecipe.name}</p>
                    <p className="font-sans text-sm leading-relaxed mt-1" style={{ color: "#7a5f42" }}>
                      {day.warmRecipe.intro}
                    </p>
                  </div>

                  {/* Три вопроса */}
                  <div>
                    <p className="font-sans uppercase tracking-widest mb-3" style={{ fontSize: "10px", color: "#b89d78" }}>Три вопроса</p>
                    <div className="space-y-2">
                      {day.threeQuestions.map((q, qi) => (
                        <div key={qi} className="flex gap-3 items-start">
                          <span className="font-serif" style={{ color: "#d9c4a0", fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>
                            {["I", "II", "III"][qi]}
                          </span>
                          <p className="font-serif text-sm italic leading-relaxed" style={{ color: "#7a5f42", paddingTop: "2px" }}>{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center font-sans italic mt-10" style={{ fontSize: "12px", color: "#b89d78" }}>
        Контент чередуется каждую неделю ✦ Сейчас неделя {currentWeek + 1} из 2
      </p>
    </main>
  );
}
