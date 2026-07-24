import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TouchButton } from './TouchButton'

interface PageHeaderProps { title: string; subtitle?: string }

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="page-header">
      <TouchButton aria-label="Voltar" className="icon-button" variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft aria-hidden="true" />
      </TouchButton>
      <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
    </header>
  )
}
