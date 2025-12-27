import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

@Entity("carts")
export class Cart {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne("User", "carts", { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: any;

  @Column()
  userId!: string;

  @OneToMany("CartItem", "cart", { cascade: true })
  items!: any[];

  @Column({ default: "USD" })
  currency!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
