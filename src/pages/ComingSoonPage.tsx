import { Construction } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'

export function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return <section className="content-page"><PageHeader title={title} /><div className="coming-soon"><Construction aria-hidden="true" /><h2>Funcionalidade em desenvolvimento</h2><p>{description}</p></div></section>
}
