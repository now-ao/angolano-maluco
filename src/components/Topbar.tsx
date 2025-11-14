import { NavLink } from "@/components/NavLink";
import { 
  FileText, Wrench, FileCheck, DollarSign, BookOpen, 
  Building, Clock, Factory
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const advancedModules = [
  { title: "Orçamentos", path: "/orcamentos", icon: FileText, adminOnly: false },
  { title: "Ordens de Serviço", path: "/ordens-servico", icon: Wrench, adminOnly: false },
  { title: "Contratos", path: "/contratos", icon: FileCheck, adminOnly: true },
  { title: "Centro de Custos", path: "/centros-custo", icon: DollarSign, adminOnly: true },
  { title: "Plano de Contas", path: "/plano-contas", icon: BookOpen, adminOnly: true },
  { title: "Ativo Fixo", path: "/ativo-fixo", icon: Building, adminOnly: true },
  { title: "Ponto Eletrônico", path: "/ponto-eletronico", icon: Clock, adminOnly: true },
  { title: "Produção", path: "/ordens-producao", icon: Factory, adminOnly: true },
];

export function Topbar() {
  const { isAdmin } = useAuth();

  const visibleModules = advancedModules.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="border-b bg-card">
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-4 whitespace-nowrap">
          Módulos Avançados
        </span>
        {visibleModules.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm whitespace-nowrap",
              "hover:bg-accent hover:text-accent-foreground"
            )}
            activeClassName="bg-accent text-accent-foreground font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
