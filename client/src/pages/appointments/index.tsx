import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AppointmentWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import AppointmentForm from "./AppointmentForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Appointments() {
  const [open, setOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today as default

  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Parse location for edit param
  const params = new URLSearchParams(location.split('?')[1]);
  const editIdFromUrl = params.get('edit');
  
  // If edit param is present, open the form for editing
  if (editIdFromUrl && !editingAppointmentId && !open) {
    setEditingAppointmentId(parseInt(editIdFromUrl));
    setOpen(true);
    // Remove the param from URL
    setLocation('/appointments', { replace: true });
  }

  const { data: appointments = [], isLoading, error } = useQuery<AppointmentWithDetails[]>({
    queryKey: ['/api/appointments', { details: true, date: selectedDate }],
  });

  const { data: editingAppointment } = useQuery<AppointmentWithDetails>({
    queryKey: ['/api/appointments', editingAppointmentId, { details: true }],
    enabled: !!editingAppointmentId,
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Agendamento removido",
        description: "O agendamento foi removido com sucesso",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao remover agendamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Status atualizado",
        description: "O status do agendamento foi atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });

  const handleEdit = (appointment: AppointmentWithDetails) => {
    setEditingAppointmentId(appointment.id);
    setOpen(true);
  };

  const handleDelete = (appointment: AppointmentWithDetails) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (appointmentToDelete) {
      deleteAppointmentMutation.mutate(appointmentToDelete.id);
    }
  };

  const handleCloseForm = () => {
    setOpen(false);
    setEditingAppointmentId(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleStatusChange = (id: number, status: string) => {
    updateAppointmentStatusMutation.mutate({ id, status });
  };

  // Format date
  const formatDateDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, d 'de' MMMM", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  // Get status class and text
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
      case 'scheduled':
        return 'Agendado';
      default:
        return status;
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="py-6">
      <div className="mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Agendamentos</h2>
            <p className="mt-1 text-sm text-gray-600">Gerencie os agendamentos da barbearia</p>
          </div>
          <Button 
            onClick={() => setOpen(true)}
            className="inline-flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Novo Agendamento
          </Button>
        </div>
        
        {/* Date selector */}
        <div className="mt-6 flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/4">
            <div className="flex items-center">
              <span className="mr-3 text-sm font-medium text-gray-700">Data:</span>
              <Input 
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="flex-grow"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500 italic">
            {formatDateDisplay(selectedDate)}
          </div>
        </div>
        
        {isLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Carregando agendamentos...</p>
          </div>
        ) : error ? (
          <Alert className="mt-6" variant="destructive">
            <AlertDescription>
              Erro ao carregar agendamentos: {error instanceof Error ? error.message : 'Erro desconhecido'}
            </AlertDescription>
          </Alert>
        ) : appointments.length === 0 ? (
          <Card className="mt-6 p-8 text-center">
            <div className="flex flex-col items-center">
              <i className="far fa-calendar-alt text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum agendamento encontrado</h3>
              <p className="text-gray-500 mb-4">Não há agendamentos para a data selecionada.</p>
              <Button onClick={() => setOpen(true)}>
                <i className="fas fa-plus mr-2"></i> Adicionar Agendamento
              </Button>
            </div>
          </Card>
        ) : (
          <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                  {appointments.map(appointment => (
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
                        <select 
                          className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusClass(appointment.status)} border-0 bg-transparent cursor-pointer`}
                          value={appointment.status}
                          onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                        >
                          <option value="waiting">Aguardando</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(appointment)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(appointment)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancelar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <AppointmentForm 
            appointment={editingAppointment} 
            onSuccess={handleFormSuccess} 
            onCancel={handleCloseForm}
            selectedDate={selectedDate}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso cancelará o agendamento para{' '}
              <span className="font-semibold">{appointmentToDelete?.client.name}</span> no dia{' '}
              <span className="font-semibold">{appointmentToDelete?.date}</span> às{' '}
              <span className="font-semibold">{appointmentToDelete?.time}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Input component copied from the shadcn components
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  );
}
