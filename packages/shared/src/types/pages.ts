import { Pixegotchi } from "./pixegotchi";
import { PageType } from "../enums";

export interface HomePageProps {
  pixegotchi: Pixegotchi | null;
  // setActive: (pixegotchi: Pixegotchi | null) => void;
  onNavigate: (page: PageType, sortBy?: string) => void;
}
