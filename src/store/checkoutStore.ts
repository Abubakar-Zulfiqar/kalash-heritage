import { create } from "zustand";

export interface ShippingAddressForm {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingOption {
  region: string;
  cost: number;
  currency: string;
  estimatedDays: string;
}

interface CheckoutState {
  step: "shipping" | "review" | "payment";
  shippingAddress: ShippingAddressForm | null;
  shippingOption: ShippingOption | null;
  guestEmail: string;
  createAccount: boolean;
  accountPassword: string;
  orderId: string | null;
  orderNumber: string | null;

  setStep: (step: CheckoutState["step"]) => void;
  setShippingAddress: (address: ShippingAddressForm) => void;
  setShippingOption: (option: ShippingOption) => void;
  setGuestEmail: (email: string) => void;
  setCreateAccount: (create: boolean) => void;
  setAccountPassword: (password: string) => void;
  setOrderInfo: (orderId: string, orderNumber: string) => void;
  reset: () => void;
}

const initialState = {
  step: "shipping" as const,
  shippingAddress: null,
  shippingOption: null,
  guestEmail: "",
  createAccount: false,
  accountPassword: "",
  orderId: null,
  orderNumber: null,
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setShippingAddress: (address) => set({ shippingAddress: address }),

  setShippingOption: (option) => set({ shippingOption: option }),

  setGuestEmail: (email) => set({ guestEmail: email }),

  setCreateAccount: (create) => set({ createAccount: create }),

  setAccountPassword: (password) => set({ accountPassword: password }),

  setOrderInfo: (orderId, orderNumber) => set({ orderId, orderNumber }),

  reset: () => set(initialState),
}));
