import { User } from "lucide-react";
import LoadingScreenFrame from "./LoadingScreenFrame";

const AuthorizationScreen = () => {
  return (
    <LoadingScreenFrame>
      <div className="mb-6 animate-pulse text-pixel-highlight">
        <User size={80} />
      </div>
      <h1 className="font-pixel text-sm leading-5">Pixegotchi</h1>
      <p className="mt-2 animate-pulse font-pixel text-[10px] leading-4 text-pixel-muted">
        Login...
      </p>
    </LoadingScreenFrame>
  );
};

export default AuthorizationScreen;
