import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => import("./Cart").then(m => m.Cart), (cart: any) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cartId" })
  cart!: any;

  @Column()
  cartId!: string;

  @ManyToOne(() => import("./Product").then(m => m.Product), { eager: true })
  @JoinColumn({ name: "productId" })
  product!: any;

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
