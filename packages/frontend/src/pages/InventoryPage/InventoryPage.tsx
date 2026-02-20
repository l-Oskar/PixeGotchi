import { PageType } from "@shared";

export interface InventoryPageProps {
  onNavigate?: (page: PageType) => void;
}

// Change interface to SHARED!
interface InventoryItem {
  id: number;
  name: string;
  type: "food" | "medicine" | "chest" | "special";
  quantity: number;
  icon: string;
}

// InventoryPage
const InventoryPage: React.FC<InventoryPageProps> = () => {
  const items: InventoryItem[] = [
    { id: 1, name: "Apple", type: "food", quantity: 15, icon: "🍎" },
    { id: 2, name: "Health Potion", type: "medicine", quantity: 3, icon: "💊" },
    { id: 3, name: "Gold Chest", type: "chest", quantity: 2, icon: "📦" },
    { id: 4, name: "Candy", type: "food", quantity: 8, icon: "🍬" },
    { id: 5, name: "Energy Drink", type: "special", quantity: 5, icon: "⚡" },
    { id: 6, name: "Rename Tag", type: "special", quantity: 1, icon: "🏷️" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/10 transition flex flex-col items-center gap-2 group">
            <div className="text-4xl group-hover:scale-110 transition">
              {item.icon}
            </div>
            <div className="text-xs font-medium text-center">{item.name}</div>
            <div className="text-xs text-white/60">×{item.quantity}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InventoryPage;
