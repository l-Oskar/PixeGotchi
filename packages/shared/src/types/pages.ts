import { Pixegotchi } from "./pixegotchi";
import { PageType } from "../enums";

export interface HomePageProps {
  tama: Pixegotchi | null;
  onNavigate: (page: PageType) => void;
}
