import React, { useRef } from "react";

type TabKey = "search" | "custom";

interface TabNavigationProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "search", label: "Search" },
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
      className="flex space-x-1 bg-gray-100 rounded-xl p-1"
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
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium cursor-pointer transition-colors duration-200 ${
            activeTab === tab.key
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
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
