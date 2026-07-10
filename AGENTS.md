# Free System Villegas - Client

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19.2 |
| Build Tool | Vite 8.1 |
| Language | TypeScript 6.0 |
| Routing | React Router DOM 7.18 |
| State Management | Zustand 5.0 (with persist) |
| Server State | TanStack React Query 5.x |
| Forms | React Hook Form 7.x + Zod 4.x |
| HTTP Client | Axios 1.18 |
| Styling | Tailwind CSS 4.3 |
| UI Components | Custom shadcn-style (Radix Slot, CVA) |
| Icons | Lucide React |
| Toast Notifications | Sonner |
| ESLint | v10 with react-hooks, react-refresh plugins |

## Project Structure

```
src/
├── api/                    # API client modules
│   ├── client.ts           # Axios instance with interceptors
│   ├── auth.ts             # Login, register, profile
│   ├── athletes.ts         # CRUD athletes
│   ├── coaches.ts          # CRUD coaches + registerAthlete
│   ├── competitions.ts     # CRUD competitions, divisions, registrations
│   ├── gymPayments.ts      # CRUD gym payments + confirm
│   ├── gyms.ts             # CRUD gyms + details
│   ├── pagoMovil.ts        # CRUD pago movil
│   ├── persons.ts          # CRUD persons
│   ├── users.ts            # CRUD users
│   └── weights.ts          # Weight categories by gender/mode
├── components/
│   ├── layout/             # Layout, Header, Sidebar
│   ├── ui/                 # Badge, Button, Card, ConfirmDialog, DataTable, Input, Label, Pagination, Select, Table
│   └── ProtectedRoute.tsx  # Route guards (ProtectedRoute, GuestRoute)
├── hooks/
│   └── usePagination.ts    # Pagination state hook
├── lib/
│   ├── utils.ts            # cn() utility (clsx + tailwind-merge)
│   └── validations.ts      # Zod schemas for all forms
├── pages/
│   ├── Dashboard.tsx       # Role-based dashboard (Admin, Coach, Athlete)
│   ├── Login.tsx           # Login form
│   ├── Register.tsx        # Registration form
│   ├── athletes/           # Athlete list with create modal
│   ├── coaches/            # Coach list
│   ├── competitions/       # Competition list + registrations sub-page
│   ├── gyms/               # Gym list
│   ├── pago-movil/         # Pago movil management
│   └── payments/           # Gym payment management with confirm
├── stores/
│   ├── authStore.ts        # Auth state (token, user, gymId, isGymOwner)
│   └── uiStore.ts          # Sidebar toggle state
└── types/
    └── index.ts            # All TypeScript interfaces and enums
```

## Roles and Permissions

| Feature | ADMIN | COACH | ATHLETE |
|---------|-------|-------|---------|
| Dashboard | Full stats | Gym stats | Personal profile |
| Athletes | Full CRUD | Gym athletes only | Read-only |
| Coaches | Full CRUD | Gym coaches only | - |
| Gyms | Full CRUD | Read-only | - |
| Competitions | Full CRUD | Read-only | Read-only |
| Registrations | Full CRUD | Read-only | Read-only |
| Payments | Full CRUD + Confirm | Gym payments + Confirm | Create own payments |
| Pago Movil | Full CRUD | - | - |

## API Integration

### Base URL
Configured via `VITE_API_URL` env var, defaults to `http://localhost:3000`.

### Authentication
- JWT token stored in `auth-storage` localStorage via Zustand persist
- Axios interceptor adds `Authorization: Bearer <token>` to all requests
- 401 responses trigger automatic logout and redirect to `/login`

### Response Handling
API functions handle both formats:
```typescript
// Direct array
const data = await api.get('/endpoint')
// Paginated response
const data = await api.get('/endpoint') // { data: [], meta: {...} }
```

## Key Types

### AthleteProfile (from GET /athlete/profile/:id)
```typescript
interface AthleteProfile {
  id: string
  personal: { dni, name, surname, birthday, gender }
  gym: { id_gym, name, address, state, monthly_payment } | {}
  payments: Array<{ date, amount, reference, confirmed }>
  competitions: Array<{ competition, status, division: { mode, category, weight } }>
}
```

### GymPayment (from GET /gym-payment)
```typescript
interface GymPayment {
  id: string
  day_payed: string
  amount: number
  evidence_url?: string
  payment_reference: string  // Required
  athlete_id: string
  gym_id: string
  isConfirmed: boolean
  created_at: string
  updated_at: string
}
```

### CreateGymPaymentDto (POST /gym-payment)
```typescript
{
  day_payed: string      // ISO date-time, required
  amount: number         // Positive, max 2 decimals, required
  evidence_url?: string  // Optional, nullable
  payment_reference: string  // Required
  athlete_id: string     // UUID v4, required
  gym_id: string         // UUID v4, required
}
```

## Business Rules

### Athlete Payment Creation
- Athletes can create payments for their own gym
- `athlete_id` must be the Athlete ID (from `AthleteProfile.id`), NOT the User ID
- `gym_id` comes from `AthleteProfile.gym.id_gym`
- `payment_reference` is required
- New payments start with `isConfirmed: false`

### Athletes Without Gym
- API returns `gym: {}` (empty object) for athletes without assigned gym
- Frontend checks `Object.keys(profile.gym).length > 0` to detect this
- "Mi Gimnasio" and "Registrar Pago" sections are hidden for athletes without gym

### Competition Divisions
- API endpoints use hyphen: `/competition-division` (NOT `/competition/division`)
- `mode` field uses `FightingMode` enum: POINT_FIGHTING, KICK_LIGHT, LIGHT_CONTACT, FULL_CONTACT, LOW_KICK, K1, BOXING
- `category` field uses `FightingCategory` enum: CH, YC, OC, J, S, M

## Backend Notes

### AthleteGymResponseDto
Backend returns `id_gym` field (not `id`) in the gym object of athlete profile response.

### CompetitionDivisionDto
Backend `mode` field must use `FightingMode` enum decorator (not `FightingCategory`).

## Commands

```bash
# Development
npm run dev

# Build
npm run build  # tsc -b && vite build

# Lint
npm run lint   # eslint .

# Preview
npm run preview
```

## Code Conventions

- Functions declared before useEffect calls (React Compiler compatibility)
- Unused catch variables use `catch {}` (no error parameter)
- Spanish UI text, English commit messages (conventional commits)
- One commit per completed task
