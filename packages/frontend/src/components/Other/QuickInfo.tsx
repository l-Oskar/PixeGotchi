import { useVaultStore } from "@/store/vault.store";
import { User } from "@pixegotchi/shared";
import { useUserStore } from "@/store/user.store";

const QuickInfo = () => {
  const vault = useVaultStore((s) => s.allVault);
  const user = useUserStore((s) => s.user);

  const userAge = (user: User) => {
    if (!user) return "0";

    const dateNow = Date.now();
    const createdAt = Date.parse(`${user.createdAt!}`);
    const timeSince = Math.floor((dateNow - createdAt) / 1000 / 86400);
    return timeSince;
  };
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
      <h3 className="text-sm font-semibold mb-3 text-white/80">Quick Info</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            🎮
          </div>
          <div>
            <div className="text-white/60 text-xs">Have Pixegotchis</div>
            <div className="font-semibold">{vault ? vault.length : "?"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            ⏱️
          </div>
          <div>
            <div className="text-white/60 text-xs">Age</div>
            <div className="font-semibold">{userAge(user!)} days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickInfo;
