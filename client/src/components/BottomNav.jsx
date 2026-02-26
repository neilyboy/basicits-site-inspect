import { NavLink } from 'react-router-dom';
import { Home, Plus, Sun, Moon, Archive } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

export default function BottomNav() {
  const { dark, toggle } = useDarkMode();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200/80 dark:bg-gray-900/90 dark:border-gray-700/60 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-5 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
            }`
          }
        >
          <Home size={22} />
          <span className="text-[10px] font-semibold tracking-wide">Home</span>
        </NavLink>

        <NavLink
          to="/sites/new"
          className="bg-blue-600 text-white -mt-6 w-14 h-14 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center active:scale-95 transition-all"
        >
          <Plus size={26} />
        </NavLink>

        <NavLink
          to="/archive"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-5 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
            }`
          }
        >
          <Archive size={22} />
          <span className="text-[10px] font-semibold tracking-wide">Archive</span>
        </NavLink>

        <button
          onClick={toggle}
          className="flex flex-col items-center justify-center gap-0.5 px-5 py-1 rounded-xl transition-all text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
        >
          {dark ? <Sun size={22} /> : <Moon size={22} />}
          <span className="text-[10px] font-semibold tracking-wide">{dark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  );
}
