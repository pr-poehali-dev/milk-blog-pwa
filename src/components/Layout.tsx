import { useState } from "react";
import Icon from "@/components/ui/icon";
import { getTodayData, getFormattedDate } from "@/data/blogData";

type Page = "home" | "about" | "archive";

interface LayoutProps {
  page: Page;
  onNavigate: (p: Page) => void;
  children: React.ReactNode;
}

export default function Layout({ page, onNavigate, children }: LayoutProps) {
  const data = getTodayData();
  const date = getFormattedDate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { id: Page; label: string }[] = [
    { id: "home", label: "Главная" },
    { id: "about", label: "О блоге" },
    { id: "archive", label: "Архив" },
  ];

  return (
    <div className="min-h-screen milk-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-milk-200/60">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate("home")}
            className="flex flex-col leading-none"
          >
            <span className="font-serif text-xl text-milk-800 tracking-tight">Молочный Блог</span>
            <span className="font-sans text-xs text-milk-400 tracking-wide">
              {data?.dayName ?? ""} · {date}
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-1.5 rounded-full font-sans text-sm transition-all duration-200 ${
                  page === item.id
                    ? "bg-milk-800 text-milk-50"
                    : "text-milk-500 hover:text-milk-800 hover:bg-milk-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden text-milk-500"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-milk-100 bg-white/90 px-5 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-xl font-sans text-sm transition-all duration-200 ${
                  page === item.id
                    ? "bg-milk-800 text-milk-50"
                    : "text-milk-600 hover:bg-milk-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Subtitle strip */}
      {page === "home" && (
        <div className="text-center py-5 border-b border-milk-100/60">
          <p className="font-sans text-xs tracking-widest text-milk-400 uppercase">
            Ваш тихий оазис утренней гармонии
          </p>
        </div>
      )}

      {/* Content */}
      {children}

      {/* Footer */}
      <footer className="border-t border-milk-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-5 py-8 text-center">
          <p className="font-serif text-milk-400 italic text-sm mb-2">
            «Самое важное — уметь останавливаться.»
          </p>
          <p className="font-sans text-xs text-milk-300 tracking-widest uppercase mb-4">
            Молочный Блог · {new Date().getFullYear()}
          </p>
          <div className="flex justify-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="font-sans text-xs text-milk-400 hover:text-milk-600 px-3 py-1 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
