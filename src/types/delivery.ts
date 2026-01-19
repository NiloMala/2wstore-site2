export interface DeliveryZone {
  id: string;
  name: string;
  neighborhoods: string[];
  price: number;
  estimatedTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliverySettings {
  isMotoboyEnabled: boolean;
  minimumOrder: number;
  freeDeliveryThreshold?: number;
}
