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
import { TimeClock } from '@/lib/db/schema';
import { timeClockService } from '@/lib/services/timeClockService';
import { employeeService } from '@/lib/services/employeeService';
import { toast } from 'sonner';
import { Clock, Plus } from 'lucide-react';

export default function TimeClocks() {
  const [timeClocks, setTimeClocks] = useState<TimeClock[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [tcData, empData] = await Promise.all([
      timeClockService.getAll(),
      employeeService.getAll(),
    ]);
    setTimeClocks(tcData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setEmployees(empData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const clockIn = formData.get('clock_in') as string;
      const clockOut = formData.get('clock_out') as string;
      const lunchStart = formData.get('lunch_start') as string || undefined;
      const lunchEnd = formData.get('lunch_end') as string || undefined;

      const totalHours = timeClockService.calculateHours(clockIn, clockOut, lunchStart, lunchEnd);

      await timeClockService.create({
        employee_id: formData.get('employee_id') as string,
        date: new Date(formData.get('date') as string).toISOString(),
        clock_in: clockIn,
        clock_out: clockOut,
        lunch_start: lunchStart,
        lunch_end: lunchEnd,
        total_hours: totalHours,
        overtime_hours: Math.max(0, totalHours - 8),
        notes: formData.get('notes') as string || undefined,
      });

      toast.success('Registro de ponto criado!');
      setIsDialogOpen(false);
      loadData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error('Erro ao registrar ponto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Ponto Eletrônico" description="Controle de jornada de trabalho" />

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Registrar Ponto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Registro de Ponto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Funcionário *</Label>
                  <Select name="employee_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter(e => e.active).map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clock_in">Entrada *</Label>
                  <Input id="clock_in" name="clock_in" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clock_out">Saída *</Label>
                  <Input id="clock_out" name="clock_out" type="time" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lunch_start">Início Almoço</Label>
                  <Input id="lunch_start" name="lunch_start" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunch_end">Fim Almoço</Label>
                  <Input id="lunch_end" name="lunch_end" type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" rows={2} maxLength={500} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Registrar'}
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
              <TableHead>Funcionário</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Saída</TableHead>
              <TableHead>Almoço</TableHead>
              <TableHead>Total (h)</TableHead>
              <TableHead>Extra (h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeClocks.map((tc) => {
              const employee = employees.find(e => e.id === tc.employee_id);
              return (
                <TableRow key={tc.id}>
                  <TableCell>{employee?.name || '-'}</TableCell>
                  <TableCell>{new Date(tc.date).toLocaleDateString()}</TableCell>
                  <TableCell>{tc.clock_in || '-'}</TableCell>
                  <TableCell>{tc.clock_out || '-'}</TableCell>
                  <TableCell>
                    {tc.lunch_start && tc.lunch_end ? `${tc.lunch_start}-${tc.lunch_end}` : '-'}
                  </TableCell>
                  <TableCell>{tc.total_hours.toFixed(2)}</TableCell>
                  <TableCell className={tc.overtime_hours > 0 ? 'text-orange-600 font-medium' : ''}>
                    {tc.overtime_hours.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
