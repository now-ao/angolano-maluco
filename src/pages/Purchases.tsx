import { useState, useEffect } from 'react';
import { Plus, Search, Eye, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { purchaseService } from '@/lib/services/purchaseService';
import { supplierService } from '@/lib/services/supplierService';
import { productService } from '@/lib/services/productService';
import type { Purchase, Supplier, Product } from '@/lib/db/schema';
import { PageHeader } from '@/components/PageHeader';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Purchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const [formData, setFormData] = useState({
    supplier_id: '',
    status: 'pending' as const,
    discount: 0,
    notes: '',
  });

  const [items, setItems] = useState<Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [purchasesData, suppliersData, productsData] = await Promise.all([
      purchaseService.getAll(),
      supplierService.getActive(),
      productService.getAll(),
    ]);
    const activeProducts = productsData.filter(p => p.active);
    setPurchases(purchasesData);
    setSuppliers(suppliersData);
    setProducts(activeProducts);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', product_name: '', quantity: 1, unit_price: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].product_id = value;
        newItems[index].product_name = product.name;
        newItems[index].unit_price = product.cost_price;
        newItems[index].subtotal = product.cost_price * newItems[index].quantity;
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        newItems[index].subtotal = newItems[index].quantity * newItems[index].unit_price;
      }
    }
    setItems(newItems);
  };

  const getTotalAmount = () => items.reduce((sum, item) => sum + item.subtotal, 0);
  const getFinalAmount = () => getTotalAmount() - formData.discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    try {
      await purchaseService.create({
        ...formData,
        user_id: user.id,
        items,
        total_amount: getTotalAmount(),
        final_amount: getFinalAmount(),
      });
      toast.success('Pedido de compra criado!');
      resetForm();
      loadData();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao criar pedido');
    }
  };

  const handleReceive = async (purchase: Purchase) => {
    if (!user || !confirm('Confirmar recebimento? O estoque será atualizado.')) return;
    try {
      await purchaseService.receivePurchase(purchase.id, user.id);
      toast.success('Compra recebida! Estoque atualizado.');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao receber compra');
    }
  };

  const resetForm = () => {
    setFormData({ supplier_id: '', status: 'pending', discount: 0, notes: '' });
    setItems([]);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = { pending: 'secondary', approved: 'default', received: 'default', cancelled: 'destructive' };
    const labels: Record<string, string> = { pending: 'Pendente', approved: 'Aprovado', received: 'Recebido', cancelled: 'Cancelado' };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const filteredPurchases = purchases.filter((p) => {
    const supplier = suppliers.find((s) => s.id === p.supplier_id);
    return p.purchase_number.toString().includes(searchTerm) || supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="Compras" description="Gerencie pedidos de compra" icon={ShoppingCart} />
      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Nova Compra</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Novo Pedido de Compra</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fornecedor *</Label>
                    <Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })} required>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Itens</Label>
                    <Button type="button" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-2" />Adicionar</Button>
                  </div>
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Select value={item.product_id} onValueChange={(v) => updateItem(idx, 'product_id', v)}>
                          <SelectTrigger><SelectValue placeholder="Produto" /></SelectTrigger>
                          <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input type="number" placeholder="Qtd" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value))} min="0.01" step="0.01" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" placeholder="Preço" value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value))} min="0" step="0.01" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" value={item.subtotal.toFixed(2)} disabled className="bg-muted" />
                      </div>
                      <div className="col-span-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Desconto</Label>
                    <Input type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} min="0" step="0.01" />
                  </div>
                  <div>
                    <Label>Total</Label>
                    <Input value={getTotalAmount().toFixed(2)} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Total Final</Label>
                    <Input value={getFinalAmount().toFixed(2)} disabled className="bg-muted font-bold" />
                  </div>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">Criar Pedido</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma compra</TableCell></TableRow>
              ) : (
                filteredPurchases.map((purchase) => {
                  const supplier = suppliers.find((s) => s.id === purchase.supplier_id);
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>#{purchase.purchase_number}</TableCell>
                      <TableCell>{supplier?.name}</TableCell>
                      <TableCell>{new Date(purchase.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>R$ {purchase.final_amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPurchase(purchase)}><Eye className="h-4 w-4" /></Button>
                        {purchase.status === 'approved' && (
                          <Button variant="ghost" size="icon" onClick={() => handleReceive(purchase)} title="Receber Compra">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedPurchase && (
        <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Detalhes da Compra #{selectedPurchase.purchase_number}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fornecedor</Label>
                  <p className="text-sm">{suppliers.find((s) => s.id === selectedPurchase.supplier_id)?.name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedPurchase.status)}</div>
                </div>
              </div>
              <div>
                <Label>Itens</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPurchase.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>R$ {item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>R$ {item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end">
                <div>
                  <Label>Total</Label>
                  <p className="text-lg font-bold">R$ {selectedPurchase.final_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
