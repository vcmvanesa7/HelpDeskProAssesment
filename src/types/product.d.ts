export interface ProductListItem {
  _id: string;
  title: string;
  price: number;
  categoryId: string;
  status: "active" | "inactive";
}
