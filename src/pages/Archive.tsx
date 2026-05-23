import { useState } from "react";
import { blogData } from "@/data/blogData";
import Icon from "@/components/ui/icon";

export default function Archive() {
  const [selected, setSelected] = useState<number | null>(null);

  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  return (
    <main className="max-w-2xl mx-auto px-5 pb-24 animate-fade-up">
      <section className="pt-16 pb-10 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full border border-milk-300 text-xs tracking-widest text-milk-500 font-sans uppercase">
          Архив
        </div>
        <h1 className="font-serif text-3xl text-milk-800 mb-3">Семь дней тишины</h1>
        <p className="font-sans text-sm text-milk-500 max-w-xs mx-auto leading-relaxed">
          Каждый день недели — своё настроение. Выберите любой, чтобы заглянуть.
        </p>
      </section>

      <div className="space-y-3">
        {blogData.map((day, i) => (
          <button
            key={i}
            onClick={() => setSelected(selected === i ? null : i)}
            className="w-full text-left"
          >
            <div
              className={`rounded-2xl border transition-all duration-300 ${
                selected === i
                  ? "border-milk-400 bg-white/80 shadow-md"
                  : "border-milk-200 bg-white/40 hover:bg-white/60 hover:border-milk-300"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <span className="font-serif text-2xl text-milk-300">{i + 1}</span>
                  <div>
                    <p className="font-serif text-base text-milk-800">{day.dayName}</p>
                    {todayIndex === i && (
                      <span className="text-xs font-sans text-milk-400 uppercase tracking-widest">
                        сегодня
                      </span>
                    )}
                  </div>
                </div>
                <Icon
                  name={selected === i ? "ChevronUp" : "ChevronDown"}
                  size={16}
                  className="text-milk-300 transition-transform duration-200"
                />
              </div>

              {selected === i && (
                <div className="px-6 pb-6 space-y-4 border-t border-milk-100 pt-5">
                  <Preview label="Эфемерида" text={day.ephemeris} />
                  <Preview label="История" text={day.quietStory.text} />
                  <div className="bg-milk-50 rounded-xl p-4 border border-milk-100">
                    <p className="text-xs text-milk-400 uppercase tracking-widest mb-2">Цитата дня</p>
                    <p className="font-serif text-base italic text-milk-700">
                      «{day.literaryQuote.text}»
                    </p>
                    <p className="font-sans text-xs text-milk-400 mt-1">
                      — {day.literaryQuote.author}
                    </p>
                  </div>
                  <Preview label="Рецепт тепла" text={day.warmRecipe.name + " — " + day.warmRecipe.intro} />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="text-center font-sans text-xs text-milk-400 mt-10 italic">
        Контент обновляется каждый день автоматически ✦
      </p>
    </main>
  );
}

function Preview({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs text-milk-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-sans text-sm text-milk-700 leading-relaxed line-clamp-3">{text}</p>
    </div>
  );
}
