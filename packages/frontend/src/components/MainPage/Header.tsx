import React from "react";
import { Link } from "@/components/Link/Link.tsx";
import { User } from "@shared";
import { Sparkles, Wallet, Coins } from "lucide-react";

export interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <span className="font-bold text-lg">
            {user?.username || "Unknown"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
            <Coins size={16} className="text-yellow-400" />
            <span className="font-semibold text-sm">
              {user?.pgcBalance || "0"}
            </span>
          </div>
          <Link to="/ton-connect">
            <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
              <Wallet size={16} />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
