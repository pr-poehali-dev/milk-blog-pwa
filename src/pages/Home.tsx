import { getTodayData, getFormattedDate } from "@/data/blogData";
import Icon from "@/components/ui/icon";
import NaturePlayer from "@/components/NaturePlayer";
import BreathingSquareComponent from "@/components/BreathingSquare";

const FALLBACK = "Сегодняшний рецепт тишины ещё томится на медленном огне...";

export default function Home() {
  const data = getTodayData();
  const date = getFormattedDate();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif text-xl text-milk-700 italic">{FALLBACK}</p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-5 pb-24 animate-fade-up">

      {/* Hero */}
      <section className="pt-16 pb-10 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full border border-milk-300 text-xs tracking-widest text-milk-500 font-sans uppercase">
          {data.dayName} · {date}
        </div>
        <p className="font-serif text-xl leading-relaxed text-milk-700 max-w-md mx-auto italic" style={{ fontWeight: 500 }}>
          {data.ephemeris}
        </p>
      </section>

      <Divider />

      {/* Тихая история */}
      <Card icon="BookOpen" label={data.quietStory.title}>
        <p className="font-sans text-base leading-relaxed text-milk-800">
          {data.quietStory.text}
        </p>
        <p className="mt-4 text-xs text-milk-400 font-sans italic">
          — {data.quietStory.source}
        </p>
      </Card>

      {/* Литературная классика */}
      <Card icon="Quote" label="Литературная классика дня">
        <blockquote className="font-serif text-xl leading-relaxed text-milk-800 italic border-l-2 border-milk-300 pl-5">
          «{data.literaryQuote.text}»
        </blockquote>
        <p className="mt-3 text-sm text-milk-500 font-sans">
          {data.literaryQuote.author} · <span className="italic">{data.literaryQuote.work}</span>
        </p>
      </Card>

      {/* Космическая погода */}
      <Card icon="Star" label="Космическая погода">
        <p className="font-sans text-sm uppercase tracking-widest text-milk-400 mb-2">
          Статус небесных тел
        </p>
        <p className="font-sans text-base leading-relaxed text-milk-800 mb-4">
          {data.cosmicWeather.status}
        </p>
        <div className="bg-milk-50 rounded-xl p-4 border border-milk-200">
          <p className="text-xs text-milk-400 uppercase tracking-widest mb-1">Астрономический юмор</p>
          <p className="font-sans text-sm leading-relaxed text-milk-700 italic">
            {data.cosmicWeather.humor}
          </p>
        </div>
      </Card>

      {/* Миролюбивые события */}
      <Card icon="Leaf" label="Миролюбивые события">
        <div className="space-y-4">
          {data.peacefulNews.map((n, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-milk-200 flex items-center justify-center flex-shrink-0">
                <span className="text-milk-500 text-xs font-sans">{i + 1}</span>
              </div>
              <div>
                <p className="font-sans font-medium text-milk-800 text-sm mb-0.5">{n.headline}</p>
                <p className="font-sans text-sm text-milk-600 leading-relaxed">{n.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Лёгкость нервной системы */}
      <Card icon="Wind" label="Лёгкость нервной системы">
        <p className="font-sans font-medium text-milk-800 mb-1">{data.nervousSystem.title}</p>
        <p className="font-sans text-sm text-milk-500 italic mb-4">{data.nervousSystem.description}</p>
        <ol className="space-y-2">
          {data.nervousSystem.steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="font-serif text-milk-300 text-lg leading-none mt-0.5">{i + 1}.</span>
              <span className="font-sans text-sm text-milk-700 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Флора и Фауна */}
      <Card icon="Flower2" label="Флора и Фауна">
        <p className="font-serif text-lg text-milk-700 mb-3 italic">{data.floraFauna.name}</p>
        <p className="font-sans text-base leading-relaxed text-milk-800">
          {data.floraFauna.text}
        </p>
      </Card>

      {/* День в Календаре */}
      <Card icon="Calendar" label="День в Календаре">
        <p className="font-sans font-medium text-milk-800 mb-2">{data.calendarDay.title}</p>
        <p className="font-sans text-sm leading-relaxed text-milk-700">{data.calendarDay.text}</p>
      </Card>

      {/* Рецепт тепла */}
      <Card icon="Coffee" label="Рецепт тепла">
        <p className="font-serif text-xl text-milk-800 italic mb-1">{data.warmRecipe.name}</p>
        <p className="font-sans text-sm text-milk-500 italic mb-5">{data.warmRecipe.intro}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-milk-400 mb-2">Вам понадобится</p>
            <ul className="space-y-1.5">
              {data.warmRecipe.ingredients.map((ing, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="text-milk-300 mt-0.5">·</span>
                  <span className="font-sans text-sm text-milk-700">{ing}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-milk-400 mb-2">Приготовление</p>
            <ol className="space-y-1.5">
              {data.warmRecipe.steps.map((step, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="font-serif text-milk-300 text-sm mt-0.5">{i + 1}.</span>
                  <span className="font-sans text-sm text-milk-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>

      {/* Звуки природы */}
      <Card icon="Music" label="Звуки природы">
        <p className="font-sans text-sm text-milk-500 italic mb-5">
          Включите фоновый звук для медитации или работы. Генерируется прямо в браузере, без загрузки файлов.
        </p>
        <NaturePlayer />
      </Card>

      {/* Дыхательный покой */}
      <Card icon="Heart" label="Дыхательный Покой">
        <p className="font-sans text-sm text-milk-500 italic mb-6">
          Дыхание по квадрату 4-4-4-4 — один из самых изученных методов снижения тревоги. Тибетская чаша отмечает каждую фазу.
        </p>
        <BreathingSquareComponent />
      </Card>

      {/* Три вопроса */}
      <Card icon="HelpCircle" label="Три вопроса к себе">
        <div className="space-y-5">
          {data.threeQuestions.map((q, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="font-serif text-3xl text-milk-200 leading-none flex-shrink-0">
                {["I", "II", "III"][i]}
              </span>
              <p className="font-serif text-base text-milk-700 italic leading-relaxed pt-1">{q}</p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-milk-200" />
      <span className="text-milk-300 text-lg">✦</span>
      <div className="flex-1 h-px bg-milk-200" />
    </div>
  );
}

function Card({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="my-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-milk-200/80 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-5">
        <Icon name={icon} fallback="Circle" size={16} className="text-milk-400" />
        <h2 className="text-xs uppercase tracking-widest text-milk-400 font-sans">{label}</h2>
      </div>
      {children}
    </section>
  );
}

