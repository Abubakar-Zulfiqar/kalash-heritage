import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Cart } from "./Cart";
import type { Product } from "./Product";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => require("./Cart").Cart, (cart: Cart) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cartId" })
  cart!: Cart;

  @Column()
  cartId!: string;

  @ManyToOne(() => require("./Product").Product, { eager: true })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column()
  productId!: string;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number; // Price at time of adding to cart

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
