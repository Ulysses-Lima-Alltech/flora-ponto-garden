import { CircleHelp, CircleUserRound, Home, LayoutGrid } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useKioskStore } from '../../store/useKioskStore'

const navigationItems = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/categorias', label: 'Categorias', icon: LayoutGrid },
  { to: '/acesso', label: 'Meu acesso', icon: CircleUserRound },
  { to: '/ajuda', label: 'Ajuda', icon: CircleHelp },
]

export function BottomNavigation() {
  const hasActiveSession = useKioskStore((state) => state.customerSessionStatus === 'identified')

  return <nav className="bottom-navigation" aria-label="Navegação principal">{navigationItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} aria-label={label} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}><span className="nav-icon"><Icon aria-hidden="true" />{to === '/acesso' && hasActiveSession && <span className="session-indicator" aria-label="Acesso ativo" />}</span><span>{label}</span></NavLink>)}</nav>
}
