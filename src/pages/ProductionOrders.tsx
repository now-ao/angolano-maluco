import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProductionOrder } from '@/lib/db/schema';
import { productionOrderService } from '@/lib/services/productionOrderService';
import { productService } from '@/lib/services/productService';
import { toast } from 'sonner';
import { Factory, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProductionOrders() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [ordersData, productsData] = await Promise.all([
      productionOrderService.getAll(),
      productService.getAll(),
    ]);
    setOrders(ordersData.sort((a, b) => b.order_number - a.order_number));
    setProducts(productsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const productId = formData.get('product_id') as string;
      const product = products.find(p => p.id === productId);

      await productionOrderService.create({
        order_number: await productionOrderService.getNextOrderNumber(),
        product_id: productId,
        product_name: product?.name || '',
        quantity: Number(formData.get('quantity')) || 0,
        start_date: new Date(formData.get('start_date') as string).toISOString(),
        expected_completion: new Date(formData.get('expected_completion') as string).toISOString(),
        status: 'planned',
        materials: JSON.parse(formData.get('materials') as string || '[]'),
        labor_hours: 0,
        production_cost: 0,
        notes: formData.get('notes') as string || undefined,
      });

      toast.success('Ordem de produção criada!');
      setIsDialogOpen(false);
      loadData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error('Erro ao criar ordem de produção');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      planned: 'secondary',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Ordens de Produção" description="Controle de manufatura e produção" />

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nova Ordem</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Produção</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_id">Produto *</Label>
                  <Select name="product_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input id="quantity" name="quantity" type="number" step="0.01" required min="0.01" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data Início *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_completion">Previsão Conclusão *</Label>
                  <Input
                    id="expected_completion"
                    name="expected_completion"
                    type="date"
                    required
                    defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materials">Materiais (JSON)</Label>
                <Textarea
                  id="materials"
                  name="materials"
                  placeholder='[{"product_id":"id","product_name":"Nome","quantity_needed":10,"quantity_used":0}]'
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" rows={3} maxLength={1000} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Criar Ordem'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OP</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Previsão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Custo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.order_number}</TableCell>
                <TableCell>{order.product_name}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{new Date(order.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(order.expected_completion).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>R$ {order.production_cost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
