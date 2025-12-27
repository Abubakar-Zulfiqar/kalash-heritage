let dataSource: any = null;

export async function getDatabase() {
  // Skip database connection during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database connection skipped during build');
  }

  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Lazy load reflect-metadata and TypeORM to avoid build-time issues
  await import("reflect-metadata");
  const { DataSource } = await import("typeorm");

  // Lazy load entities to avoid circular dependencies during build
  const { User } = await import("@/entities/User");
  const { Product } = await import("@/entities/Product");
  const { Category } = await import("@/entities/Category");
  const { Order } = await import("@/entities/Order");
  const { OrderItem } = await import("@/entities/OrderItem");
  const { Cart } = await import("@/entities/Cart");
  const { CartItem } = await import("@/entities/CartItem");
  const { ShippingAddress } = await import("@/entities/ShippingAddress");

  dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // Auto-sync entities with database schema
    logging: process.env.NODE_ENV === "development",
    entities: [User, Product, Category, Order, OrderItem, Cart, CartItem, ShippingAddress],
    subscribers: [],
    migrations: [],
  });

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    console.log("✅ Database connected successfully");
  }

  return dataSource;
}

export async function initializeDatabase() {
  return getDatabase();
}
