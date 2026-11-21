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

  // Remote hosts (e.g. Neon) need SSL; a database on the same server does not.
  const dbHost = new URL(process.env.DATABASE_URL!).hostname;
  const isLocalDb = ["localhost", "127.0.0.1", "::1"].includes(dbHost);
  const useSsl = process.env.DATABASE_SSL
    ? process.env.DATABASE_SSL === "true"
    : !isLocalDb;

  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    // Schema sync on startup. Defaults to on (previous behaviour); set
    // DB_SYNCHRONIZE=false in production once the schema is stable.
    synchronize: process.env.DB_SYNCHRONIZE !== "false",
    // Disable verbose query logging - only log errors
    logging: ["error"],
    entities: [User, Product, Collection, Category, Size, Order, OrderItem, Cart, CartItem, ShippingAddress],
    subscribers: [],
    migrations: [],
    // Connection pool settings
    extra: {
      max: Number(process.env.DB_POOL_MAX || 20),
      // Local Postgres answers in milliseconds; remote/serverless needs longer
      connectionTimeoutMillis: isLocalDb ? 5000 : 30000,
      // Keep warm connections around on a long-running server
      idleTimeoutMillis: isLocalDb ? 300000 : 30000,
      keepAlive: true,
      application_name: "kalash-heritage",
    },
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  // On a long-running server every route shares this one DataSource, but each
  // route bundle has its own copy of the entity classes. TypeORM only knows the
  // copies registered above, so resolve any other copy by its table name.
  const { getMetadataArgsStorage } = await import("typeorm");
  const getRepositoryByClass = dataSource.getRepository.bind(dataSource);
  dataSource.getRepository = ((target: any) => {
    if (typeof target === "function" && !dataSource.hasMetadata(target)) {
      const table = getMetadataArgsStorage().tables.find((t) => t.target === target);
      if (table?.name) return getRepositoryByClass(table.name);
    }
    return getRepositoryByClass(target);
  }) as typeof dataSource.getRepository;

  const initStart = Date.now();
  await dataSource.initialize();
  console.log(`  ⏱️ DataSource init (includes sync): ${Date.now() - initStart}ms`);
  console.log(`✅ Database connected successfully (total: ${Date.now() - startTime}ms)`);

  return dataSource;
}

export async function initializeDatabase() {
  return getDatabase();
}
