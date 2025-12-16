import { User, Meal, Order, UserRole, OrderStatus, Message, WalletTransaction, PaymentMethod, Review, Notification } from '../types';

// Initial Data Wrappers to allow LocalStorage persistence
const getStored = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(`marmita_${key}`);
  return stored ? JSON.parse(stored) : initial;
};

const setStored = (key: string, data: any) => {
  localStorage.setItem(`marmita_${key}`, JSON.stringify(data));
};

// Initial Data
const initialUsers: User[] = [
  { 
    id: 1, 
    name: 'João Cliente', 
    email: 'cliente@marmita.com', 
    password: '123',
    role: UserRole.CLIENTE, 
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
    address: 'Rua das Flores, 123',
    paymentMethods: [
      { id: 1, type: 'credit_card', brand: 'mastercard', last4: '4242', label: 'Mastercard **** 4242' }
    ]
  },
  { 
    id: 2, 
    name: 'Maria Chef', 
    email: 'chef@marmita.com', 
    password: '123',
    role: UserRole.COZINHEIRO, 
    avatarUrl: 'https://i.pravatar.cc/150?u=2',
    address: 'Av. Gastronomia, 500',
    balance: 150.50
  }
];

const initialMeals: Meal[] = [
  {
    id: 1,
    cookId: 2,
    cookName: 'Maria Chef',
    title: 'Feijoada Fit',
    description: 'Arroz integral, feijão preto leve, couve e farofa de aveia.',
    price: 28.90,
    imageUrl: 'https://images.unsplash.com/photo-1574484284008-59d73054596d?w=500&q=80',
    available: true
  },
  {
    id: 2,
    cookId: 2,
    cookName: 'Maria Chef',
    title: 'Bowl de Salmão',
    description: 'Salmão grelhado, quinoa, abacate e mix de folhas.',
    price: 35.50,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
    available: true
  }
];

const initialOrders: Order[] = [
  {
    id: 101,
    clientId: 1,
    clientName: 'João Cliente',
    cookId: 2,
    cookName: 'Maria Chef',
    status: OrderStatus.ENTREGUE,
    total: 28.90,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    paymentMethodLabel: 'Mastercard **** 4242',
    items: [
      { id: 1, mealId: 1, mealTitle: 'Feijoada Fit', quantity: 1, unitPrice: 28.90 }
    ]
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  // Auth & User
  login: async (email: string, password?: string): Promise<User> => {
    await delay(500);
    const users = getStored<User[]>('users', initialUsers);
    const user = users.find(u => u.email === email);
    
    if (user) {
      // Simple password check for mock (in production use JWT/Bcrypt on backend)
      if (password && user.password !== password) {
        throw new Error('Senha incorreta');
      }
      return user;
    }
    throw new Error('Usuário não encontrado');
  },

  register: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
      await delay(500);
      const users = getStored<User[]>('users', initialUsers);
      
      if (users.find(u => u.email === email)) {
          throw new Error('Email já cadastrado');
      }
      const newUser: User = {
          id: Date.now(),
          name: name || email.split('@')[0],
          email,
          password,
          role,
          avatarUrl: `https://ui-avatars.com/api/?name=${name || email}&background=10b981&color=fff`
      };
      
      const updatedUsers = [...users, newUser];
      setStored('users', updatedUsers);
      return newUser;
  },

  socialLogin: async (provider: string): Promise<User> => {
    await delay(800);
    const users = getStored<User[]>('users', initialUsers);
    const email = `user_${provider}@social.com`;
    let user = users.find(u => u.email === email);
    
    if (!user) {
      user = {
        id: Date.now(),
        name: `Usuário ${provider}`,
        email,
        role: UserRole.CLIENTE,
        avatarUrl: `https://ui-avatars.com/api/?name=${provider}&background=10b981&color=fff`
      };
      const updatedUsers = [...users, user];
      setStored('users', updatedUsers);
    }
    return user;
  },

  updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
    await delay(400);
    const users = getStored<User[]>('users', initialUsers);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      setStored('users', users);
      return users[index];
    }
    throw new Error('User not found');
  },

  addPaymentMethod: async (userId: number, method: PaymentMethod): Promise<User> => {
    await delay(300);
    const users = getStored<User[]>('users', initialUsers);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const newMethods = [...(users[index].paymentMethods || []), { ...method, id: Math.random() }];
      users[index].paymentMethods = newMethods;
      setStored('users', users);
      return users[index];
    }
    throw new Error('User not found');
  },

  getCookById: async (id: number): Promise<User | undefined> => {
    await delay(200);
    const users = getStored<User[]>('users', initialUsers);
    return users.find(u => u.id === id && u.role === UserRole.COZINHEIRO);
  },

  getCookReviews: async (cookId: number): Promise<Review[]> => {
    await delay(300);
    const reviews = getStored<Review[]>('reviews', []);
    return reviews.filter(r => r.cookId === cookId);
  },

  // Wallet
  getWalletTransactions: async (userId: number): Promise<WalletTransaction[]> => {
    await delay(300);
    const transactions = getStored<WalletTransaction[]>('transactions', []);
    // In real app filter by userId (cook)
    return transactions;
  },

  requestWithdrawal: async (userId: number, amount: number): Promise<void> => {
    await delay(500);
    const users = getStored<User[]>('users', initialUsers);
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1 && (users[index].balance || 0) >= amount) {
      users[index].balance = (users[index].balance || 0) - amount;
      setStored('users', users);
      
      const transactions = getStored<WalletTransaction[]>('transactions', []);
      transactions.unshift({
        id: Date.now(),
        type: 'withdrawal',
        amount: amount,
        date: new Date().toISOString(),
        status: 'pending',
        description: 'Saque solicitado'
      });
      setStored('transactions', transactions);
    } else {
      throw new Error('Saldo insuficiente');
    }
  },

  // Notifications
  getNotifications: async (userId: number): Promise<Notification[]> => {
    await delay(200);
    const notifications = getStored<Notification[]>('notifications', []);
    return notifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  markNotificationRead: async (notifId: number): Promise<void> => {
    const notifications = getStored<Notification[]>('notifications', []);
    const n = notifications.find(n => n.id === notifId);
    if (n) {
        n.read = true;
        setStored('notifications', notifications);
    }
  },

  // Meals
  getMeals: async (): Promise<Meal[]> => {
    await delay(300);
    return getStored<Meal[]>('meals', initialMeals);
  },

  getCookMeals: async (cookId: number): Promise<Meal[]> => {
    await delay(300);
    const meals = getStored<Meal[]>('meals', initialMeals);
    return meals.filter(m => m.cookId === cookId);
  },

  createMeal: async (mealData: Omit<Meal, 'id' | 'cookName'>): Promise<Meal> => {
    await delay(500);
    const users = getStored<User[]>('users', initialUsers);
    const cook = users.find(u => u.id === mealData.cookId);
    const meals = getStored<Meal[]>('meals', initialMeals);

    const newMeal: Meal = {
      ...mealData,
      id: Date.now(),
      cookName: cook?.name || 'Unknown'
    };
    meals.push(newMeal);
    setStored('meals', meals);
    return newMeal;
  },

  updateMeal: async (mealId: number, data: Partial<Meal>): Promise<Meal> => {
    await delay(400);
    const meals = getStored<Meal[]>('meals', initialMeals);
    const index = meals.findIndex(m => m.id === mealId);
    if (index !== -1) {
      meals[index] = { ...meals[index], ...data };
      setStored('meals', meals);
      return meals[index];
    }
    throw new Error('Meal not found');
  },

  toggleMealAvailability: async (mealId: number): Promise<void> => {
    await delay(200);
    const meals = getStored<Meal[]>('meals', initialMeals);
    const index = meals.findIndex(m => m.id === mealId);
    if (index !== -1) {
      meals[index].available = !meals[index].available;
      setStored('meals', meals);
    }
  },

  deleteMeal: async (mealId: number): Promise<void> => {
    await delay(300);
    let meals = getStored<Meal[]>('meals', initialMeals);
    meals = meals.filter(m => m.id !== mealId);
    setStored('meals', meals);
  },

  // Orders
  getOrders: async (userId: number, role: UserRole): Promise<Order[]> => {
    await delay(400);
    const orders = getStored<Order[]>('orders', initialOrders);
    if (role === UserRole.CLIENTE) {
      return orders.filter(o => o.clientId === userId).sort((a, b) => b.id - a.id);
    } else {
      return orders.filter(o => o.cookId === userId).sort((a, b) => b.id - a.id);
    }
  },

  getOrderById: async (orderId: number): Promise<Order | undefined> => {
    await delay(200);
    const orders = getStored<Order[]>('orders', initialOrders);
    return orders.find(o => o.id === orderId);
  },

  createOrder: async (clientId: number, cookId: number, items: { meal: Meal, qty: number }[], paymentLabel: string): Promise<Order> => {
    await delay(600);
    const users = getStored<User[]>('users', initialUsers);
    const client = users.find(u => u.id === clientId);
    const cookIndex = users.findIndex(u => u.id === cookId);
    
    const total = items.reduce((acc, item) => acc + (item.meal.price * item.qty), 0);
    
    const newOrder: Order = {
      id: Math.floor(Math.random() * 90000) + 10000,
      clientId,
      clientName: client?.name || 'Cliente',
      cookId,
      cookName: users[cookIndex]?.name || 'Cozinheiro',
      status: OrderStatus.PENDENTE,
      total,
      createdAt: new Date().toISOString(),
      paymentMethodLabel: paymentLabel,
      items: items.map((item, idx) => ({
        id: idx + 1,
        mealId: item.meal.id,
        mealTitle: item.meal.title,
        quantity: item.qty,
        unitPrice: item.meal.price
      }))
    };

    const orders = getStored<Order[]>('orders', initialOrders);
    orders.unshift(newOrder);
    setStored('orders', orders);
    
    // Credit cook balance
    if (cookIndex !== -1) {
      users[cookIndex].balance = (users[cookIndex].balance || 0) + total;
      setStored('users', users);

      const transactions = getStored<WalletTransaction[]>('transactions', []);
      transactions.unshift({
        id: Date.now(),
        type: 'deposit',
        amount: total,
        date: new Date().toISOString(),
        status: 'completed',
        description: `Venda Pedido #${newOrder.id}`
      });
      setStored('transactions', transactions);
    }

    // Notify Cook
    const notifications = getStored<Notification[]>('notifications', []);
    notifications.push({
      id: Date.now(),
      userId: cookId,
      text: `Novo pedido #${newOrder.id} de ${client?.name}`,
      read: false,
      date: new Date().toISOString(),
      link: `#/pedidos/${newOrder.id}`
    });
    setStored('notifications', notifications);

    return newOrder;
  },

  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<void> => {
    await delay(300);
    const orders = getStored<Order[]>('orders', initialOrders);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      setStored('orders', orders);

      const order = orders[orderIndex];
      const targetId = order.status === OrderStatus.ENTREGUE ? order.cookId : order.clientId; 
      
      const notifications = getStored<Notification[]>('notifications', []);
      notifications.push({
        id: Date.now(),
        userId: targetId,
        text: `Pedido #${order.id} atualizado para: ${status}`,
        read: false,
        date: new Date().toISOString(),
        link: `#/pedidos/${orderId}`
      });
      setStored('notifications', notifications);
    }
  },

  // Chat
  getMessages: async (orderId: number): Promise<Message[]> => {
    await delay(200);
    const messages = getStored<Message[]>('messages', []);
    return messages.filter(m => m.orderId === orderId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  sendMessage: async (orderId: number, senderId: number, text: string): Promise<Message> => {
    await delay(100);
    const users = getStored<User[]>('users', initialUsers);
    const sender = users.find(u => u.id === senderId);
    
    const newMessage: Message = {
      id: Date.now(),
      orderId,
      senderId,
      senderName: sender?.name || 'Usuário',
      text,
      timestamp: new Date().toISOString()
    };
    
    const messages = getStored<Message[]>('messages', []);
    messages.push(newMessage);
    setStored('messages', messages);
    
    return newMessage;
  }
};