import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { supplierService } from '@/lib/services/supplierService';
import type { Supplier } from '@/lib/db/schema';
import { PageHeader } from '@/components/PageHeader';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    contact_person: '',
    active: true,
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    const data = await supplierService.getAll();
    setSuppliers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, formData);
        toast.success('Fornecedor atualizado com sucesso!');
      } else {
        await supplierService.create(formData);
        toast.success('Fornecedor cadastrado com sucesso!');
      }
      resetForm();
      loadSuppliers();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar fornecedor');
      console.error(error);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      document: supplier.document,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      zip_code: supplier.zip_code || '',
      contact_person: supplier.contact_person || '',
      active: supplier.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este fornecedor?')) {
      try {
        await supplierService.delete(id);
        toast.success('Fornecedor excluído com sucesso!');
        loadSuppliers();
      } catch (error) {
        toast.error('Erro ao excluir fornecedor');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      document: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      contact_person: '',
      active: true,
    });
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.document.includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Fornecedores"
        description="Gerencie seus fornecedores"
        icon={Building2}
      />

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="document">CNPJ *</Label>
                    <Input
                      id="document"
                      value={formData.document}
                      onChange={(e) =>
                        setFormData({ ...formData, document: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_person">Pessoa de Contato</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_person: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      maxLength={2}
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) =>
                        setFormData({ ...formData, zip_code: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
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
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum fornecedor encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.document}</TableCell>
                    <TableCell>{supplier.contact_person || '-'}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell>
                      {supplier.city && supplier.state
                        ? `${supplier.city}/${supplier.state}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.active ? 'default' : 'secondary'}>
                        {supplier.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
