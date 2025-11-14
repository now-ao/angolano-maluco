import { useState, useEffect } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { expenseService } from '@/lib/services/expenseService';
import type { Expense } from '@/lib/db/schema';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Aluguel' },
  { value: 'utilities', label: 'Utilidades' },
  { value: 'salaries', label: 'Salários' },
  { value: 'supplies', label: 'Suprimentos' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'taxes', label: 'Impostos' },
  { value: 'insurance', label: 'Seguros' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'transport', label: 'Transporte' },
  { value: 'other', label: 'Outros' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'bank_transfer', label: 'Transferência' },
  { value: 'check', label: 'Cheque' },
];

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    category: 'other',
    amount: 0,
    payment_method: 'cash',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_number: '',
    notes: '',
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const data = await expenseService.getAll();
    setExpenses(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await expenseService.create({
        ...formData,
        user_id: user.id,
        category: formData.category as any,
        payment_method: formData.payment_method as any,
        expense_date: new Date(formData.expense_date).toISOString(),
      });
      toast.success('Despesa registrada com sucesso!');
      resetForm();
      loadExpenses();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao registrar despesa');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      category: 'other',
      amount: 0,
      payment_method: 'cash',
      expense_date: new Date().toISOString().split('T')[0],
      receipt_number: '',
      notes: '',
    });
  };

  const getCategoryLabel = (category: string) => {
    return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const getPaymentMethodLabel = (method: string) => {
    return PAYMENT_METHODS.find((m) => m.value === method)?.label || method;
  };

  const filteredExpenses = expenses.filter((e) =>
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Despesas"
        description="Controle de despesas operacionais"
        icon={Calendar}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total de Despesas</div>
          <div className="text-2xl font-bold text-red-600">
            R$ {totalExpenses.toFixed(2)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Despesas no Mês</div>
          <div className="text-2xl font-bold">
            {filteredExpenses.filter((e) => {
              const expenseMonth = new Date(e.expense_date).getMonth();
              const currentMonth = new Date().getMonth();
              return expenseMonth === currentMonth;
            }).length}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Despesa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_method">Forma de Pagamento *</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) =>
                        setFormData({ ...formData, payment_method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expense_date">Data *</Label>
                    <Input
                      id="expense_date"
                      type="date"
                      value={formData.expense_date}
                      onChange={(e) =>
                        setFormData({ ...formData, expense_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="receipt_number">Número do Recibo</Label>
                    <Input
                      id="receipt_number"
                      value={formData.receipt_number}
                      onChange={(e) =>
                        setFormData({ ...formData, receipt_number: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma despesa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.expense_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(expense.category)}</Badge>
                    </TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      R$ {expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getPaymentMethodLabel(expense.payment_method)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
