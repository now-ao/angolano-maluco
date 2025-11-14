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
import { FixedAsset } from '@/lib/db/schema';
import { fixedAssetService } from '@/lib/services/fixedAssetService';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FixedAssets() {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const data = await fixedAssetService.getAll();
    setAssets(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const acquisitionValue = Number(formData.get('acquisition_value')) || 0;
      const usefulLife = Number(formData.get('useful_life_months')) || 12;
      const monthlyDepreciation = acquisitionValue / usefulLife;

      await fixedAssetService.create({
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        category: formData.get('category') as string,
        acquisition_date: new Date(formData.get('acquisition_date') as string).toISOString(),
        acquisition_value: acquisitionValue,
        useful_life_months: usefulLife,
        monthly_depreciation: monthlyDepreciation,
        accumulated_depreciation: 0,
        residual_value: Number(formData.get('residual_value')) || 0,
        location: formData.get('location') as string || undefined,
        status: 'active',
        notes: formData.get('notes') as string || undefined,
      });

      toast.success('Ativo fixo cadastrado!');
      setIsDialogOpen(false);
      loadData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error('Erro ao cadastrar ativo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      inactive: 'secondary',
      maintenance: 'default',
      disposed: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Ativo Fixo" description="Controle patrimonial e depreciação" />

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Novo Ativo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Ativo Fixo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input id="code" name="code" required maxLength={50} placeholder="AF001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Input id="category" name="category" required maxLength={100} placeholder="Veículos, Máquinas..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" required maxLength={200} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" rows={2} maxLength={1000} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acquisition_date">Data Aquisição *</Label>
                  <Input id="acquisition_date" name="acquisition_date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acquisition_value">Valor (R$) *</Label>
                  <Input id="acquisition_value" name="acquisition_value" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="useful_life_months">Vida Útil (meses) *</Label>
                  <Input id="useful_life_months" name="useful_life_months" type="number" required defaultValue="60" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="residual_value">Valor Residual (R$)</Label>
                  <Input id="residual_value" name="residual_value" type="number" step="0.01" defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input id="location" name="location" maxLength={200} placeholder="Depósito, Filial..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" rows={2} maxLength={1000} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Cadastrar'}
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
              <TableHead>Categoria</TableHead>
              <TableHead>Aquisição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Depreciação Acum.</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.code}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.category}</TableCell>
                <TableCell>{new Date(asset.acquisition_date).toLocaleDateString()}</TableCell>
                <TableCell>R$ {asset.acquisition_value.toFixed(2)}</TableCell>
                <TableCell>R$ {asset.accumulated_depreciation.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(asset.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
