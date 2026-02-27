import { Pixegotchi } from "./pixegotchi";
import { PageType } from "../enums";

export interface HomePageProps {
  pixegotchi: Pixegotchi | null;
  onNavigate: (page: PageType) => void;
}
