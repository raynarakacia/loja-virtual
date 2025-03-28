import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Client } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import ClientForm from "./ClientForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSearch } from "@/hooks/useSearch";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Clients() {
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { searchTerm, searchResults, handleSearch } = useSearch<Client>(
    clients,
    ['name', 'phone', 'email']
  );

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao remover cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setOpen(true);
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
    }
  };

  const handleCloseForm = () => {
    setOpen(false);
    setEditingClient(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <div className="py-6">
      <div className="mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Clientes</h2>
            <p className="mt-1 text-sm text-gray-600">Gerencie os clientes da barbearia</p>
          </div>
          <Button 
            onClick={() => setOpen(true)}
            className="inline-flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Novo Cliente
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
                placeholder="Buscar cliente..." 
                type="search"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Carregando clientes...</p>
          </div>
        ) : error ? (
          <Alert className="mt-6" variant="destructive">
            <AlertDescription>
              Erro ao carregar clientes: {error instanceof Error ? error.message : 'Erro desconhecido'}
            </AlertDescription>
          </Alert>
        ) : searchResults.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map(client => (
              <Card key={client.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <i className="fas fa-user text-gray-600 text-2xl"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.phone}</p>
                      {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Data de Nascimento</p>
                        <p className="font-medium text-gray-900">{client.birthdate ? formatDate(client.birthdate) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cliente desde</p>
                        <p className="font-medium text-gray-900">{client.createdAt ? format(new Date(client.createdAt), 'MMM yyyy', { locale: ptBR }) : 'N/A'}</p>
                      </div>
                    </div>
                    
                    {client.notes && (
                      <div className="mt-4">
                        <p className="text-gray-500">Observações</p>
                        <p className="font-medium text-gray-900 text-sm">{client.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(client)}
                    className="inline-flex items-center"
                  >
                    <i className="fas fa-edit mr-1.5"></i> Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(client)}
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

      {/* Add/Edit Client Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <ClientForm 
            client={editingClient} 
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
              Esta ação não pode ser desfeita. Isso removerá permanentemente o cliente{' '}
              <span className="font-semibold">{clientToDelete?.name}</span> do sistema.
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
