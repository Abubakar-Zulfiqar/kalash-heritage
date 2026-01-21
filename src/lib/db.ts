import "reflect-metadata";

// Use globalThis to persist across Next.js hot reloads in development
const globalForTypeORM = globalThis as unknown as {
  dataSource: any | undefined;
  dataSourcePromise: Promise<any> | undefined;
};

export async function getDatabase() {
  // Skip database connection during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database connection skipped during build');
  }

  // Return cached connection if available
  if (globalForTypeORM.dataSource?.isInitialized) {
    return globalForTypeORM.dataSource;
  }

  // Return pending initialization promise to prevent duplicate connections
  if (globalForTypeORM.dataSourcePromise) {
    return globalForTypeORM.dataSourcePromise;
  }

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create initialization promise
  globalForTypeORM.dataSourcePromise = initializeDataSource();

  try {
    globalForTypeORM.dataSource = await globalForTypeORM.dataSourcePromise;
    return globalForTypeORM.dataSource;
  } finally {
    globalForTypeORM.dataSourcePromise = undefined;
  }
}

async function initializeDataSource() {
  const startTime = Date.now();
  console.log("🔄 Starting database connection...");

  const { DataSource } = await import("typeorm");
  console.log(`  ⏱️ TypeORM import: ${Date.now() - startTime}ms`);

  // Lazy load entities to avoid circular dependencies during build
  const entityStart = Date.now();
  const { User } = await import("@/entities/User");
  const { Product } = await import("@/entities/Product");
  const { Collection } = await import("@/entities/Collection");
  const { Category } = await import("@/entities/Category");
  const { Size } = await import("@/entities/Size");
  const { Order } = await import("@/entities/Order");
  const { OrderItem } = await import("@/entities/OrderItem");
  const { Cart } = await import("@/entities/Cart");
  const { CartItem } = await import("@/entities/CartItem");
  const { ShippingAddress } = await import("@/entities/ShippingAddress");
  console.log(`  ⏱️ Entity imports: ${Date.now() - entityStart}ms`);

  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    // DISABLED: Schema is synced. Only enable temporarily if you change entities.
    synchronize: false,
    // Disable verbose query logging - only log errors
    logging: ["error"],
    entities: [User, Product, Collection, Category, Size, Order, OrderItem, Cart, CartItem, ShippingAddress],
    subscribers: [],
    migrations: [],
    // Connection pool settings for better performance
    extra: {
      // Maximum number of connections in pool
      max: 10,
      // Connection timeout - increase for Neon cold starts
      connectionTimeoutMillis: 30000,
      // Idle timeout
      idleTimeoutMillis: 30000,
    },
    // SSL required for Neon
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const initStart = Date.now();
  await dataSource.initialize();
  console.log(`  ⏱️ DataSource init (includes sync): ${Date.now() - initStart}ms`);
  console.log(`✅ Database connected successfully (total: ${Date.now() - startTime}ms)`);

  return dataSource;
}

export async function initializeDatabase() {
  return getDatabase();
}
