import { LoaderCircle, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { TouchButton } from '../ui/TouchButton'
import { formatBrazilianPhone, isValidBrazilianPhone, digitsOnly } from '../../utils/phone'

interface CreateAccessFormProps {
  initialPhone: string
  isLoading: boolean
  onSubmit: (input: { fullName: string; phone: string; email: string }) => void
  onCancel: () => void
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export function CreateAccessForm({ initialPhone, isLoading, onSubmit, onCancel }: CreateAccessFormProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState(initialPhone)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (fullName.trim().length < 2) {
      setError('Digite seu nome completo.')
      return
    }
    const phoneDigits = digitsOnly(phone)
    if (!isValidBrazilianPhone(phoneDigits)) {
      setError('Digite um celular válido com DDD.')
      return
    }
    if (!isValidEmail(email.trim())) {
      setError('Digite um e-mail válido.')
      return
    }
    setError(null)
    onSubmit({ fullName: fullName.trim(), phone: phoneDigits, email: email.trim() })
  }

  return <div className="access-panel">
    <UserPlus aria-hidden="true" />
    <div><h2>Criar acesso</h2><p>Só precisamos de nome, celular e e-mail para guardar suas preferências e dicas.</p></div>
    <form className="phone-access-form" onSubmit={handleSubmit}>
      <label htmlFor="create-access-name">Nome completo</label>
      <input id="create-access-name" type="text" autoComplete="name" placeholder="Seu nome" value={fullName} onChange={(event) => setFullName(event.target.value)} />

      <label htmlFor="create-access-phone">Celular</label>
      <input id="create-access-phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="(11) 99999-9999" value={formatBrazilianPhone(phone)} maxLength={15} onChange={(event) => setPhone(digitsOnly(event.target.value))} />

      <label htmlFor="create-access-email">E-mail</label>
      <input id="create-access-email" type="email" autoComplete="email" placeholder="voce@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />

      {error && <p className="form-error" role="alert">{error}</p>}
      <TouchButton type="submit" disabled={isLoading}>{isLoading && <LoaderCircle className="loading-icon" aria-hidden="true" />} {isLoading ? 'Criando acesso...' : 'Criar meu acesso'}</TouchButton>
    </form>
    <TouchButton variant="secondary" onClick={onCancel}>Voltar</TouchButton>
  </div>
}
