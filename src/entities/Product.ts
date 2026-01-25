import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Size } from "./Size";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ unique: true })
  sku!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  salePrice?: number;

  @Column({ default: "USD" })
  currency!: string;

  // Product specifications
  @Column({ nullable: true })
  dimensions?: string; // e.g., "280cm x 175cm"

  @Column({ nullable: true })
  diameter?: string; // Calculated from dimensions or manually entered

  @Column({ nullable: true })
  material?: string; // e.g., "Wool", "Silk", "Cotton"

  @Column({ nullable: true })
  color?: string; // Primary color

  @Column({ type: "simple-array", nullable: true })
  colors?: string[]; // All colors

  @Column({ nullable: true })
  style?: string; // e.g., "Oriental", "Modern", "Vintage"

  @Column({ nullable: true })
  origin?: string; // e.g., "Pakistan", "Afghanistan"

  @Column({ nullable: true })
  pattern?: string; // e.g., "Floral", "Geometric"

  @Column({ type: "int", default: 0 })
  stock!: number;

  @Column({ default: true })
  inStock!: boolean;

  @Column({ default: false })
  featured!: boolean;

  // Images
  @Column({ type: "simple-array" })
  images!: string[];

  @Column({ nullable: true })
  thumbnail?: string;

  // SEO
  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ type: "text", nullable: true })
  metaDescription?: string;

  // Relationship to Size
  @ManyToOne(() => require("./Size").Size, (size: Size) => size.products, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "sizeId" })
  size?: Size;

  @Column({ nullable: true })
  sizeId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Soft delete support
  @DeleteDateColumn()
  deletedAt?: Date;
}
