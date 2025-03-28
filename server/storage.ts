import { 
  barbers, Barber, InsertBarber, 
  services, Service, InsertService,
  clients, Client, InsertClient,
  appointments, Appointment, InsertAppointment, AppointmentWithDetails,
  products, Product, InsertProduct,
  sales, Sale, InsertSale, SaleWithDetails
} from "@shared/schema";

export interface IStorage {
  // Barbers
  getBarbers(): Promise<Barber[]>;
  getBarber(id: number): Promise<Barber | undefined>;
  createBarber(barber: InsertBarber): Promise<Barber>;
  updateBarber(id: number, barber: Partial<InsertBarber>): Promise<Barber | undefined>;
  deleteBarber(id: number): Promise<boolean>;

  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsWithDetails(): Promise<AppointmentWithDetails[]>;
  getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentWithDetails(id: number): Promise<AppointmentWithDetails | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Sales
  getSales(): Promise<Sale[]>;
  getSalesWithDetails(): Promise<SaleWithDetails[]>;
  getSalesByDate(date: string): Promise<SaleWithDetails[]>;
  getSale(id: number): Promise<Sale | undefined>;
  getSaleWithDetails(id: number): Promise<SaleWithDetails | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: number): Promise<boolean>;

  // Dashboard
  getDashboardData(): Promise<{
    todayAppointments: number;
    todayClientsServed: number;
    todayRevenue: number;
    todayProductsSold: number;
    barberPerformance: { name: string; clients: number }[];
    topServices: { name: string; percentage: number }[];
  }>;
}

export class MemStorage implements IStorage {
  private barbersData: Map<number, Barber>;
  private servicesData: Map<number, Service>;
  private clientsData: Map<number, Client>;
  private appointmentsData: Map<number, Appointment>;
  private productsData: Map<number, Product>;
  private salesData: Map<number, Sale>;
  
  private currentBarberId: number;
  private currentServiceId: number;
  private currentClientId: number;
  private currentAppointmentId: number;
  private currentProductId: number;
  private currentSaleId: number;

  constructor() {
    // Initialize empty data stores
    this.barbersData = new Map();
    this.servicesData = new Map();
    this.clientsData = new Map();
    this.appointmentsData = new Map();
    this.productsData = new Map();
    this.salesData = new Map();
    
    // Initialize IDs
    this.currentBarberId = 1;
    this.currentServiceId = 1;
    this.currentClientId = 1;
    this.currentAppointmentId = 1;
    this.currentProductId = 1;
    this.currentSaleId = 1;

    // Add initial data
    this.seedData();
  }

  // Barber CRUD operations
  async getBarbers(): Promise<Barber[]> {
    return Array.from(this.barbersData.values());
  }

  async getBarber(id: number): Promise<Barber | undefined> {
    return this.barbersData.get(id);
  }

  async createBarber(barber: InsertBarber): Promise<Barber> {
    const id = this.currentBarberId++;
    const newBarber: Barber = { ...barber, id };
    this.barbersData.set(id, newBarber);
    return newBarber;
  }

  async updateBarber(id: number, barber: Partial<InsertBarber>): Promise<Barber | undefined> {
    const existingBarber = this.barbersData.get(id);
    if (!existingBarber) return undefined;

    const updatedBarber: Barber = { ...existingBarber, ...barber };
    this.barbersData.set(id, updatedBarber);
    return updatedBarber;
  }

  async deleteBarber(id: number): Promise<boolean> {
    return this.barbersData.delete(id);
  }

  // Service CRUD operations
  async getServices(): Promise<Service[]> {
    return Array.from(this.servicesData.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.servicesData.get(id);
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const newService: Service = { ...service, id };
    this.servicesData.set(id, newService);
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const existingService = this.servicesData.get(id);
    if (!existingService) return undefined;

    const updatedService: Service = { ...existingService, ...service };
    this.servicesData.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.servicesData.delete(id);
  }

  // Client CRUD operations
  async getClients(): Promise<Client[]> {
    return Array.from(this.clientsData.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clientsData.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const newClient: Client = { 
      ...client, 
      id, 
      createdAt: new Date() 
    };
    this.clientsData.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clientsData.get(id);
    if (!existingClient) return undefined;

    const updatedClient: Client = { ...existingClient, ...client };
    this.clientsData.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clientsData.delete(id);
  }

  // Appointment CRUD operations
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointmentsData.values());
  }

  async getAppointmentsWithDetails(): Promise<AppointmentWithDetails[]> {
    const appointments = await this.getAppointments();
    
    return appointments.map(appointment => {
      const client = this.clientsData.get(appointment.clientId)!;
      const barber = this.barbersData.get(appointment.barberId)!;
      const service = this.servicesData.get(appointment.serviceId)!;

      return {
        ...appointment,
        client,
        barber,
        service
      };
    });
  }

  async getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]> {
    const appointments = await this.getAppointmentsWithDetails();
    return appointments.filter(appointment => appointment.date === date);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointmentsData.get(id);
  }

  async getAppointmentWithDetails(id: number): Promise<AppointmentWithDetails | undefined> {
    const appointment = this.appointmentsData.get(id);
    if (!appointment) return undefined;
    
    const client = this.clientsData.get(appointment.clientId)!;
    const barber = this.barbersData.get(appointment.barberId)!;
    const service = this.servicesData.get(appointment.serviceId)!;

    return {
      ...appointment,
      client,
      barber,
      service
    };
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointmentsData.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existingAppointment = this.appointmentsData.get(id);
    if (!existingAppointment) return undefined;

    const updatedAppointment: Appointment = { ...existingAppointment, ...appointment };
    this.appointmentsData.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointmentsData.delete(id);
  }

  // Product CRUD operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.productsData.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsData.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { ...product, id };
    this.productsData.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.productsData.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct: Product = { ...existingProduct, ...product };
    this.productsData.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.productsData.delete(id);
  }

  // Sale CRUD operations
  async getSales(): Promise<Sale[]> {
    return Array.from(this.salesData.values());
  }

  async getSalesWithDetails(): Promise<SaleWithDetails[]> {
    const sales = await this.getSales();
    
    return sales.map(sale => {
      const saleWithDetails: SaleWithDetails = { ...sale };

      if (sale.clientId) {
        saleWithDetails.client = this.clientsData.get(sale.clientId);
      }

      if (sale.productId) {
        saleWithDetails.product = this.productsData.get(sale.productId);
      }

      if (sale.appointmentId) {
        const appointment = this.appointmentsData.get(sale.appointmentId);
        if (appointment) {
          const client = this.clientsData.get(appointment.clientId)!;
          const barber = this.barbersData.get(appointment.barberId)!;
          const service = this.servicesData.get(appointment.serviceId)!;

          saleWithDetails.appointment = {
            ...appointment,
            client,
            barber,
            service
          };
        }
      }

      return saleWithDetails;
    });
  }

  async getSalesByDate(date: string): Promise<SaleWithDetails[]> {
    const sales = await this.getSalesWithDetails();
    return sales.filter(sale => sale.date === date);
  }

  async getSale(id: number): Promise<Sale | undefined> {
    return this.salesData.get(id);
  }

  async getSaleWithDetails(id: number): Promise<SaleWithDetails | undefined> {
    const sale = this.salesData.get(id);
    if (!sale) return undefined;
    
    const saleWithDetails: SaleWithDetails = { ...sale };

    if (sale.clientId) {
      saleWithDetails.client = this.clientsData.get(sale.clientId);
    }

    if (sale.productId) {
      saleWithDetails.product = this.productsData.get(sale.productId);
    }

    if (sale.appointmentId) {
      const appointment = this.appointmentsData.get(sale.appointmentId);
      if (appointment) {
        const client = this.clientsData.get(appointment.clientId)!;
        const barber = this.barbersData.get(appointment.barberId)!;
        const service = this.servicesData.get(appointment.serviceId)!;

        saleWithDetails.appointment = {
          ...appointment,
          client,
          barber,
          service
        };
      }
    }

    return saleWithDetails;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const newSale: Sale = { ...sale, id };
    this.salesData.set(id, newSale);
    return newSale;
  }

  async updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined> {
    const existingSale = this.salesData.get(id);
    if (!existingSale) return undefined;

    const updatedSale: Sale = { ...existingSale, ...sale };
    this.salesData.set(id, updatedSale);
    return updatedSale;
  }

  async deleteSale(id: number): Promise<boolean> {
    return this.salesData.delete(id);
  }

  // Dashboard data
  async getDashboardData(): Promise<{
    todayAppointments: number;
    todayClientsServed: number;
    todayRevenue: number;
    todayProductsSold: number;
    barberPerformance: { name: string; clients: number }[];
    topServices: { name: string; percentage: number }[];
  }> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get today's appointments
    const todayAppointments = await this.getAppointmentsByDate(today);
    
    // Get today's sales
    const todaySales = await this.getSalesByDate(today);
    
    // Calculate total revenue from sales
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    
    // Count products sold today
    const todayProductsSold = todaySales
      .filter(sale => sale.productId)
      .reduce((sum, sale) => sum + sale.quantity, 0);
    
    // Count clients served today (completed appointments)
    const todayClientsServed = todayAppointments
      .filter(appointment => appointment.status === 'completed')
      .length;
    
    // Calculate barber performance
    const barbers = await this.getBarbers();
    const appointments = await this.getAppointments();
    
    const barberPerformance = barbers.map(barber => {
      const clients = appointments.filter(a => a.barberId === barber.id).length;
      return {
        name: barber.name,
        clients
      };
    }).sort((a, b) => b.clients - a.clients);
    
    // Calculate top services
    const services = await this.getServices();
    const serviceAppointments = appointments.reduce((acc, appointment) => {
      acc[appointment.serviceId] = (acc[appointment.serviceId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const totalAppointments = appointments.length || 1; // Avoid division by zero
    
    const topServices = services.map(service => {
      const count = serviceAppointments[service.id] || 0;
      return {
        name: service.name,
        percentage: Math.round((count / totalAppointments) * 100)
      };
    }).sort((a, b) => b.percentage - a.percentage);
    
    return {
      todayAppointments: todayAppointments.length,
      todayClientsServed,
      todayRevenue,
      todayProductsSold,
      barberPerformance,
      topServices
    };
  }

  // Seed data with initial values
  private seedData() {
    // Seed barbers
    const initialBarbers: InsertBarber[] = [
      {
        name: "Marcos Oliveira",
        position: "Barbeiro Senior",
        phone: "(11) 98765-4321",
        email: "marcos@barberhub.com",
        specialty: "Degradê",
        startDate: "2022-01-01",
        about: "Especialista em cortes modernos e degradês.",
        status: "active"
      },
      {
        name: "Felipe Costa",
        position: "Barbeiro Senior",
        phone: "(11) 97654-3210",
        email: "felipe@barberhub.com",
        specialty: "Barba",
        startDate: "2022-03-01",
        about: "Especialista em designs de barba.",
        status: "active"
      },
      {
        name: "Lucas Mendes",
        position: "Barbeiro Pleno",
        phone: "(11) 96543-2109",
        email: "lucas@barberhub.com",
        specialty: "Corte Social",
        startDate: "2022-06-01",
        about: "Especialista em cortes sociais e tradicionais.",
        status: "active"
      }
    ];

    initialBarbers.forEach(barber => this.createBarber(barber));

    // Seed services
    const initialServices: InsertService[] = [
      {
        name: "Corte Degradê",
        description: "Corte moderno com máquina e tesoura.",
        duration: 30,
        price: 40,
        status: "active"
      },
      {
        name: "Corte + Barba",
        description: "Corte completo com barba.",
        duration: 60,
        price: 60,
        status: "active"
      },
      {
        name: "Barba",
        description: "Aparar e modelar a barba.",
        duration: 30,
        price: 30,
        status: "active"
      },
      {
        name: "Corte Infantil",
        description: "Corte para crianças até 12 anos.",
        duration: 20,
        price: 25,
        status: "active"
      },
      {
        name: "Pigmentação",
        description: "Pigmentação para disfarçar falhas.",
        duration: 45,
        price: 50,
        status: "active"
      }
    ];

    initialServices.forEach(service => this.createService(service));

    // Seed clients
    const initialClients: InsertClient[] = [
      {
        name: "João Silva",
        phone: "(11) 98765-4321",
        email: "joao@email.com",
        birthdate: "1990-05-15",
        notes: "Cliente regular, prefere corte degradê."
      },
      {
        name: "Pedro Santos",
        phone: "(11) 91234-5678",
        email: "pedro@email.com",
        birthdate: "1985-10-20",
        notes: "Prefere ser atendido pelo Felipe."
      },
      {
        name: "Rafael Gomes",
        phone: "(11) 99876-5432",
        email: "rafael@email.com",
        birthdate: "1988-03-25",
        notes: "Alérgico a alguns produtos."
      }
    ];

    initialClients.forEach(client => this.createClient(client));

    // Seed products
    const initialProducts: InsertProduct[] = [
      {
        name: "Pomada Modeladora",
        description: "Pomada para estilizar o cabelo.",
        price: 35,
        stock: 20,
        category: "Estilização",
        status: "active"
      },
      {
        name: "Óleo para Barba",
        description: "Óleo hidratante para barba.",
        price: 45,
        stock: 15,
        category: "Barba",
        status: "active"
      },
      {
        name: "Shampoo Especializado",
        description: "Shampoo para cabelos masculinos.",
        price: 30,
        stock: 25,
        category: "Higiene",
        status: "active"
      }
    ];

    initialProducts.forEach(product => this.createProduct(product));
    
    // Get current date for appointments and sales
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Seed appointments
    const initialAppointments: InsertAppointment[] = [
      {
        clientId: 1,
        barberId: 1,
        serviceId: 2,
        date: today,
        time: "10:30",
        status: "confirmed",
        notes: ""
      },
      {
        clientId: 2,
        barberId: 2,
        serviceId: 1,
        date: today,
        time: "13:00",
        status: "waiting",
        notes: ""
      },
      {
        clientId: 3,
        barberId: 1,
        serviceId: 2,
        date: today,
        time: "15:30",
        status: "confirmed",
        notes: "Cliente solicitou pigmentação também."
      }
    ];

    initialAppointments.forEach(appointment => this.createAppointment(appointment));

    // Seed sales
    const initialSales: InsertSale[] = [
      {
        clientId: 1,
        productId: 1,
        appointmentId: null,
        quantity: 1,
        totalPrice: 35,
        date: today,
        paymentMethod: "credit",
        notes: ""
      },
      {
        clientId: 3,
        productId: 2,
        appointmentId: null,
        quantity: 1,
        totalPrice: 45,
        date: today,
        paymentMethod: "cash",
        notes: ""
      },
      {
        clientId: 1,
        productId: null,
        appointmentId: 1,
        quantity: 1,
        totalPrice: 60,
        date: today,
        paymentMethod: "credit",
        notes: ""
      }
    ];

    initialSales.forEach(sale => this.createSale(sale));
  }
}

export const storage = new MemStorage();
