import { User } from "lucide-react";

const AuthorizationScreen = () => {
  return (
    <div className="splash gap-5">
      <User size={80} className="animate-pulse" />
      <h1 className="text-3xl">Pixegotchi</h1>
      <p className="text-xl">Login...</p>
    </div>
  );
};

export default AuthorizationScreen;
