# Free System Villegas - Client

Web platform for comprehensive management of martial arts and kickboxing gyms. A system built to manage athletes, coaches, gyms, competitions, and payments.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Roles and Permissions](#roles-and-permissions)
- [System Modules](#system-modules)
- [Architecture](#architecture)
- [API Integration](#api-integration)

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 19.2 |
| Build Tool | Vite | 8.1 |
| Language | TypeScript | 6.0 |
| Routing | React Router DOM | 7.18 |
| State Management | Zustand | 5.0 (with persist) |
| Server State | TanStack React Query | 5.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| HTTP Client | Axios | 1.18 |
| Styling | Tailwind CSS | 4.3 |
| UI Components | Custom components (shadcn-style) | - |
| Icons | Lucide React | 1.23 |
| Toast Notifications | Sonner | 2.0 |
| Linting | ESLint | 10.x |

---

## Project Structure

```
src/
├── api/                        # API client modules
│   ├── client.ts               # Axios instance with interceptors
│   ├── auth.ts                 # Login, register, profile
│   ├── athletes.ts             # CRUD athletes
│   ├── coaches.ts              # CRUD coaches + register athlete
│   ├── competitions.ts         # CRUD competitions, divisions, registrations
│   ├── gymPayments.ts          # CRUD gym payments + confirm
│   ├── gyms.ts                 # CRUD gyms + details
│   ├── pagoMovil.ts            # CRUD pago movil
│   ├── persons.ts              # CRUD persons
│   ├── users.ts                # CRUD users
│   ├── weights.ts              # Weight categories by gender/mode
│   ├── admin.ts                # Admin endpoints
│   └── adminCompetitions.ts    # Admin competition endpoints
├── components/
│   ├── layout/                 # Layout, Header, Sidebar
│   ├── forms/                  # Reusable forms
│   ├── tables/                 # Data tables
│   ├── ui/                     # Badge, Button, Card, ConfirmDialog, DataTable,
│   │                           #   DniInput, Input, Label, Pagination, Select, Table
│   ├── PersonSearch.tsx        # Person search by DNI
│   └── ProtectedRoute.tsx      # Route guards (ProtectedRoute, GuestRoute)
├── hooks/
│   └── usePagination.ts        # Pagination state hook
├── lib/
│   ├── utils.ts                # cn() utility (clsx + tailwind-merge)
│   └── validations.ts          # Zod schemas for all forms
├── pages/
│   ├── Dashboard.tsx           # Role-based dashboard (Admin, Coach, Athlete)
│   ├── Login.tsx               # Login form
│   ├── Register.tsx            # Registration form
│   ├── Unauthorized.tsx        # Unauthorized access page
│   ├── NotFound.tsx            # 404 page
│   ├── athletes/               # Athlete list with create modal
│   ├── coaches/                # Coach list
│   ├── competitions/           # Competition list + registrations sub-page
│   ├── gyms/                   # Gym list
│   ├── pago-movil/             # Pago movil management
│   ├── payments/               # Gym payment management with confirm
│   ├── profile/                # User profile
│   ├── settings/               # Settings
│   ├── users/                  # User management
│   ├── persons/                # Person management
│   ├── admin-coaches/          # Admin coach management
│   └── admin-athletes/         # Admin athlete management
├── stores/
│   ├── authStore.ts            # Auth state (token, user, gymId, isGymOwner)
│   └── uiStore.ts              # UI state (sidebar toggle)
├── types/
│   └── index.ts                # All TypeScript interfaces and enums
├── App.tsx                     # Root component
├── main.tsx                    # Entry point
├── router.tsx                  # Route definitions
└── index.css                   # Global styles and Tailwind theme
```

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- Free System Villegas backend API running

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-user/free-system-villegas-client.git
cd free-system-villegas-client
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your backend URL:

```
VITE_API_URL=http://localhost:3000
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` | No (default: `http://localhost:3000`) |

> **Note:** All client-side environment variables must start with the `VITE_` prefix to be exposed by Vite to the final bundle.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build (tsc + vite build) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint across the project |

---

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
| Users | Full CRUD | - | - |
| Persons | Full CRUD | - | - |

---

## System Modules

### Authentication

- Login with email and password
- New user registration (roles: Coach or Athlete)
- JWT stored in localStorage via Zustand persist
- User profile with personal information
- Role-based route protection

### Gym Management

- Full CRUD for gyms
- Fields: name, address, state (Venezuela), monthly fee, phone
- Pago movil payment methods associated with the gym
- Gym details with lists of athletes, coaches, and pago movil entries

### Athlete Management

- Athlete list with pagination
- Register and edit athletes by DNI
- Assign and unassign gyms
- Full profile with payment and competition history
- Promote athlete to coach

### Coach Management

- Coach list with pagination
- Register and edit coaches by DNI
- Assign to gym
- Register athletes from the coach panel
- Option to register as athlete to compete in competitions

### Competitions

- Competition CRUD with statuses: Draft, Open, Closed, Finished
- Divisions by gender, combat mode, and weight category
- Combat modes: Point Fighting, Kick Light, Light Contact, Full Contact, Low Kick, K1, Boxing
- Weight categories: Children, Youth, Older Children, Junior, Senior, Master
- Athlete registration for competitions
- Export registrations by gym

### Payments

- Monthly payment registration by athletes
- Payment confirmation by coaches and administrators
- Statuses: Pending / Confirmed
- Payment reference and optional evidence
- Payment history per athlete and per gym

### Pago Movil

- Pago movil data management for gyms
- Bank, national ID (DNI), and phone number
- Full CRUD (admin only)

### Admin Management

- Paginated user CRUD
- Paginated person CRUD with DNI search
- Administrative coach and athlete management
- Status toggle (activate/deactivate users)

---

## Architecture

### Application State

- **Zustand** with persist for authentication state (token, user, gym context)
- **Zustand** for UI state (sidebar open/closed)
- **TanStack React Query** configured with 5-minute staleTime and 1 retry

### Routing

- Protected routes with token and role verification
- Guest routes (login/register) that redirect to dashboard if already authenticated
- Nested routes under a shared Layout with Sidebar and Header

### Validation

- Zod schemas for client-side form validation
- Integration with React Hook Form via `@hookform/resolvers`
- Error messages in Spanish

### API Client

- Centralized Axios instance in `src/api/client.ts`
- Request interceptor: adds JWT token to Authorization header
- Response interceptor: centralized HTTP error handling (401, 400, 403, 404, 409, 429, 500)
- Automatic toast notifications via Sonner

---

## API Integration

The client communicates with the backend through the following API modules:

| Module | Endpoint | Operations |
|--------|----------|------------|
| `auth.ts` | `/auth/*` | login, register, profile |
| `athletes.ts` | `/athlete/*` | CRUD + profile + promote-to-coach |
| `coaches.ts` | `/coach/*` | CRUD + me + register-as-athlete |
| `competitions.ts` | `/competition/*`, `/competition-division/*`, `/competition-registration/*` | CRUD competitions, divisions, and registrations |
| `gyms.ts` | `/gym/*` | CRUD + details |
| `gymPayments.ts` | `/gym-payment/*` | CRUD + confirm |
| `pagoMovil.ts` | `/pago-movil/*` | CRUD |
| `persons.ts` | `/person/*` | CRUD + DNI search |
| `users.ts` | `/users/*` | CRUD |
| `weights.ts` | `/weights/*`, `/gym/weights/*` | Weight categories |
| `admin.ts` | `/admin/*` | Admin endpoints |
| `adminCompetitions.ts` | `/admin/competitions/*`, `/admin/competition-divisions/*` | Admin competition management |

---

## License

Private project. All rights reserved.
