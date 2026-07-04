import ChestComponent from "@/components/Inventory/ChestComponent/ChestComponent";
import ItemComponent from "@/components/Inventory/ItemComponent/ItemComponent";
import { HeartPlus, Gift, Search, Funnel } from "lucide-react";
import { PageType } from "@pixegotchi/shared";
import { useState } from "react";

export interface InventoryPageProps {
  initialSort?: string;
  onNavigate?: (page: PageType) => void;
}

type TabType = "items" | "chests";

const TABS: { id: TabType; icon: typeof HeartPlus; label: string }[] = [
  {
    id: "items",
    icon: HeartPlus,
    label: "Items",
  },
  {
    id: "chests",
    icon: Gift,
    label: "Chests",
  },
];

const InventoryPage: React.FC<InventoryPageProps> = ({ initialSort }) => {
  const [activeTab, setActiveTab] = useState<TabType>("items");
  const [showSortedPanel, setShowSortedPanel] = useState<boolean>(true);
  const [searchText, setSearchText] = useState("");

  const handleChangeTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-2.5 p-2.5">
      <div className="pixel-panel p-2.5">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h1 className="font-pixel text-sm leading-5 text-pixel-ink">Items</h1>
        </div>

        <div className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="pixel-panel-soft grid grid-cols-2 gap-1 p-1 sm:min-w-48">
            {TABS.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleChangeTab(tab.id)}
                  className={`flex min-h-7 items-center justify-center gap-1.5 rounded-sm border-2 px-2 py-1 font-pixel text-[7px] leading-3 transition ${
                    activeTab === tab.id
                      ? "border-pixel-highlight bg-pixel-highlight/15 text-pixel-highlight"
                      : "border-transparent text-pixel-muted hover:border-pixel-border hover:text-pixel-ink"
                  }`}>
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === "items" && (
            <div className="grid min-w-0 grid-cols-[1fr_auto] gap-2">
              <label className="pixel-panel-soft flex min-h-9 min-w-0 items-center gap-2 px-2.5 py-1.5">
                <Search size={15} className="shrink-0 text-pixel-muted" />
                <input
                  aria-label={`Search ${activeTab}`}
                  className="min-w-0 flex-1 bg-transparent font-pixel text-[9px] leading-4 text-pixel-ink outline-none placeholder:text-pixel-muted"
                  placeholder={`Search ${activeTab}...`}
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </label>

              <button
                onClick={() => setShowSortedPanel(!showSortedPanel)}
                className="pixel-icon-button h-9 min-h-9 w-9 min-w-9 text-pixel-ink"
                type="button"
                aria-label="Filter items">
                <Funnel size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === "items" ? (
        <ItemComponent
          sorted={initialSort}
          searchQuery={searchText}
          showSortedPanel={showSortedPanel}
        />
      ) : (
        <ChestComponent searchQuery={searchText} />
      )}
    </div>
  );
};

export default InventoryPage;
