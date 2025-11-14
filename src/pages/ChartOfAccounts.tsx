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
import { Checkbox } from '@/components/ui/checkbox';
import { ChartOfAccount } from '@/lib/db/schema';
import { chartOfAccountsService } from '@/lib/services/chartOfAccountsService';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const data = await chartOfAccountsService.getAll();
    setAccounts(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await chartOfAccountsService.create({
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        type: formData.get('type') as any,
        parent_id: undefined,
        level: Number(formData.get('level')) || 1,
        accept_entries: formData.get('accept_entries') === 'on',
        description: formData.get('description') as string || undefined,
        active: true,
      });

      toast.success('Conta contábil criada!');
      setIsDialogOpen(false);
      loadData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error('Erro ao criar conta');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: any }> = {
      asset: { label: 'Ativo', variant: 'default' },
      liability: { label: 'Passivo', variant: 'default' },
      equity: { label: 'Patrimônio', variant: 'default' },
      revenue: { label: 'Receita', variant: 'default' },
      expense: { label: 'Despesa', variant: 'destructive' },
    };
    const { label, variant } = types[type] || types.asset;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Plano de Contas" description="Estrutura contábil da empresa" />

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nova Conta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conta Contábil</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input id="code" name="code" required maxLength={20} placeholder="1.1.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Nível</Label>
                  <Input id="level" name="level" type="number" min="1" max="5" defaultValue="1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" required maxLength={200} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Ativo</SelectItem>
                    <SelectItem value="liability">Passivo</SelectItem>
                    <SelectItem value="equity">Patrimônio Líquido</SelectItem>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" rows={2} maxLength={500} />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="accept_entries" name="accept_entries" defaultChecked />
                <Label htmlFor="accept_entries">Aceita lançamentos</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Criar'}
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
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Lançamentos</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono font-medium">{account.code}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell>{getTypeBadge(account.type)}</TableCell>
                <TableCell>{account.level}</TableCell>
                <TableCell>
                  <Badge variant={account.accept_entries ? 'default' : 'secondary'}>
                    {account.accept_entries ? 'Sim' : 'Não'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={account.active ? 'default' : 'secondary'}>
                    {account.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
