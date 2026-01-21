import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import type { Category } from "./Category";
import type { Size } from "./Size";

@Entity("collections")
export class Collection {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  // If true, this collection has categories (sub-levels)
  // If false, sizes are directly under the collection
  @Column({ default: false })
  hasCategories!: boolean;

  @OneToMany(() => require("./Category").Category, (category: Category) => category.collection)
  categories!: Category[];

  // Sizes directly under collection (when hasCategories is false)
  @OneToMany(() => require("./Size").Size, (size: Size) => size.collection)
  sizes!: Size[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
