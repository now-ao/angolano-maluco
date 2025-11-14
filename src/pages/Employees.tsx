import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
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
import { employeeService } from '@/lib/services/employeeService';
import type { Employee } from '@/lib/db/schema';
import { PageHeader } from '@/components/PageHeader';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: 0,
    hire_date: new Date().toISOString().split('T')[0],
    address: '',
    city: '',
    state: '',
    zip_code: '',
    active: true,
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const data = await employeeService.getAll();
    setEmployees(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, {
          ...formData,
          hire_date: new Date(formData.hire_date).toISOString(),
        });
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        await employeeService.create({
          ...formData,
          hire_date: new Date(formData.hire_date).toISOString(),
        });
        toast.success('Funcionário cadastrado com sucesso!');
      }
      resetForm();
      loadEmployees();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar funcionário');
      console.error(error);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      document: employee.document,
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position,
      department: employee.department,
      salary: employee.salary,
      hire_date: new Date(employee.hire_date).toISOString().split('T')[0],
      address: employee.address || '',
      city: employee.city || '',
      state: employee.state || '',
      zip_code: employee.zip_code || '',
      active: employee.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este funcionário?')) {
      try {
        await employeeService.delete(id);
        toast.success('Funcionário excluído com sucesso!');
        loadEmployees();
      } catch (error) {
        toast.error('Erro ao excluir funcionário');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      document: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: 0,
      hire_date: new Date().toISOString().split('T')[0],
      address: '',
      city: '',
      state: '',
      zip_code: '',
      active: true,
    });
    setEditingEmployee(null);
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.document.includes(searchTerm) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayroll = employees
    .filter((e) => e.active)
    .reduce((sum, e) => sum + e.salary, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Funcionários"
        description="Gestão de recursos humanos"
        icon={Users}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total de Funcionários</div>
          <div className="text-2xl font-bold">{employees.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Funcionários Ativos</div>
          <div className="text-2xl font-bold">
            {employees.filter((e) => e.active).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Folha de Pagamento Total</div>
          <div className="text-2xl font-bold">R$ {totalPayroll.toFixed(2)}</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nome Completo *</Label>
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
                    <Label htmlFor="document">CPF *</Label>
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
                    <Label htmlFor="hire_date">Data de Admissão *</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) =>
                        setFormData({ ...formData, hire_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Cargo *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Departamento *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salário *</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      step="0.01"
                      required
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
                <TableHead>CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Salário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum funcionário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.document}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>R$ {employee.salary.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={employee.active ? 'default' : 'secondary'}>
                        {employee.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(employee.id)}
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
