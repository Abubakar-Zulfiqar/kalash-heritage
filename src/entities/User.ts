import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({ nullable: true })
  phone?: string;

  @OneToMany(() => import("./Order").then(m => m.Order), (order: any) => order.user)
  orders!: any[];

  @OneToMany(() => import("./Cart").then(m => m.Cart), (cart: any) => cart.user)
  carts!: any[];

  @OneToMany(() => import("./ShippingAddress").then(m => m.ShippingAddress), (address: any) => address.user)
  addresses!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
