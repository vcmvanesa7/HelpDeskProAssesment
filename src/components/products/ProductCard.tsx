"use client";

import styles from "./ProductCard.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";

type Props = {
  product: {
    _id: string;
    title: string;
    brand?: string;
    price: number;
    discount?: number;
    images?: { url: string }[];
  };
};

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const { addItem } = useCart();

  const img = product.images?.[0]?.url;
  const hasDiscount = product.discount && product.discount > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - (product.discount ?? 0) / 100))
    : product.price;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();

    await addItem({
      productId: product._id,
      qty: 1,
      priceAtAdd: finalPrice,
      title: product.title,
      image: img ?? "",
    });

    toast.success("Added to cart");
  };

  return (
    <article
      className={styles.card}
      onClick={() => router.push(`/products/${product._id}`)}
    >
      <div className={styles.imageWrapper}>
        {img && <Image src={img} alt={product.title} fill />}
        <span className={styles.badge}>Nuevo</span>
        {hasDiscount && (
          <span className={`${styles.badge} ${styles.discountBadge}`}>
            -{product.discount}%
          </span>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.title}>{product.title}</div>
        {product.brand && <div className={styles.brand}>{product.brand}</div>}

        <div className={styles.footer}>
          <div>
            <div className={styles.price}>${finalPrice.toLocaleString()}</div>
            {hasDiscount && (
              <div className={styles.oldPrice}>
                ${product.price.toLocaleString()}
              </div>
            )}
          </div>

          <button className={styles.addButton} onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
