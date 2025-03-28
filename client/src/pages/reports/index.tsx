import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SaleWithDetails, AppointmentWithDetails, Barber } from "@shared/schema";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell
} from "recharts";

export default function Reports() {
  // Date ranges for reports
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const last7Days = format(subDays(today, 6), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');

  // Get the actual date range based on selection
  const getDateRange = () => {
    switch (dateRange) {
      case 'today': return { start: todayStr, end: todayStr };
      case 'week': return { start: last7Days, end: todayStr };
      case 'month': return { start: monthStart, end: monthEnd };
    }
  };
  
  // Fetch barbers for reference
  const { data: barbers = [] } = useQuery<Barber[]>({
    queryKey: ['/api/barbers'],
  });
  
  // Fetch appointments for the date range - we'll filter on the client side
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ['/api/appointments', { details: true }],
  });
  
  // Fetch sales for the date range - we'll filter on the client side
  const { data: sales = [], isLoading: salesLoading } = useQuery<SaleWithDetails[]>({
    queryKey: ['/api/sales', { details: true }],
  });
  
  const isLoading = appointmentsLoading || salesLoading;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Filter data based on date range
  const range = getDateRange();
  const filteredAppointments = appointments.filter(appointment => {
    return appointment.date >= range.start && appointment.date <= range.end;
  });
  
  const filteredSales = sales.filter(sale => {
    return sale.date >= range.start && sale.date <= range.end;
  });
  
  // Calculate summary statistics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalAppointments = filteredAppointments.length;
  const completedAppointments = filteredAppointments.filter(a => a.status === 'completed').length;
  const productSales = filteredSales.filter(s => s.productId).length;
  
  // Prepare data for barber performance chart
  const barberPerformance = barbers.map(barber => {
    const barberAppointments = filteredAppointments.filter(a => a.barberId === barber.id);
    const completed = barberAppointments.filter(a => a.status === 'completed').length;
    const revenue = filteredSales
      .filter(s => s.appointmentId && s.appointment?.barberId === barber.id)
      .reduce((sum, sale) => sum + sale.totalPrice, 0);
    
    return {
      name: barber.name,
      appointments: barberAppointments.length,
      completed,
      revenue
    };
  }).sort((a, b) => b.completed - a.completed);
  
  // Prepare data for service popularity chart
  const serviceCount: Record<string, number> = {};
  filteredAppointments.forEach(appointment => {
    const serviceName = appointment.service.name;
    serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
  });
  
  const servicePopularity = Object.entries(serviceCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  // Prepare data for daily revenue chart (for week view)
  const dailyRevenue: Record<string, number> = {};
  
  if (dateRange === 'week') {
    // Initialize all days in the range
    let current = new Date(range.start);
    const end = new Date(range.end);
    while (current <= end) {
      const dateStr = format(current, 'yyyy-MM-dd');
      dailyRevenue[dateStr] = 0;
      current.setDate(current.getDate() + 1);
    }
    
    // Sum up sales by date
    filteredSales.forEach(sale => {
      dailyRevenue[sale.date] = (dailyRevenue[sale.date] || 0) + sale.totalPrice;
    });
  }
  
  const dailyRevenueData = Object.entries(dailyRevenue)
    .map(([date, amount]) => ({
      date: format(new Date(date), 'dd/MM'),
      amount
    }));
  
  // Prepare product sales data
  const productSalesData: Record<string, number> = {};
  filteredSales
    .filter(s => s.productId && s.product)
    .forEach(sale => {
      const productName = sale.product!.name;
      productSalesData[productName] = (productSalesData[productName] || 0) + sale.quantity;
    });
  
  const productSalesChartData = Object.entries(productSalesData)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5); // Top 5 products
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="py-6">
      <div className="mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Relatórios</h2>
            <p className="mt-1 text-sm text-gray-600">Análise de desempenho da barbearia</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={dateRange === 'today' ? 'default' : 'outline'}
              onClick={() => setDateRange('today')}
            >
              Hoje
            </Button>
            <Button 
              variant={dateRange === 'week' ? 'default' : 'outline'}
              onClick={() => setDateRange('week')}
            >
              Últimos 7 dias
            </Button>
            <Button 
              variant={dateRange === 'month' ? 'default' : 'outline'}
              onClick={() => setDateRange('month')}
            >
              Este mês
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <i className="fas fa-money-bill-wave text-white"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Faturamento Total</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{formatCurrency(totalRevenue)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>
              
              <Card className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <i className="fas fa-calendar-check text-white"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Atendimentos</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{completedAppointments} de {totalAppointments}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>
              
              <Card className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <i className="fas fa-shopping-bag text-white"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Produtos Vendidos</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">{productSales}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>
              
              <Card className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                    <i className="fas fa-cut text-white"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Serviços Mais Popular</dt>
                      <dd>
                        <div className="text-lg font-semibold text-gray-900">
                          {servicePopularity.length > 0 ? servicePopularity[0].name : 'N/A'}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Charts Section */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Barber Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Desempenho por Barbeiro</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barberPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Quantidade']} />
                      <Legend />
                      <Bar dataKey="appointments" name="Agendamentos" fill="#8884d8" />
                      <Bar dataKey="completed" name="Concluídos" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              {/* Service Popularity */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Serviços Mais Populares</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={servicePopularity}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {servicePopularity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} agendamentos`, 'Quantidade']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              {/* Daily Revenue Chart (only for week view) */}
              {dateRange === 'week' && (
                <Card className="p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Faturamento Diário</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dailyRevenueData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Faturamento']} />
                        <Legend />
                        <Bar dataKey="amount" name="Faturamento" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
              
              {/* Top Products */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Produtos Mais Vendidos</h3>
                {productSalesChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={productSalesChartData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip formatter={(value) => [`${value} unidades`, 'Quantidade']} />
                        <Legend />
                        <Bar dataKey="quantity" name="Quantidde" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center p-10">
                    <p className="text-gray-500">Nenhum produto vendido no período.</p>
                  </div>
                )}
              </Card>
            </div>
            
            {/* Additional data tables could be added here */}
          </>
        )}
      </div>
    </div>
  );
}

// Button component copied from the shadcn components
function Button({ 
  children, 
  variant = 'default',
  onClick,
  className,
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'outline'; 
  onClick?: () => void;
  className?: string;
}) {
  const baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  
  const variantClass = variant === 'default' 
    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
  
  return (
    <button
      className={`${baseClass} ${variantClass} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
