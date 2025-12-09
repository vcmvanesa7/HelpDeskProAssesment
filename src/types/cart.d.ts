export interface CartItemDTO {
  productId: string; 
  qty: number;
  priceAtAdd: number;
  variant?: string;
  title: string;
  image: string; 
}

export interface CartDTO {
  items: CartItemDTO[];
}
