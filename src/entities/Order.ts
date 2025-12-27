import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  orderNumber!: string; // e.g., "KH-2025-0001"

  @ManyToOne(() => import("./User").then(m => m.User), (user: any) => user.orders, { onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user!: any;

  @Column({ nullable: true })
  userId?: string;

  @OneToMany(() => import("./OrderItem").then(m => m.OrderItem), (item: any) => item.order, { cascade: true })
  items!: any[];

  @OneToOne(() => import("./ShippingAddress").then(m => m.ShippingAddress), { cascade: true })
  @JoinColumn({ name: "shippingAddressId" })
  shippingAddress!: any;

  @Column({ nullable: true })
  shippingAddressId?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  shippingCost!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  tax!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total!: number;

  @Column({ default: "USD" })
  currency!: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus!: PaymentStatus;

  @Column({ nullable: true })
  paymentIntentId?: string; // Stripe/PayPal/Safepay transaction ID

  @Column({ nullable: true })
  paymentMethod?: string; // e.g., "stripe", "paypal", "safepay"

  @Column({ nullable: true })
  trackingNumber?: string;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
