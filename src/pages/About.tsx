import Icon from "@/components/ui/icon";

export default function About() {
  return (
    <main className="max-w-2xl mx-auto px-5 pb-24 animate-fade-up">
      <section className="pt-16 pb-10 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full border border-milk-300 text-xs tracking-widest text-milk-500 font-sans uppercase">
          О блоге
        </div>
        <h1 className="font-serif text-3xl text-milk-800 mb-4">Откуда всё это?</h1>
        <p className="font-serif text-lg text-milk-600 italic max-w-md mx-auto leading-relaxed">
          «Молочный блог» — не новостное издание и не личный дневник. Это тихое место в интернете.
        </p>
      </section>

      <div className="space-y-6">
        <InfoBlock icon="Sun" title="Идея">
          <p className="font-sans text-base text-milk-700 leading-relaxed">
            Каждый день мы получаем тонны информации. Тревожной, срочной, громкой. «Молочный блог» — это
            намеренная альтернатива: место, где каждое утро вас ждёт что-то спокойное, красивое и ненужное
            в самом хорошем смысле этого слова.
          </p>
        </InfoBlock>

        <InfoBlock icon="RefreshCw" title="Как это работает">
          <p className="font-sans text-base text-milk-700 leading-relaxed">
            Каждый день недели — свой набор текстов. Они меняются автоматически, ориентируясь на ваш
            часовой пояс. Никаких алгоритмов, никакой персонализации — один и тот же контент для всех,
            кто открыл блог в этот день. Как утренняя газета, только тихая.
          </p>
        </InfoBlock>

        <InfoBlock icon="Wifi" title="Офлайн-режим">
          <p className="font-sans text-base text-milk-700 leading-relaxed">
            Сайт работает без интернета. После первого посещения браузер запоминает все страницы, и вы
            можете читать блог даже в самолёте, в метро или на даче без связи. Установите его на экран
            телефона — он откроется как приложение.
          </p>
        </InfoBlock>

        <InfoBlock icon="Shield" title="Принципы">
          <ul className="space-y-3">
            {[
              "Никакой рекламы — никогда",
              "Никаких уведомлений и подписок",
              "Никаких данных о вас — мы их не собираем",
              "Только спокойный, проверенный контент",
              "Открытость — блог доступен всем",
            ].map((p, i) => (
              <li key={i} className="flex gap-3 items-start font-sans text-sm text-milk-700">
                <span className="text-milk-300 mt-0.5">✦</span>
                {p}
              </li>
            ))}
          </ul>
        </InfoBlock>

        <InfoBlock icon="Feather" title="Откуда берётся контент">
          <p className="font-sans text-base text-milk-700 leading-relaxed">
            Истории — из достоверных биографических источников и дневников. Цитаты — из классической
            литературы. Рецепты — проверенные, простые. Природные заметки — написаны с любовью к деталям.
            Ничего не выдумано, ничего не преувеличено.
          </p>
        </InfoBlock>
      </div>

      <div className="mt-12 text-center">
        <p className="font-serif text-lg text-milk-500 italic">
          «Самое радикальное, что вы можете сделать — это замедлиться.»
        </p>
        <p className="font-sans text-xs text-milk-400 mt-2">— Карл Оноре, «Похвала медлительности»</p>
      </div>
    </main>
  );
}

function InfoBlock({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-milk-200/80 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon name={icon} fallback="Circle" size={16} className="text-milk-400" />
        <h2 className="text-xs uppercase tracking-widest text-milk-400 font-sans">{title}</h2>
      </div>
      {children}
    </div>
  );
}
