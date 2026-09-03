import React from "react";
import {
  Bot,
  Heart,
  ShoppingBag,
  Timer as TimerIcon,
  Repeat,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import "./NavbarHeader.css";

interface NavbarHeaderProps {
  activeTab: "agent" | "favorites" | "shopping" | "substitutions";
  setActiveTab: (
    tab: "agent" | "favorites" | "shopping" | "substitutions",
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
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-row">
          <button
            className="navbar-brand"
            onClick={() => setActiveTab("agent")}
            type="button"
          >
            <div className="navbar-logo">
              <img className="navbar-logo-image" src="icon-192.png" alt="" />
            </div>
            <div>
              <div className="navbar-brand-row">
                <span className="navbar-brand-name">CooksALotl AI</span>
                <span className="navbar-badge">
                  <Sparkles className="navbar-badge-icon" /> AI kitchen
                </span>
              </div>
              <p className="navbar-subtitle">Recipes from what you have</p>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="navbar-nav">
            <button
              id="tab-agent"
              onClick={() => setActiveTab("agent")}
              className={`navbar-nav-btn ${
                activeTab === "agent"
                  ? "navbar-nav-btn--active"
                  : "navbar-nav-btn--inactive"
              }`}
            >
              <Bot className="navbar-nav-icon" />
              <span>Cook with AI</span>
            </button>

            <button
              id="tab-favorites"
              onClick={() => setActiveTab("favorites")}
              className={`navbar-nav-btn ${
                activeTab === "favorites"
                  ? "navbar-nav-btn--active"
                  : "navbar-nav-btn--inactive"
              }`}
            >
              <Heart className="navbar-nav-icon" />
              <span>Saved</span>
              {favoritesCount > 0 && (
                <span className="navbar-count-badge navbar-count-badge--rose">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              id="tab-shopping"
              onClick={() => setActiveTab("shopping")}
              className={`navbar-nav-btn ${
                activeTab === "shopping"
                  ? "navbar-nav-btn--active"
                  : "navbar-nav-btn--inactive"
              }`}
            >
              <ShoppingBag className="navbar-nav-icon" />
              <span>Groceries</span>
              {shoppingListCount > 0 && (
                <span className="navbar-count-badge navbar-count-badge--emerald">
                  {shoppingListCount}
                </span>
              )}
            </button>

            <button
              id="tab-substitutions"
              onClick={() => setActiveTab("substitutions")}
              className={`navbar-nav-btn ${
                activeTab === "substitutions"
                  ? "navbar-nav-btn--active"
                  : "navbar-nav-btn--inactive"
              }`}
            >
              <Repeat className="navbar-nav-icon" />
              <span>Swaps</span>
            </button>
          </nav>

          {/* Action Buttons: Timers & Theme */}
          <div className="navbar-actions">
            <button
              id="btn-open-timers"
              onClick={onOpenTimers}
              className={`navbar-timer-btn ${
                activeTimersCount > 0
                  ? "navbar-timer-btn--active"
                  : "navbar-timer-btn--inactive"
              }`}
              title="Active Timers"
            >
              <TimerIcon
                className={`navbar-timer-icon ${
                  activeTimersCount > 0
                    ? "navbar-timer-icon--active"
                    : "navbar-timer-icon--inactive"
                }`}
              />
              <span className="navbar-timer-label">Timers</span>
              {activeTimersCount > 0 && (
                <span className="navbar-timer-count">{activeTimersCount}</span>
              )}
            </button>

            <button
              id="btn-toggle-theme"
              onClick={() => setDarkMode((prev) => !prev)}
              className="navbar-theme-btn"
              title={darkMode ? "Use light theme" : "Use dark theme"}
              aria-label={darkMode ? "Use light theme" : "Use dark theme"}
              type="button"
            >
              {darkMode ? (
                <Sun className="navbar-theme-icon navbar-theme-icon--sun" />
              ) : (
                <Moon className="navbar-theme-icon navbar-theme-icon--moon" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="navbar-mobile-nav">
        <button
          onClick={() => setActiveTab("agent")}
          className={`navbar-mobile-btn ${
            activeTab === "agent"
              ? "navbar-mobile-btn--active"
              : "navbar-mobile-btn--inactive"
          }`}
        >
          <Bot className="navbar-mobile-icon" />
          <span>Cook</span>
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`navbar-mobile-btn ${
            activeTab === "favorites"
              ? "navbar-mobile-btn--active"
              : "navbar-mobile-btn--inactive"
          }`}
        >
          <Heart className="navbar-mobile-icon" />
          <span>Saved ({favoritesCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("shopping")}
          className={`navbar-mobile-btn ${
            activeTab === "shopping"
              ? "navbar-mobile-btn--active"
              : "navbar-mobile-btn--inactive"
          }`}
        >
          <ShoppingBag className="navbar-mobile-icon" />
          <span>Groceries ({shoppingListCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("substitutions")}
          className={`navbar-mobile-btn ${
            activeTab === "substitutions"
              ? "navbar-mobile-btn--active"
              : "navbar-mobile-btn--inactive"
          }`}
        >
          <Repeat className="navbar-mobile-icon" />
          <span>Swaps</span>
        </button>
      </div>
    </header>
  );
};
