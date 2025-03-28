import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import ProductForm from "./ProductForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSearch } from "@/hooks/useSearch";

export default function Products() {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { searchTerm, searchResults, handleSearch } = useSearch<Product>(
    products,
    ['name', 'description', 'category']
  );

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Produto removido",
        description: "O produto foi removido com sucesso",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao remover produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  const handleCloseForm = () => {
    setOpen(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    queryClient.invalidateQueries({ queryKey: ['/api/products'] });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Get stock status
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { class: 'bg-red-100 text-red-800', text: 'Sem estoque' };
    if (stock < 5) return { class: 'bg-yellow-100 text-yellow-800', text: 'Baixo' };
    return { class: 'bg-green-100 text-green-800', text: 'Disponível' };
  };

  return (
    <div className="py-6">
      <div className="mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Produtos</h2>
            <p className="mt-1 text-sm text-gray-600">Gerencie o inventário de produtos da barbearia</p>
          </div>
          <Button 
            onClick={() => setOpen(true)}
            className="inline-flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Novo Produto
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
                placeholder="Buscar produto..." 
                type="search"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Carregando produtos...</p>
          </div>
        ) : error ? (
          <Alert className="mt-6" variant="destructive">
            <AlertDescription>
              Erro ao carregar produtos: {error instanceof Error ? error.message : 'Erro desconhecido'}
            </AlertDescription>
          </Alert>
        ) : searchResults.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map(product => (
              <Card key={product.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-md flex items-center justify-center">
                      <i className="fas fa-shopping-bag text-purple-600"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <div className="mt-1 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          <span className={`w-2 h-2 mr-1 rounded-full ${product.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {product.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatus(product.stock).class}`}>
                          {getStockStatus(product.stock).text}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">{product.description || 'Sem descrição'}</p>
                  </div>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Preço</p>
                        <p className="font-medium text-gray-900">{formatCurrency(product.price)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Estoque</p>
                        <p className="font-medium text-gray-900">{product.stock} unidades</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Categoria</p>
                        <p className="font-medium text-gray-900">{product.category || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(product)}
                    className="inline-flex items-center"
                  >
                    <i className="fas fa-edit mr-1.5"></i> Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(product)}
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <ProductForm 
            product={editingProduct} 
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
              Esta ação não pode ser desfeita. Isso removerá permanentemente o produto{' '}
              <span className="font-semibold">{productToDelete?.name}</span> do sistema.
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
