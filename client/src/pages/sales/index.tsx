import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SaleWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import SaleForm from "./SaleForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Sales() {
  const [open, setOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleWithDetails | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<SaleWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today as default

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sales = [], isLoading, error } = useQuery<SaleWithDetails[]>({
    queryKey: ['/api/sales', { details: true, date: selectedDate }],
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sales/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      toast({
        title: "Venda removida",
        description: "A venda foi removida com sucesso",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao remover venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });

  const handleEdit = (sale: SaleWithDetails) => {
    setEditingSale(sale);
    setOpen(true);
  };

  const handleDelete = (sale: SaleWithDetails) => {
    setSaleToDelete(sale);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (saleToDelete) {
      deleteSaleMutation.mutate(saleToDelete.id);
    }
  };

  const handleCloseForm = () => {
    setOpen(false);
    setEditingSale(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // Format date
  const formatDateDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, d 'de' MMMM", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Get payment method display
  const getPaymentMethod = (method: string) => {
    switch (method) {
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      case 'cash': return 'Dinheiro';
      case 'pix': return 'PIX';
      default: return method;
    }
  };

  // Calculate total sales for the day
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);

  return (
    <div className="py-6">
      <div className="mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Vendas</h2>
            <p className="mt-1 text-sm text-gray-600">Gerencie as vendas e transações da barbearia</p>
          </div>
          <Button 
            onClick={() => setOpen(true)}
            className="inline-flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Nova Venda
          </Button>
        </div>
        
        {/* Date selector and sales summary */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-auto">
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium text-gray-700">Data:</span>
                <Input 
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-40"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 italic">
              {formatDateDisplay(selectedDate)}
            </div>
          </div>
          
          <div className="bg-green-50 px-4 py-2 rounded-md">
            <span className="text-sm font-medium text-gray-700 mr-2">Total do dia:</span>
            <span className="text-lg font-semibold text-green-700">{formatCurrency(totalSales)}</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Carregando vendas...</p>
          </div>
        ) : error ? (
          <Alert className="mt-6" variant="destructive">
            <AlertDescription>
              Erro ao carregar vendas: {error instanceof Error ? error.message : 'Erro desconhecido'}
            </AlertDescription>
          </Alert>
        ) : sales.length === 0 ? (
          <Card className="mt-6 p-8 text-center">
            <div className="flex flex-col items-center">
              <i className="fas fa-cash-register text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma venda encontrada</h3>
              <p className="text-gray-500 mb-4">Não há vendas registradas para a data selecionada.</p>
              <Button onClick={() => setOpen(true)}>
                <i className="fas fa-plus mr-2"></i> Registrar Venda
              </Button>
            </div>
          </Card>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5">
            {sales.map(sale => (
              <Card key={sale.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-md flex items-center justify-center">
                        {sale.productId ? (
                          <i className="fas fa-shopping-bag text-green-600"></i>
                        ) : (
                          <i className="fas fa-cut text-green-600"></i>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {sale.productId 
                            ? `Venda de Produto: ${sale.product?.name}` 
                            : `Venda de Serviço: ${sale.appointment?.service.name}`}
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <i className="far fa-clock mr-1"></i> {format(new Date(`${sale.date}T00:00:00`), 'dd/MM/yyyy')}
                          {sale.appointmentId && sale.appointment && ` às ${sale.appointment.time}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{formatCurrency(sale.totalPrice)}</div>
                      <div className="text-sm text-gray-600">{getPaymentMethod(sale.paymentMethod)}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Cliente</p>
                        <p className="font-medium text-gray-900">
                          {sale.clientId 
                            ? sale.client?.name 
                            : sale.appointment?.client.name || 'Cliente não especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Quantidade</p>
                        <p className="font-medium text-gray-900">{sale.quantity}</p>
                      </div>
                      {sale.appointmentId && sale.appointment && (
                        <div>
                          <p className="text-gray-500">Barbeiro</p>
                          <p className="font-medium text-gray-900">{sale.appointment.barber.name}</p>
                        </div>
                      )}
                    </div>
                    
                    {sale.notes && (
                      <div className="mt-4">
                        <p className="text-gray-500">Observações</p>
                        <p className="font-medium text-gray-900 text-sm">{sale.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(sale)}
                    className="inline-flex items-center"
                  >
                    <i className="fas fa-edit mr-1.5"></i> Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(sale)}
                    className="inline-flex items-center"
                  >
                    <i className="fas fa-trash-alt mr-1.5"></i> Remover
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Sale Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <SaleForm 
            sale={editingSale} 
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
              Esta ação não pode ser desfeita. Isso removerá permanentemente o registro de venda no valor de{' '}
              <span className="font-semibold">{saleToDelete ? formatCurrency(saleToDelete.totalPrice) : ''}</span>.
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
