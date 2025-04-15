// Criar as coleções necessárias
db = db.getSiblingDB('evently');

// Criar coleção users
db.createCollection('users');
db.users.createIndex({ clerkId: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

// Criar coleção events
db.createCollection('events');
db.events.createIndex({ organizer: 1 });
db.events.createIndex({ category: 1 });

// Criar coleção orders
db.createCollection('orders');
db.orders.createIndex({ buyer: 1 });
db.orders.createIndex({ event: 1 });

// Criar coleção categories
db.createCollection('categories');
db.categories.createIndex({ name: 1 }, { unique: true });

// Inserir algumas categorias padrão
db.categories.insertMany([
  { name: 'Conferência' },
  { name: 'Workshop' },
  { name: 'Meetup' },
  { name: 'Concerto' },
  { name: 'Festival' }
]); 