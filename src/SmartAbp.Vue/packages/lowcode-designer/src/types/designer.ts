export interface DesignerComponent {
  id: string;
  name: string;
  type: string;
  children?: DesignerComponent[];
  props?: Record<string, any>;
  position?: { x: number; y: number };
}
