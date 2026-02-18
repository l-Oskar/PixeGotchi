import React from "react";
import { PageType } from "@/pages/MainPage/mainPageTypes";

export interface EggPageProps {
  onNavigate?: (page: PageType) => void;
}

const EggComponents: React.FC<EggPageProps> = () => {
  return <div>EggComponents</div>;
};

export default EggComponents;
