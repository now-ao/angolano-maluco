import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CostCenter } from '@/lib/db/schema';
import { costCenterService } from '@/lib/services/costCenterService';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CostCenters() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const data = await costCenterService.getAll();
    setCostCenters(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await costCenterService.create({
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        parent_id: undefined,
        budget: Number(formData.get('budget')) || 0,
        active: true,
      });

      toast.success('Centro de custo criado!');
      setIsDialogOpen(false);
      loadData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error('Erro ao criar centro de custo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Centros de Custo" description="Organize despesas por departamento ou projeto" />

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Novo Centro de Custo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Centro de Custo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input id="code" name="code" required maxLength={20} placeholder="CC001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento (R$)</Label>
                  <Input id="budget" name="budget" type="number" step="0.01" defaultValue="0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" required maxLength={200} placeholder="Ex: Departamento Financeiro" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" rows={3} maxLength={500} />
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
              <TableHead>Descrição</TableHead>
              <TableHead>Orçamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCenters.map((cc) => (
              <TableRow key={cc.id}>
                <TableCell className="font-medium">{cc.code}</TableCell>
                <TableCell>{cc.name}</TableCell>
                <TableCell className="max-w-xs truncate">{cc.description || '-'}</TableCell>
                <TableCell>R$ {cc.budget.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={cc.active ? 'default' : 'secondary'}>
                    {cc.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
