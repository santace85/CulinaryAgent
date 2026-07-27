import React from "react";
import {
  Bot,
  Heart,
  ShoppingBag,
  Timer as TimerIcon,
  Repeat,
  Users,
  Sparkles,
  UtensilsCrossed,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarHeaderProps {
  activeTab: "agent" | "favorites" | "shopping" | "substitutions" | "community";
  setActiveTab: (
    tab: "agent" | "favorites" | "shopping" | "substitutions" | "community",
  ) => void;
  favoritesCount: number;
  shoppingListCount: number;
  activeTimersCount: number;
  onOpenTimers: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  shoppingListCount,
  activeTimersCount,
  onOpenTimers,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/90 border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Hybrid Agent Badge */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab("agent")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400 bg-clip-text text-transparent">
                  CulinaryAgent
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Interactive Recipe & Precision Culinary Suite
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-agent"
              onClick={() => setActiveTab("agent")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "agent"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Agent</span>
            </button>

            <button
              id="tab-favorites"
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "favorites"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Saved Recipes</span>
              {favoritesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              id="tab-shopping"
              onClick={() => setActiveTab("shopping")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "shopping"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shopping List</span>
              {shoppingListCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  {shoppingListCount}
                </span>
              )}
            </button>

            <button
              id="tab-substitutions"
              onClick={() => setActiveTab("substitutions")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "substitutions"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>Substitutions</span>
            </button>

            {/* <button
              id="tab-community"
              onClick={() => setActiveTab("community")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "community"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Social Creations</span>
            </button> */}
          </nav>

          {/* Action Buttons: Timers & Theme */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-open-timers"
              onClick={onOpenTimers}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                activeTimersCount > 0
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
              title="Active Timers"
            >
              <TimerIcon
                className={`w-4 h-4 ${activeTimersCount > 0 ? "text-amber-400" : "text-slate-400"}`}
              />
              <span className="hidden sm:inline">Timers</span>
              {activeTimersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                  {activeTimersCount}
                </span>
              )}
            </button>

            <button
              id="btn-toggle-theme"
              onClick={() => setDarkMode((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 py-2 px-2">
        <button
          onClick={() => setActiveTab("agent")}
          className={`flex flex-col items-center text-[10px] font-medium ${
            activeTab === "agent" ? "text-orange-400" : "text-slate-400"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Agent</span>
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex flex-col items-center text-[10px] font-medium ${
            activeTab === "favorites" ? "text-orange-400" : "text-slate-400"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved ({favoritesCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("shopping")}
          className={`flex flex-col items-center text-[10px] font-medium ${
            activeTab === "shopping" ? "text-orange-400" : "text-slate-400"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Grocery ({shoppingListCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("substitutions")}
          className={`flex flex-col items-center text-[10px] font-medium ${
            activeTab === "substitutions" ? "text-orange-400" : "text-slate-400"
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Substitutes</span>
        </button>
        <button
          onClick={() => setActiveTab("community")}
          className={`flex flex-col items-center text-[10px] font-medium ${
            activeTab === "community" ? "text-orange-400" : "text-slate-400"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Feed</span>
        </button>
      </div>
    </header>
  );
};
