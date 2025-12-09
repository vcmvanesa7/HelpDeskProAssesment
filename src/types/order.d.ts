export interface OrderItem {
  productId: string;
  qty: number;
  priceAtAdd: number;
  variant?: string;
  title: string;
  image: string;
}

export interface OrderType {
  _id: string;
  userId: string;
  paypalOrderId: string;
  items: OrderItem[];

  total: number;

  status: "pending" | "paid" | "failed";
  paymentMethod: "paypal" | "testing";
  shippingStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
}
