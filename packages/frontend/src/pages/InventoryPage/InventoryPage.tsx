import ChestComponent from "@/components/Inventory/ChestComponent/ChestComponent";
import ItemComponent from "@/components/Inventory/ItemComponent/ItemComponent";
import { HeartPlus, Gift } from "lucide-react";
import { PageType } from "@shared";
import { useState } from "react";

export interface InventoryPageProps {
  onNavigate?: (page: PageType) => void;
}

type TabType = "items" | "chests";

const TABS: { id: TabType; label: any }[] = [
  {
    id: "items",
    label: (
      <>
        <div className="flex gap-1">
          <HeartPlus height={19} />
          <p>Items</p>
        </div>
      </>
    ),
  },
  {
    id: "chests",
    label: (
      <div className="flex gap-1">
        <Gift height={19} />
        <p>Chests</p>
      </div>
    ),
  },
];

const InventoryPage: React.FC<InventoryPageProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>("items");

  const handleChangeTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>

        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleChangeTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium rounded-t-lg transition-all border border-transparent
                ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white border-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "items" ? <ItemComponent /> : <ChestComponent />}
    </div>
  );
};

export default InventoryPage;
