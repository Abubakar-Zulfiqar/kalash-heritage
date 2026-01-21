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
import type { Size } from "./Size";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  // Parent collection
  @ManyToOne(() => require("./Collection").Collection, (collection: Collection) => collection.categories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "collectionId" })
  collection!: Collection;

  // Made nullable temporarily for migration - existing categories will need to be assigned to a collection
  @Column({ nullable: true })
  collectionId?: string;

  // Sizes under this category
  @OneToMany(() => require("./Size").Size, (size: Size) => size.category)
  sizes!: Size[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
