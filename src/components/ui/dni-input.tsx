import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const DNI_PREFIXES = [
  { value: 'V', label: 'V' },
  { value: 'E', label: 'E' },
  { value: 'J', label: 'J' },
]

interface DniInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  disabled?: boolean
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function DniInput({ value, onChange, placeholder = 'Ej: 12345678', id, disabled, onKeyDown }: DniInputProps) {
  const prefix = value ? value.charAt(0).toUpperCase() : 'V'
  const number = value ? value.slice(1) : ''

  const handlePrefixChange = (newPrefix: string) => {
    onChange(newPrefix + number)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, '')
    onChange(prefix + newNumber)
  }

  return (
    <div className="flex gap-2">
      <Select
        value={prefix}
        onChange={(e) => handlePrefixChange(e.target.value)}
        disabled={disabled}
        className="w-20"
      >
        {DNI_PREFIXES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </Select>
      <Input
        id={id}
        type="text"
        value={number}
        onChange={handleNumberChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  )
}
