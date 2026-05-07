
# Metro Heating & Cooling — Web Application Portal

## Overview
Transform the existing landing page into a full-featured portal with authentication, role-based access control (Client/Technician/Admin), a multi-step booking flow, admin and technician dashboards, and reporting.

---

## Database Changes

### New Tables
- **profiles** — `id` (uuid, FK to auth.users), `full_name`, `email`, `phone`, `address`, `role` reference, `created_at`
- **user_roles** — `id`, `user_id` (FK to auth.users), `role` (enum: `client`, `technician`, `admin`), unique on (user_id, role)
- **services** — `id`, `name`, `description`, `price`, `duration_minutes` (seeded with HVAC service types)
- **invoices** — `id`, `booking_id` (FK), `amount`, `status` (paid/pending/failed), `created_at`

### Modify Existing Table
- **bookings** — add columns: `user_id` (uuid, FK to auth.users), `technician_id` (uuid, nullable), `service_id` (uuid, FK to services), `status` (enum: pending/confirmed/in_progress/completed/cancelled), `notes` (text), `payment_status` (text)

### RLS Policies
- Clients can read/create their own bookings and profile
- Technicians can read bookings assigned to them and update job status
- Admins have full access (via `has_role()` security definer function)
- Profiles: users can read/update only their own row

### Security Definer Function
- `has_role(user_id, role)` — used in all RLS policies to prevent recursive checks

### Triggers
- Auto-create profile row on user signup (trigger on auth.users)

---

## Authentication

- Email/password signup and login (+ Google sign-in)
- Auth pages: `/login`, `/signup`
- Protected route wrapper that checks role and redirects unauthorized users
- Email confirmation left enabled (default behavior)

---

## New Pages & Routes

| Route | Role | Description |
|---|---|---|
| `/` | Public | Existing landing page (preserved as-is) |
| `/login` | Public | Login form |
| `/signup` | Public | Signup form |
| `/book` | Client | Multi-step booking wizard |
| `/profile` | Client | Personal details, booking history |
| `/technician` | Technician | Technician dashboard with job calendar/kanban |
| `/admin` | Admin | Admin dashboard with sidebar nav |
| `/admin/bookings` | Admin | Bookings data table |
| `/admin/users` | Admin | Users management table |
| `/admin/reports` | Admin | Charts + mock export |

---

## Feature Details

### 1. Multi-Step Booking Form (`/book`)
Four steps using shadcn Card/Stepper pattern:
1. **Select Service** — grid of HVAC service cards (AC Repair, Furnace Install, Maintenance, etc.)
2. **Pick Date/Time** — shadcn Calendar + time slot selector
3. **Review & Confirm** — summary of selection
4. **Payment** — mock Stripe checkout UI (card number placeholder, "Pay Now" button, generates invoice on success)

Toast notifications on booking creation and payment success.

### 2. Client Profile (`/profile`)
- Editable personal details form
- Table of past and upcoming bookings with status badges
- Cancel upcoming bookings

### 3. Admin Dashboard (`/admin`)
- Sidebar layout using shadcn Sidebar component
- **Dashboard**: summary stats cards (total bookings, revenue, active technicians) + Recharts line chart for monthly trends
- **Bookings**: shadcn DataTable with filters, status editing, technician assignment dropdown
- **Users**: DataTable listing all users, role editing, block/unblock toggle
- **Reports**: Recharts charts (monthly bookings, revenue breakdown) + "Export to Excel" button (mock download)

### 4. Technician Dashboard (`/technician`)
- Calendar/Kanban view of assigned jobs for current day/week
- Each job card shows client name, service, time, status
- Status update buttons: Pending → In Progress → Completed
- Toast notification on status change

### 5. Toast Notifications
- Booking created → success toast
- Payment succeeded → success toast
- Booking assigned to technician → info toast

---

## Technical Approach

- All new components in `src/components/` organized by feature (e.g., `booking/`, `admin/`, `technician/`, `auth/`)
- Role-based route protection via a `ProtectedRoute` component checking `user_roles` table
- Recharts for admin reporting charts
- Existing landing page and VoiceCallButton remain untouched
- Branding: dark navy (`#0F172A`) backgrounds, orange (`#f97316`) CTAs, Inter font — matching existing design tokens

---

## Implementation Order
1. Database migrations (tables, enums, RLS, triggers, seed services)
2. Auth pages (login, signup) + ProtectedRoute component
3. Client profile page
4. Multi-step booking form with mock payment
5. Admin dashboard with sidebar, bookings table, users table, reports
6. Technician dashboard with job calendar and status updates
