import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertSaleSchema, SaleWithDetails, Client, Product, AppointmentWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";

interface SaleFormProps {
  sale?: SaleWithDetails | null;
  onSuccess: () => void;
  onCancel: () => void;
  selectedDate?: string;
}

const formSchema = insertSaleSchema.extend({
  clientId: z.coerce.number().nullable(),
  productId: z.coerce.number().nullable(),
  appointmentId: z.coerce.number().nullable(),
  quantity: z.coerce.number().min(1, { message: "A quantidade deve ser pelo menos 1" }),
  totalPrice: z.coerce.number().min(0, { message: "O preço deve ser maior ou igual a zero" }),
  date: z.string().min(1, { message: "Selecione uma data" }),
  paymentMethod: z.string().min(1, { message: "Selecione um método de pagamento" }),
}).refine(data => data.productId !== null || data.appointmentId !== null, {
  message: "Selecione um produto ou um agendamento",
  path: ["productId"],
});

export default function SaleForm({ sale, onSuccess, onCancel, selectedDate }: SaleFormProps) {
  const { toast } = useToast();
  const isEditMode = !!sale;
  const [saleType, setSaleType] = useState<'product' | 'service'>(
    sale?.productId ? 'product' : 'service'
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: sale?.clientId || null,
      productId: sale?.productId || null,
      appointmentId: sale?.appointmentId || null,
      quantity: sale?.quantity || 1,
      totalPrice: sale?.totalPrice || 0,
      date: sale?.date || selectedDate || new Date().toISOString().split('T')[0],
      paymentMethod: sale?.paymentMethod || "credit",
      notes: sale?.notes || "",
    },
  });

  // Load necessary data for dropdowns
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: appointments = [] } = useQuery<AppointmentWithDetails[]>({
    queryKey: ['/api/appointments', { details: true }],
  });

  // Filter appointments for the selected date
  const dateValue = form.watch('date');
  const filteredAppointments = appointments.filter(
    app => app.date === dateValue && (app.status === 'completed' || app.status === 'confirmed')
  );

  // Update total price when product or quantity changes
  const productId = form.watch('productId');
  const appointmentId = form.watch('appointmentId');
  const quantity = form.watch('quantity');

  useEffect(() => {
    if (saleType === 'product' && productId) {
      const selectedProduct = products.find(p => p.id === Number(productId));
      if (selectedProduct) {
        form.setValue('totalPrice', selectedProduct.price * quantity);
      }
    } else if (saleType === 'service' && appointmentId) {
      const selectedAppointment = appointments.find(a => a.id === Number(appointmentId));
      if (selectedAppointment) {
        form.setValue('totalPrice', selectedAppointment.service.price);
        // Set the client automatically from the appointment
        form.setValue('clientId', selectedAppointment.clientId);
      }
    }
  }, [saleType, productId, appointmentId, quantity, products, appointments, form]);

  const createSaleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/sales", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Venda registrada com sucesso!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao registrar venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });

  const updateSaleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("PATCH", `/api/sales/${sale?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Venda atualizada com sucesso!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // If it's a product sale, clear appointment field
    if (saleType === 'product') {
      data.appointmentId = null;
    }
    // If it's a service sale, clear product field
    else if (saleType === 'service') {
      data.productId = null;
      data.quantity = 1; // Always 1 for services
    }

    if (isEditMode) {
      updateSaleMutation.mutate(data);
    } else {
      createSaleMutation.mutate(data);
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
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? 'Editar Venda' : 'Nova Venda'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Sale Type Selection */}
          <div className="space-y-2">
            <FormLabel>Tipo de Venda</FormLabel>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={saleType === 'product' ? 'default' : 'outline'}
                onClick={() => setSaleType('product')}
                className="flex-1"
              >
                <i className="fas fa-shopping-bag mr-2"></i> Produto
              </Button>
              <Button
                type="button"
                variant={saleType === 'service' ? 'default' : 'outline'}
                onClick={() => setSaleType('service')}
                className="flex-1"
              >
                <i className="fas fa-cut mr-2"></i> Serviço
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {saleType === 'product' && (
            <>
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products
                          .filter(product => product.status === 'active' && product.stock > 0)
                          .map(product => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - {formatCurrency(product.price)} - Estoque: {product.stock}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {saleType === 'service' && (
            <FormField
              control={form.control}
              name="appointmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agendamento</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um agendamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredAppointments.length === 0 ? (
                        <SelectItem value="no-appointments" disabled>
                          Nenhum agendamento disponível para esta data
                        </SelectItem>
                      ) : (
                        filteredAppointments.map(appointment => (
                          <SelectItem key={appointment.id} value={appointment.id.toString()}>
                            {appointment.time} - {appointment.client.name} - {appointment.service.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {saleType === 'product' && (
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente (opcional)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                    defaultValue={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name} - {client.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Total (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Método de Pagamento</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit" id="method-credit" />
                      <FormLabel htmlFor="method-credit" className="font-normal">
                        Cartão de Crédito
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="debit" id="method-debit" />
                      <FormLabel htmlFor="method-debit" className="font-normal">
                        Cartão de Débito
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="method-cash" />
                      <FormLabel htmlFor="method-cash" className="font-normal">
                        Dinheiro
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pix" id="method-pix" />
                      <FormLabel htmlFor="method-pix" className="font-normal">
                        PIX
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações sobre a venda" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createSaleMutation.isPending || updateSaleMutation.isPending}
            >
              {(createSaleMutation.isPending || updateSaleMutation.isPending) ? (
                <>Salvando...</>
              ) : (
                <>Salvar</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
