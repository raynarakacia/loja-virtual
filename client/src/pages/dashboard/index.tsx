import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardData {
  todayAppointments: number;
  todayClientsServed: number;
  todayRevenue: number;
  todayProductsSold: number;
  barberPerformance: { name: string; clients: number }[];
  topServices: { name: string; percentage: number }[];
}

interface AppointmentWithDetails {
  id: number;
  date: string;
  time: string;
  status: string;
  notes: string;
  client: {
    id: number;
    name: string;
    phone: string;
  };
  barber: {
    id: number;
    name: string;
  };
  service: {
    id: number;
    name: string;
    price: number;
  };
}

export default function Dashboard() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const { data: dashboardData = {
    todayAppointments: 0,
    todayClientsServed: 0,
    todayRevenue: 0,
    todayProductsSold: 0,
    barberPerformance: [],
    topServices: []
  } as DashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });
  
  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ['/api/appointments', { details: true, date: today }],
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format date in pt-BR
  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'waiting':
        return 'Aguardando';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  if (dashboardLoading || appointmentsLoading) {
    return (
      <div className="py-6">
        <div className="mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800">Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800">Visão Geral da Barbearia</h2>
        <p className="mt-1 text-sm text-gray-600">Bem-vindo ao BarberHub, seu sistema de gerenciamento de barbearia</p>
        
        {/* Dashboard stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <i className="fas fa-calendar-check text-white"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Agendamentos do Dia</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{dashboardData?.todayAppointments || 0}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-50 px-5 py-3 border-t">
              <div className="text-sm">
                <Link href="/appointments" className="font-medium text-blue-600 hover:text-blue-800">Ver todos</Link>
              </div>
            </div>
          </Card>
          
          {/* Card 2 */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-600 rounded-md p-3">
                  <i className="fas fa-user-check text-white"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Clientes Atendidos - Hoje</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{dashboardData?.todayClientsServed || 0}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-50 px-5 py-3 border-t">
              <div className="text-sm">
                <Link href="/reports" className="font-medium text-amber-600 hover:text-amber-800">Ver relatório</Link>
              </div>
            </div>
          </Card>
          
          {/* Card 3 */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <i className="fas fa-money-bill-wave text-white"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Faturamento do Dia</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{formatCurrency(dashboardData?.todayRevenue || 0)}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-50 px-5 py-3 border-t">
              <div className="text-sm">
                <Link href="/sales" className="font-medium text-green-600 hover:text-green-700">Ver detalhes</Link>
              </div>
            </div>
          </Card>
          
          {/* Card 4 */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <i className="fas fa-store text-white"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Produtos Vendidos</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{dashboardData?.todayProductsSold || 0}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-50 px-5 py-3 border-t">
              <div className="text-sm">
                <Link href="/products" className="font-medium text-purple-600 hover:text-purple-700">Ver inventário</Link>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Appointments for today */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Agendamentos de Hoje</h3>
            <p className="text-sm text-gray-500 italic">{formatDate(new Date())}</p>
          </div>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            {todayAppointments && todayAppointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbeiro</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todayAppointments.filter(appointment => 
                      appointment && appointment.client && appointment.service && appointment.barber
                    ).map(appointment => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <i className="fas fa-user text-gray-600"></i>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.client.name}</div>
                              <div className="text-sm text-gray-500">{appointment.client.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.service.name}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(appointment.service.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.barber.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/appointments?edit=${appointment.id}`} className="text-blue-600 hover:text-blue-900 mr-3">Editar</Link>
                          <button className="text-red-600 hover:text-red-900">Cancelar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">Não há agendamentos para hoje.</p>
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <Link href="/appointments" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Ver todos os agendamentos
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
        
        {/* Charts and stats - 2 columns layout */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Performance per barber */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Desempenho por Barbeiro - Semanal</h3>
            <div className="space-y-4">
              {dashboardData?.barberPerformance.map((barber, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-gray-700">{barber.name}</div>
                    <div className="text-sm font-medium text-gray-700">{barber.clients} clientes</div>
                  </div>
                  <div className="overflow-hidden bg-gray-200 h-2 rounded-full">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (barber.clients / (dashboardData.barberPerformance[0]?.clients || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Top services */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Serviços Mais Populares</h3>
            <ul className="divide-y divide-gray-200">
              {dashboardData?.topServices.map((service, index) => (
                <li key={index} className="py-3 flex justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-cut text-amber-600 mr-3"></i>
                    <span className="text-sm font-medium text-gray-900">{service.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{service.percentage}%</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
