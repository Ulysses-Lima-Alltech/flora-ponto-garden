import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HomeActionCardProps { title: string; description: string; to: string; icon: LucideIcon; tone: 'green' | 'purple' | 'yellow' | 'soft'; variant?: 'grid' | 'scanner' }

export function HomeActionCard({ title, description, to, icon: Icon, tone, variant = 'grid' }: HomeActionCardProps) {
  return <Link aria-label={`${title}. ${description}`} className={`home-action-card home-action-card--${tone} home-action-card--${variant}`} to={to}><span className="action-icon"><Icon aria-hidden="true" /></span><span className="action-content"><strong>{title}</strong><small>{description}</small></span><span className="action-arrow"><ChevronRight aria-hidden="true" /></span></Link>
}
