import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => import("./Order").then(m => m.Order), (order: any) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: any;

  @Column()
  orderId!: string;

  @ManyToOne(() => import("./Product").then(m => m.Product), { eager: true })
  @JoinColumn({ name: "productId" })
  product!: any;

  @Column()
  productId!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number; // Price at time of order

  @Column({ default: "USD" })
  currency!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
