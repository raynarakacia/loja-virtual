import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Barber } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import BarberForm from "./BarberForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSearch } from "@/hooks/useSearch";

export default function Barbers() {
  const [open, setOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [barberToDelete, setBarberToDelete] = useState<Barber | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: barbers = [], isLoading, error } = useQuery<Barber[]>({
    queryKey: ['/api/barbers'],
  });

  const { searchTerm, searchResults, handleSearch } = useSearch<Barber>(
    barbers,
    ['name', 'phone', 'email', 'specialty']
  );

  const deleteBarberMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/barbers/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/barbers'] });
      toast({
        title: "Barbeiro removido",
        description: "O barbeiro foi removido com sucesso",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao remover barbeiro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setOpen(true);
  };

  const handleDelete = (barber: Barber) => {
    setBarberToDelete(barber);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (barberToDelete) {
      deleteBarberMutation.mutate(barberToDelete.id);
    }
  };

  const handleCloseForm = () => {
    setOpen(false);
    setEditingBarber(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    queryClient.invalidateQueries({ queryKey: ['/api/barbers'] });
  };

  return (
    <div className="py-6">
      <div className="mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Barbeiros</h2>
            <p className="mt-1 text-sm text-gray-600">Gerencie sua equipe de profissionais</p>
          </div>
          <Button 
            onClick={() => setOpen(true)}
            className="inline-flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Novo Barbeiro
          </Button>
        </div>
        
        {/* Search and filter */}
        <div className="mt-6 flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
                placeholder="Buscar barbeiro..." 
                type="search"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Carregando barbeiros...</p>
          </div>
        ) : error ? (
          <Alert className="mt-6" variant="destructive">
            <AlertDescription>
              Erro ao carregar barbeiros: {error instanceof Error ? error.message : 'Erro desconhecido'}
            </AlertDescription>
          </Alert>
        ) : searchResults.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Nenhum barbeiro encontrado.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map(barber => (
              <Card key={barber.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <i className="fas fa-user text-gray-600 text-2xl"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{barber.name}</h3>
                      <p className="text-sm text-gray-500">{barber.position}</p>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${barber.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          <span className={`w-2 h-2 mr-1 rounded-full ${barber.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {barber.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Telefone</p>
                        <p className="font-medium text-gray-900">{barber.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Entrada</p>
                        <p className="font-medium text-gray-900">{barber.startDate ? new Date(barber.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Especialidade</p>
                        <p className="font-medium text-gray-900">{barber.specialty || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{barber.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(barber)}
                    className="inline-flex items-center"
                  >
                    <i className="fas fa-edit mr-1.5"></i> Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(barber)}
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

      {/* Add/Edit Barber Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <BarberForm 
            barber={editingBarber} 
            onSuccess={handleFormSuccess} 
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente o barbeiro{' '}
              <span className="font-semibold">{barberToDelete?.name}</span> do sistema.
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
