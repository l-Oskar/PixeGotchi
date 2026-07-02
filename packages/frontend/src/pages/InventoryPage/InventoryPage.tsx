import ChestComponent from "@/components/Inventory/ChestComponent/ChestComponent";
import ItemComponent from "@/components/Inventory/ItemComponent/ItemComponent";
import { HeartPlus, Gift } from "lucide-react";
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

  const handleChangeTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-3 p-3">
      <div className="pixel-panel p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h1 className="font-pixel text-sm leading-5 text-pixel-ink">
            Inventory
          </h1>

          <div className="pixel-panel-soft grid grid-cols-2 gap-1 p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleChangeTab(tab.id)}
                  className={`flex min-h-8 items-center justify-center gap-1.5 rounded-sm border-2 px-2 py-1 font-pixel text-[8px] leading-3 transition ${
                    activeTab === tab.id
                      ? "border-pixel-highlight bg-pixel-highlight/15 text-pixel-highlight"
                      : "border-transparent text-pixel-muted hover:border-pixel-border hover:text-pixel-ink"
                  }`}>
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeTab === "items" ? (
        <ItemComponent sorted={initialSort} />
      ) : (
        <ChestComponent />
      )}
    </div>
  );
};

export default InventoryPage;
