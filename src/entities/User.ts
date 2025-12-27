import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import type { Order } from "./Order";
import type { Cart } from "./Cart";
import type { ShippingAddress } from "./ShippingAddress";

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

  @OneToMany(() => require("./Order").Order, (order: Order) => order.user)
  orders!: Order[];

  @OneToMany(() => require("./Cart").Cart, (cart: Cart) => cart.user)
  carts!: Cart[];

  @OneToMany(() => require("./ShippingAddress").ShippingAddress, (address: ShippingAddress) => address.user)
  addresses!: ShippingAddress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
