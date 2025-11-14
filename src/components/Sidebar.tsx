import { NavLink } from "@/components/NavLink";
import { 
  ShoppingCart, Package, Users, FileText, BarChart3, Settings, Wallet, LogOut,
  Building2, ShoppingBag, CreditCard, UsersRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Separator } from "./ui/separator";

const menuItems = [
  // Operações
  { title: "Vendas", path: "/", icon: ShoppingCart, adminOnly: false, section: "Operações" },
  { title: "Faturas", path: "/faturas", icon: FileText, adminOnly: false, section: "Operações" },
  { title: "Caixa", path: "/caixa", icon: Wallet, adminOnly: false, section: "Operações" },
  
  // Cadastros
  { title: "Produtos", path: "/produtos", icon: Package, adminOnly: true, section: "Cadastros" },
  { title: "Clientes", path: "/clientes", icon: Users, adminOnly: false, section: "Cadastros" },
  { title: "Fornecedores", path: "/fornecedores", icon: Building2, adminOnly: true, section: "Cadastros" },
  { title: "Funcionários", path: "/funcionarios", icon: UsersRound, adminOnly: true, section: "Cadastros" },
  
  // Compras & Despesas
  { title: "Compras", path: "/compras", icon: ShoppingBag, adminOnly: true, section: "Compras" },
  { title: "Despesas", path: "/despesas", icon: CreditCard, adminOnly: true, section: "Compras" },
  
  // Gestão
  { title: "Fluxo de Caixa", path: "/fluxo-caixa", icon: BarChart3, adminOnly: true, section: "Gestão" },
  { title: "Relatórios", path: "/relatorios", icon: BarChart3, adminOnly: true, section: "Gestão" },
  { title: "Configurações", path: "/configuracoes", icon: Settings, adminOnly: true, section: "Gestão" },
];

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);
  
  const sections = [...new Set(visibleMenuItems.map(item => item.section))];

  return (
    <aside className="w-64 bg-card border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          ERP System
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.name} ({user?.role === 'admin' ? 'Admin' : 'Caixista'})
        </p>
      </div>
      
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section}>
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {section}
            </h3>
            <div className="space-y-1">
              {visibleMenuItems
                .filter(item => item.section === section)
                .map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                      "hover:bg-accent hover:text-accent-foreground"
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
