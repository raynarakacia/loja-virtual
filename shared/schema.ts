import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Barbers table
export const barbers = pgTable("barbers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  specialty: text("specialty"),
  startDate: text("start_date"),
  about: text("about"),
  status: text("status").notNull().default("active"),
});

export const insertBarberSchema = createInsertSchema(barbers).omit({
  id: true,
});

export type InsertBarber = z.infer<typeof insertBarberSchema>;
export type Barber = typeof barbers.$inferSelect;

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: real("price").notNull(),
  status: text("status").notNull().default("active"),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  birthdate: text("birthdate"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  barberId: integer("barber_id").notNull(),
  serviceId: integer("service_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // HH:MM
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category"),
  status: text("status").notNull().default("active"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Sales table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  productId: integer("product_id"),
  appointmentId: integer("appointment_id"),
  quantity: integer("quantity").notNull().default(1),
  totalPrice: real("total_price").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  paymentMethod: text("payment_method").notNull(),
  notes: text("notes"),
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
});

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

// Extended types with additional info for UI display
export type AppointmentWithDetails = Appointment & {
  client: Client;
  barber: Barber;
  service: Service;
}

export type SaleWithDetails = Sale & {
  client?: Client;
  product?: Product;
  appointment?: AppointmentWithDetails;
}
