import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBarberSchema, 
  insertServiceSchema, 
  insertClientSchema, 
  insertAppointmentSchema, 
  insertProductSchema, 
  insertSaleSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  };

  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const dashboardData = await storage.getDashboardData();
      res.json(dashboardData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Barbers CRUD
  app.get("/api/barbers", async (req, res) => {
    try {
      const barbers = await storage.getBarbers();
      res.json(barbers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch barbers" });
    }
  });

  app.get("/api/barbers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const barber = await storage.getBarber(id);
      
      if (!barber) {
        return res.status(404).json({ message: "Barber not found" });
      }
      
      res.json(barber);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch barber" });
    }
  });

  app.post("/api/barbers", async (req, res) => {
    try {
      const barberData = insertBarberSchema.parse(req.body);
      const barber = await storage.createBarber(barberData);
      res.status(201).json(barber);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/barbers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const barberData = insertBarberSchema.partial().parse(req.body);
      const barber = await storage.updateBarber(id, barberData);
      
      if (!barber) {
        return res.status(404).json({ message: "Barber not found" });
      }
      
      res.json(barber);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/barbers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBarber(id);
      
      if (!success) {
        return res.status(404).json({ message: "Barber not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete barber" });
    }
  });

  // Services CRUD
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, serviceData);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteService(id);
      
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Clients CRUD
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Appointments CRUD
  app.get("/api/appointments", async (req, res) => {
    try {
      const { details, date } = req.query;
      
      if (details === 'true' && date) {
        const appointments = await storage.getAppointmentsByDate(date as string);
        return res.json(appointments);
      }
      
      if (details === 'true') {
        const appointments = await storage.getAppointmentsWithDetails();
        return res.json(appointments);
      }
      
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { details } = req.query;
      
      if (details === 'true') {
        const appointment = await storage.getAppointmentWithDetails(id);
        
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        
        return res.json(appointment);
      }
      
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, appointmentData);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAppointment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Products CRUD
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Sales CRUD
  app.get("/api/sales", async (req, res) => {
    try {
      const { details, date } = req.query;
      
      if (details === 'true' && date) {
        const sales = await storage.getSalesByDate(date as string);
        return res.json(sales);
      }
      
      if (details === 'true') {
        const sales = await storage.getSalesWithDetails();
        return res.json(sales);
      }
      
      const sales = await storage.getSales();
      res.json(sales);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { details } = req.query;
      
      if (details === 'true') {
        const sale = await storage.getSaleWithDetails(id);
        
        if (!sale) {
          return res.status(404).json({ message: "Sale not found" });
        }
        
        return res.json(sale);
      }
      
      const sale = await storage.getSale(id);
      
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.json(sale);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      res.status(201).json(sale);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const saleData = insertSaleSchema.partial().parse(req.body);
      const sale = await storage.updateSale(id, saleData);
      
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.json(sale);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSale(id);
      
      if (!success) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
