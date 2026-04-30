export interface PostIt {
  id: string;
  title: string;
  text: string;
  color: string;
  position: { x: number; y: number };
  rotation: number;
}
