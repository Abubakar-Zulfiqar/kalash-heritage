import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Collection } from "./Collection";
import type { Category } from "./Category";
import type { Product } from "./Product";

@Entity("sizes")
export class Size {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string; // e.g., "2.3 X 3 ft", "9 X 12", "Round", "Square"

  @Column()
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  // Parent collection (for collections without categories)
  @ManyToOne(() => require("./Collection").Collection, (collection: Collection) => collection.sizes, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "collectionId" })
  collection?: Collection;

  @Column({ nullable: true })
  collectionId?: string;

  // Parent category (for collections with categories)
  @ManyToOne(() => require("./Category").Category, (category: Category) => category.sizes, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "categoryId" })
  category?: Category;

  @Column({ nullable: true })
  categoryId?: string;

  // Products under this size
  @OneToMany(() => require("./Product").Product, (product: Product) => product.size)
  products!: Product[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
