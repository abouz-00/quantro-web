import React, { useRef } from "react";

type TabKey = "search" | "favorites" | "custom";

interface TabNavigationProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "search", label: "Search" },
  { key: "favorites", label: "Favorites" },
  { key: "custom", label: "Custom" },
];

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard navigation: left/right arrow keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((tab) => tab.key === activeTab);
    if (e.key === "ArrowRight") {
      const nextIdx = (idx + 1) % tabs.length;
      setActiveTab(tabs[nextIdx].key);
      buttonRefs.current[nextIdx]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      const prevIdx = (idx - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIdx].key);
      buttonRefs.current[prevIdx]?.focus();
      e.preventDefault();
    }
  };

  return (
    <div
      className="flex space-x-1 bg-gray-100 rounded-sm p-1"
      role="tablist"
      aria-label="Food search tabs"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.key}
          ref={el => {
            buttonRefs.current[i] = el;
          }}
          onClick={() => setActiveTab(tab.key)}
          className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium cursor-pointer transition-colors duration-200 ${
            activeTab === tab.key
              ? "bg-white text-violet-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
          role="tab"
          aria-selected={activeTab === tab.key}
          aria-controls={`tabpanel-${tab.key}`}
          tabIndex={activeTab === tab.key ? 0 : -1}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
