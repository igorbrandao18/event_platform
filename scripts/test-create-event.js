// Conectar ao banco de dados evently
db = db.getSiblingDB('evently');

// Criar um usuário de teste (se não existir)
const testUser = {
  clerkId: 'test_clerk_id_123',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  photo: 'https://example.com/photo.jpg',
  events: [],
  orders: []
};

try {
  db.users.insertOne(testUser);
  print('Usuário de teste criado com sucesso');
} catch (error) {
  if (error.code === 11000) {
    print('Usuário de teste já existe');
  } else {
    print('Erro ao criar usuário:', error);
  }
}

// Obter o ID do usuário criado
const user = db.users.findOne({ clerkId: testUser.clerkId });
print('ID do usuário:', user._id);

// Obter uma categoria existente
const category = db.categories.findOne({ name: 'Workshop' });
print('ID da categoria:', category._id);

// Criar um evento de teste
const testEvent = {
  title: 'Workshop de Teste de Integração',
  description: 'Um workshop para testar a criação de eventos',
  location: 'São Paulo, SP',
  createdAt: new Date(),
  imageUrl: 'https://utfs.io/f/c97a2dc9-cf62-468b-a655-6f8fe0b0a5ba-1pj178.png',
  startDateTime: new Date('2024-05-01T10:00:00Z'),
  endDateTime: new Date('2024-05-01T17:00:00Z'),
  price: '150',
  isFree: false,
  url: 'https://example.com/workshop-teste',
  category: category._id,
  organizer: user._id
};

try {
  // Criar o evento
  const result = db.events.insertOne(testEvent);
  print('Evento criado com sucesso:', result.insertedId);

  // Atualizar o array de eventos do usuário
  db.users.updateOne(
    { _id: user._id },
    { $push: { events: result.insertedId } }
  );
  print('Array de eventos do usuário atualizado');

  // Mostrar o evento criado
  const createdEvent = db.events.findOne({ _id: result.insertedId });
  print('\nEvento criado:');
  printjson(createdEvent);
} catch (error) {
  print('Erro ao criar evento:', error);
} 