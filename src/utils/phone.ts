export const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, 11)

export const formatBrazilianPhone = (value: string) => {
  const digits = digitsOnly(value)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export const isValidBrazilianPhone = (value: string) => value.length === 10 || value.length === 11
