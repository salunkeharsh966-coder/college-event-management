# College Event Management &amp; Student Registration System

A full-stack college mini project built with **React (Vite + Bootstrap)**, **Java Spring Boot (Spring Data JPA / REST)** and **MySQL**.

Two roles: **Admin** and **Student**.

---

## 1. Features

### Student
| Feature | Page |
|---|---|
| Register a new account | `/register` |
| Log in | `/login` |
| Browse upcoming college events | `/events` |
| Search & filter events (keyword, department, status, upcoming-only) | `/events` |
| View full event details | `/events/:id` |
| Register for an event (seat check, deadline check, duplicate check) | `/events/:id` |
| View my registered events | `/student/dashboard` |
| Cancel my own registration | `/student/dashboard` |

### Admin
| Feature | Page |
|---|---|
| Log in | `/login` |
| Dashboard statistics (KPI cards, 2 bar charts, capacity utilisation) | `/admin/dashboard` |
| Create a new event | `/admin/events/new` |
| View / search all events | `/admin/events` |
| Update an event | `/admin/events/:id/edit` |
| Delete an event (cascades to its registrations) | `/admin/events` |
| View and manage all registrations | `/admin/registrations` |
| Mark a registration ATTENDED / CANCELLED, or delete it | `/admin/registrations` |

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, JavaScript, Bootstrap 5, React Router 6, Axios |
| Backend | Java 17, Spring Boot 3.2, Spring Data JPA, Hibernate, Bean Validation |
| Database | MySQL 8 |
| Password hashing | BCrypt (`spring-security-crypto`) |
| Build tools | npm, Maven |

Charting is done with plain CSS/SVG React components — no chart library — which keeps the project small and the logic easy to explain.

---

## 3. Folder structure

```
college-event-management/
│
├── README.md                     ← this file
├── PROJECT-DOCUMENTATION.md      ← report / viva notes
│
├── database/
│   ├── schema.sql                ← CREATE DATABASE + 3 tables + constraints
│   └── seed.sql                  ← sample users, events, registrations
│
├── backend/                      ← Spring Boot REST API (port 8080)
│   ├── pom.xml
│   └── src/main/
│       ├── resources/application.properties
│       └── java/com/college/eventmanagement/
│           ├── EventManagementApplication.java   ← main class
│           ├── entity/            User, Event, Registration, Role,
│           │                      EventStatus, RegistrationStatus
│           ├── repository/        UserRepository, EventRepository,
│           │                      RegistrationRepository
│           ├── dto/               RegisterRequest, LoginRequest, AuthResponse,
│           │                      UserResponse, EventRequest, EventResponse,
│           │                      RegistrationResponse, ApiResponse,
│           │                      DashboardStat, DashboardStatsResponse
│           ├── service/           AuthService, EventService, RegistrationService
│           ├── controller/        AuthController, EventController,
│           │                      RegistrationController, AdminController
│           ├── config/            PasswordConfig, WebConfig, AuthInterceptor,
│           │                      InterceptorConfig, DataSeeder
│           └── exception/         ResourceNotFoundException,
│                                  BadRequestException, GlobalExceptionHandler
│
└── frontend/                     ← React app (port 5173)
    ├── package.json
    ├── vite.config.js            ← dev server + /api proxy
    ├── index.html
    └── src/
        ├── main.jsx              ← entry point
        ├── App.jsx               ← all routes
        ├── styles/theme.css      ← colours, cards, badges, layout
        ├── services/api.js       ← axios instance + endpoint groups
        ├── context/              AuthContext, ToastContext
        ├── utils/format.js       ← date / time helpers
        ├── components/           Navbar, Footer, ToastStack, ProtectedRoute,
        │                         Spinner, EmptyState, EventCard, BarChart, StatCard
        └── pages/                HomePage, LoginPage, RegisterPage,
                                  EventListPage, EventDetailsPage,
                                  StudentDashboardPage, AdminDashboardPage,
                                  AdminEventsPage, AdminEventFormPage,
                                  AdminRegistrationsPage, NotFoundPage
```

---

## 4. Prerequisites

| Software | Version | Check with |
|---|---|---|
| Java JDK | 17 or newer | `java -version` |
| Maven | 3.8+ | `mvn -v` |
| MySQL | 8.x | `mysql --version` |
| Node.js | 18 or newer | `node -v` |
| npm | 9 or newer | `npm -v` |

---

## 5. Setup and run

### Step 1 — Create the database

Open a terminal in the project root and run:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

This creates the database `college_event_db` with three tables
(`users`, `events`, `registrations`) and inserts sample data.

> **Optional.** If you skip `seed.sql`, the backend's `DataSeeder` class inserts
> the same demo data automatically the first time it starts against an empty
> database. Run one or the other, not both — the seeder only acts when the
> `users` table is empty, so running both is harmless anyway.

Verify it worked:

```bash
mysql -u root -p -e "USE college_event_db; SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM events;"
```

### Step 2 — Configure the backend

Open `backend/src/main/resources/application.properties` and set **your** MySQL
username and password:

```properties
spring.datasource.username=root
spring.datasource.password=root      ← change this to your password
```

### Step 3 — Start the backend

```bash
cd backend
mvn spring-boot:run
```

Wait for this line in the console:

```
College Event Management API is running
Base URL : http://localhost:8080
```

Quick check — open <http://localhost:8080/api/events> in a browser. You should
see a JSON array of events.

### Step 4 — Start the frontend

Open a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

The browser opens automatically at <http://localhost:5173>.

---

## 6. Login credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@college.edu` | `admin123` |
| Student | `rahul@student.edu` | `student123` |
| Student | `sneha@student.edu` | `student123` |
| Student | `amit@student.edu` | `student123` |
| Student | `priya@student.edu` | `student123` |

The **Login page has clickable demo credentials** — clicking one fills the form,
so you do not have to type anything during the viva.

Passwords are stored as **BCrypt hashes**, never as plain text. You can confirm
this yourself:

```bash
mysql -u root -p -e "USE college_event_db; SELECT email, password FROM users LIMIT 2;"
```

---

## 7. REST API reference

Base URL: `http://localhost:8080/api`

### Authentication

| Method | Endpoint | Body / Params | Purpose |
|---|---|---|---|
| POST | `/auth/register` | `{fullName, email, password, phone, course, rollNumber}` | Create a student account |
| POST | `/auth/login` | `{email, password}` | Log in |
| GET | `/auth/me/{id}` | — | Current user profile |

### Events (public)

| Method | Endpoint | Params | Purpose |
|---|---|---|---|
| GET | `/events` | `keyword`, `department`, `status`, `upcoming` | List / search events |
| GET | `/events/{id}` | — | One event |
| GET | `/events/departments` | — | Distinct departments (filter dropdown) |
| GET | `/events/statuses` | — | All status values |

### Registrations (student)

| Method | Endpoint | Body / Params | Purpose |
|---|---|---|---|
| POST | `/registrations` | `{userId, eventId}` | Register for an event |
| GET | `/registrations/my/{userId}` | — | My registered events |
| DELETE | `/registrations/{id}/cancel` | `userId` | Cancel my registration |

### Admin (requires the `X-User-Id` header of an ADMIN user)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | Dashboard statistics |
| POST | `/admin/events` | Create event |
| PUT | `/admin/events/{id}` | Update event |
| DELETE | `/admin/events/{id}` | Delete event |
| GET | `/admin/registrations` | All registrations |
| GET | `/admin/events/{eventId}/registrations` | Registrations for one event |
| PUT | `/admin/registrations/{id}/status?value=ATTENDED` | Change status |
| DELETE | `/admin/registrations/{id}` | Delete a registration |

### Example requests (curl)

```bash
# Log in
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@college.edu\",\"password\":\"admin123\"}"

# List open Computer Science events
curl "http://localhost:8080/api/events?department=Computer%20Science&status=OPEN"

# Create an event (admin)
curl -X POST http://localhost:8080/api/admin/events \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d "{\"title\":\"AI Workshop\",\"description\":\"Intro session\",
       \"eventDate\":\"2026-12-10\",\"eventTime\":\"10:00:00\",
       \"venue\":\"Lab 1\",\"department\":\"Computer Science\",
       \"organizer\":\"Prof. Rao\",\"capacity\":40,
       \"registrationDeadline\":\"2026-12-05\",\"status\":\"OPEN\"}"
```

---

## 8. Database design

```
users                          events                    registrations
─────────────────              ──────────────────        ──────────────────
id            PK               id            PK          id            PK
full_name                      title                     user_id       FK → users.id
email         UNIQUE           description               event_id      FK → events.id
password (BCrypt)              event_date                status
phone                          event_time                registered_at
course                         venue
roll_number                    department                UNIQUE(user_id, event_id)
role (ADMIN|STUDENT)           organizer
created_at                     capacity
                               registration_deadline
                               status
                               created_by    FK → users.id
                               created_at / updated_at
```

**Relationships**

* `users (1) ──── (N) events` — an admin creates many events (`created_by`)
* `users (1) ──── (N) registrations` — a student has many registrations
* `events (1) ──── (N) registrations` — an event has many registrations

So `registrations` is a **junction table** with extra columns of its own
(`status`, `registered_at`). `UNIQUE(user_id, event_id)` is what makes
double registration impossible at the database level, not just in Java.

**Foreign keys**

* `registrations.user_id → users.id` `ON DELETE CASCADE`
* `registrations.event_id → events.id` `ON DELETE CASCADE`
* `events.created_by → users.id` `ON DELETE SET NULL`

---

## 9. Troubleshooting

| Problem | Cause and fix |
|---|---|
| `Communications link failure` on startup | MySQL is not running, or the password in `application.properties` is wrong. |
| `Unknown database 'college_event_db'` | `schema.sql` was not run. Run Step 1. |
| `Access denied for user 'root'@'localhost'` | Wrong MySQL password in `application.properties`. |
| Frontend shows *"Cannot reach the server"* | The Spring Boot backend is not running. Start it on port 8080. |
| CORS error in the browser console | Use the Vite dev server (port 5173). The `/api` proxy in `vite.config.js` avoids CORS entirely. |
| Port 8080 already in use | Change `server.port` in `application.properties` and the proxy `target` in `vite.config.js`. |
| Login says *"Access denied. Administrators only."* | You are logged in as a student. Log out and log in with the admin account. |

---

## 10. Screenshots checklist (for the report)

Capture these while the app is running:

1. Home page (hero + upcoming events)
2. Events list with the filter bar in use
3. Event details page with the seat meter
4. Registration form (login page)
5. Student registration form
6. Student dashboard — "My Registrations"
7. Admin dashboard — KPI cards + both charts
8. Manage Events table
9. Create / Edit Event form
10. Student Registrations table
11. MySQL table structure (`DESCRIBE events;`)
12. MySQL relationships (`SHOW CREATE TABLE registrations;`)

---

## 11. Note on scope

This is an academic mini project. It intentionally leaves out payments, email
notifications, file uploads, AI features and third-party services. Authentication
uses a simplified header-based check instead of JWT, and this trade-off is
documented in `PROJECT-DOCUMENTATION.md` (section "Limitations") so it can be
discussed honestly in the viva.
