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

  @ManyToOne(() => import("./User").then(m => m.User), (user: any) => user.carts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: any;

  @Column()
  userId!: string;

  @OneToMany(() => import("./CartItem").then(m => m.CartItem), (item: any) => item.cart, { cascade: true })
  items!: any[];

  @Column({ default: "USD" })
  currency!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
