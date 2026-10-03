# Project Documentation — College Event Management & Student Registration System

Supporting notes for the **project report** and the **viva**. Keep this next to
the README; together they cover everything an examiner is likely to ask.

---

## 1. Abstract

The College Event Management and Student Registration System is a web
application that replaces the paper registers and notice-board announcements
colleges currently use to manage events. Students browse a single, searchable
list of events and register online; administrators publish events and monitor
registrations from a dashboard. The system is built as a three-tier
application — a React single-page front end, a Spring Boot REST API, and a
MySQL relational database — demonstrating CRUD operations, relational data
modelling, validation and role-based access control.

---

## 2. Objectives

1. Provide one place where students can see every upcoming college event.
2. Allow online registration, removing the need for a physical register.
3. Prevent overbooking by tracking seat capacity against each event.
4. Give administrators a live view of events and registrations.
5. Apply sound database design — three normalised tables with proper foreign
   keys and constraints.
6. Demonstrate a complete REST API with validation and error handling.
7. Keep the code readable enough to explain in a viva.

---

## 3. Software requirements

| Component | Version used |
|---|---|
| Operating system | Windows / Linux / macOS |
| Java JDK | 17 |
| Spring Boot | 3.2.5 |
| Maven | 3.8+ |
| MySQL | 8.x |
| Node.js | 18+ |
| npm | 9+ |
| React | 18 |
| Vite | 5 |
| Bootstrap | 5.3 |
| Browser | Chrome / Edge / Firefox |

---

## 4. System architecture (three-tier)

```
   ┌──────────────────────────────────────────────┐
   │  PRESENTATION TIER                           │
   │  React 18 + Vite + Bootstrap 5               │
   │  React Router (client-side routing)          │
   │  Axios (HTTP client)                         │
   │  Running on http://localhost:5173            │
   └──────────────────────┬───────────────────────┘
                          │  HTTP / JSON
                          │  (Vite dev-server proxy: /api → :8080)
                          ▼
   ┌──────────────────────────────────────────────┐
   │  APPLICATION TIER                            │
   │  Java 17 + Spring Boot 3                     │
   │    Controller → Service → Repository         │
   │  Spring Data JPA / Hibernate                 │
   │  Jakarta Bean Validation                     │
   │  BCrypt password hashing                     │
   │  Running on http://localhost:8080            │
   └──────────────────────┬───────────────────────┘
                          │  JDBC
                          ▼
   ┌──────────────────────────────────────────────┐
   │  DATA TIER                                   │
   │  MySQL 8 — database: college_event_db        │
   │  Tables: users, events, registrations        │
   └──────────────────────────────────────────────┘
```

### Request flow — "student registers for an event"

```
1. Student clicks Register
        ↓
2. React: registrationApi.register(userId, eventId)
        ↓  POST /api/registrations  { userId, eventId }
3. Spring Boot: RegistrationController.register()
        ↓
4. RegistrationService.register() runs five checks:
        a) the user exists and is a STUDENT
        b) the event exists
        c) the event is OPEN and the deadline has not passed
        d) a seat is still available
        e) the student has not already registered
        ↓
5. RegistrationRepository.save(registration)
        ↓  INSERT INTO registrations ...
6. Response: 201 Created  { success: true, message, data }
        ↓
7. React shows a green toast and refreshes the seat counter
   (the student dashboard and the admin table both read the same row)
```

---

## 5. Database design

### 5.1 Tables

**users** — one row per person; `role` decides what they can do.

| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| full_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(120) | NOT NULL, UNIQUE |
| password | VARCHAR(100) | NOT NULL — BCrypt hash |
| phone | VARCHAR(15) | |
| course | VARCHAR(60) | |
| roll_number | VARCHAR(30) | |
| role | VARCHAR(10) | CHECK IN ('ADMIN','STUDENT') |
| created_at | DATETIME | NOT NULL |

**events** — one row per event.

| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | |
| event_date | DATE | NOT NULL |
| event_time | TIME | NOT NULL |
| venue | VARCHAR(150) | NOT NULL |
| department | VARCHAR(80) | |
| organizer | VARCHAR(100) | |
| capacity | INT | NOT NULL, CHECK > 0 |
| registration_deadline | DATE | NOT NULL |
| status | VARCHAR(20) | CHECK in 5 values |
| created_by | BIGINT | FK → users.id, ON DELETE SET NULL |
| created_at / updated_at | DATETIME | NOT NULL |

**registrations** — the junction table between users and events.

| Column | Type | Constraint |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK → users.id, ON DELETE CASCADE |
| event_id | BIGINT | FK → events.id, ON DELETE CASCADE |
| status | VARCHAR(20) | CHECK IN ('CONFIRMED','CANCELLED','ATTENDED') |
| registered_at | DATETIME | NOT NULL |
| | | **UNIQUE (user_id, event_id)** |

### 5.2 Relationships

```
users 1 ────────< events          (one admin creates many events)
users 1 ────────< registrations   (one student has many registrations)
events 1 ───────< registrations   (one event has many registrations)
```

`registrations` is a **junction table**: it resolves the many-to-many
relationship between students and events, and carries its own attributes
(`status`, `registered_at`).

In Java this is expressed as:

```java
@ManyToOne @JoinColumn(name = "user_id")   private User user;    // Registration
@ManyToOne @JoinColumn(name = "event_id")  private Event event;
@OneToMany(mappedBy = "event", cascade = CascadeType.ALL)          // Event
private List<Registration> registrations;
```

### 5.3 Normalisation

The schema is in **3NF**:

* **1NF** — every column holds a single atomic value; there are no repeating
  groups or comma-separated lists.
* **2NF** — every non-key column depends on the whole primary key. No table has
  a composite key here, so this holds trivially.
* **3NF** — no transitive dependencies. An event's venue or department is stored
  once in `events`; a registration does not repeat the event title or the
  student's name, it stores the foreign key and joins when needed.

This is why the admin registration table joins three tables rather than storing
a denormalised copy.

### 5.4 Constraints and why they matter

| Constraint | Protects against |
|---|---|
| `UNIQUE(users.email)` | Two accounts with the same email |
| `UNIQUE(registrations.user_id, event_id)` | Double registration — enforced by the **database**, not only by Java |
| `CHECK(capacity > 0)` | An event that can hold nobody |
| `CHECK(status IN (...))` | Typos like 'Opne' silently becoming a valid state |
| `ON DELETE CASCADE` | Orphaned registrations after an event is deleted |
| `ON DELETE SET NULL` | Deleting an admin should not delete their events |

---

## 6. REST API design

The API follows REST conventions: nouns for resources, HTTP verbs for actions,
and status codes that say what happened.

| Operation | Verb | URL | Success code |
|---|---|---|---|
| List events | GET | `/api/events` | 200 |
| Read one event | GET | `/api/events/{id}` | 200 |
| Create event | POST | `/api/admin/events` | 201 |
| Update event | PUT | `/api/admin/events/{id}` | 200 |
| Delete event | DELETE | `/api/admin/events/{id}` | 200 |
| Register for event | POST | `/api/registrations` | 201 |
| My registrations | GET | `/api/registrations/my/{userId}` | 200 |
| Cancel registration | DELETE | `/api/registrations/{id}/cancel` | 200 |
| Login | POST | `/api/auth/login` | 200 |

### Status codes used

| Code | Meaning | Example in this project |
|---|---|---|
| 200 OK | Success | Event list loaded |
| 201 Created | A new row was created | Event created, registration made |
| 400 Bad Request | The request breaks a rule | Registering twice; deadline passed |
| 404 Not Found | The id does not exist | `/api/events/999` |
| 409 Conflict | The database refused the row | Duplicate email |
| 500 Server Error | Unexpected failure | Any unhandled exception |

Every error is returned in the **same JSON shape**, produced by
`GlobalExceptionHandler`:

```json
{
  "timestamp": "2026-10-01T19:20:00",
  "status": 400,
  "error": "Bad Request",
  "message": "You have already registered for this event.",
  "path": "/api/registrations"
}
```

Having one handler means the React app only has to read `data.message`, so
error handling is written **once** instead of in every component.

---

## 7. Validation

Validation happens in **two places on purpose**.

**Client side (JavaScript)** — instant feedback, no network round trip. See the
`validate()` function in `RegisterPage.jsx`, `AdminEventFormPage.jsx` and
`LoginPage.jsx`.

**Server side (Java)** — the authoritative check, because anything coming from a
browser can be forged.

* **Annotations** on DTOs, e.g. in `EventRequest.java`:
  `@NotBlank`, `@NotNull`, `@Min(1)`, `@Max(10000)`, `@FutureOrPresent`
* **Business rules** in the service layer, which annotations cannot express:
  * the registration deadline must not be after the event date
  * the event date must not be in the past
  * a student may not register twice
  * an event must not be over capacity
  * registration must be within the deadline

Rule-of-thumb used throughout: **never trust the client; validate again on the
server.**

---

## 8. Security

| Concern | How it is handled |
|---|---|
| Password storage | BCrypt hash with a random salt (`BCryptPasswordEncoder`). Plain passwords are never stored or returned. |
| Password in API responses | `UserResponse` has no `password` field, so the hash cannot leak. |
| Role escalation | `AuthService.register()` hard-codes `Role.STUDENT`. The client cannot send a role. |
| Admin endpoints | `AuthInterceptor` checks the `X-User-Id` header resolves to a user whose role is `ADMIN`, for every `/api/admin/**` request. |
| Route protection (front end) | `ProtectedRoute` redirects guests to `/login` and students away from `/admin/**`. |
| SQL injection | None possible through JPA — all queries are parameterised. |

### Known limitation (state this honestly in the viva)

The admin check trusts a client-supplied header. A real deployment would issue a
**signed JWT** on login and verify its signature on each request, because a
header can be forged by anyone who knows an admin's user id. The project uses
the header approach deliberately: it keeps the authentication flow readable and
avoids adding a full Spring Security configuration, which is out of scope for a
three-day mini project. This is the single most likely viva question about
security — answer it with this trade-off, not by claiming the system is secure.

---

## 9. Key design decisions

**Why Spring Data JPA instead of plain JDBC?**
Entities, repositories and transactions are generated from simple interfaces,
so the code focuses on business rules. `RegistrationRepository` shows both
styles: derived queries (`findByUserIdOrderByRegisteredAtDesc`) for simple
lookups and `@Query` for the aggregated dashboard numbers.

**Why DTOs instead of returning entities?**
Returning an `Event` entity would serialise its lazy `registrations` list and
could leak the `User` password hash through the back-reference. DTOs
(`EventResponse`, `RegistrationResponse`) expose exactly the fields the UI
needs, including computed values like `seatsLeft` and `registeredCount`.

**Why a JPA Specification for search?**
Filtering by keyword, department, status and upcoming-only produces many
combinations. A Specification builds the `WHERE` clause at runtime, so we avoid
writing one repository method per combination.

**Why compute dashboard statistics in Java rather than in JavaScript?**
The numbers come from SQL `GROUP BY`/`COUNT` aggregates, so the browser does not
download every registration just to count them. It also means the same endpoint
could feed a printed report later.

**Why a Proxy in `vite.config.js`?**
It forwards `/api` from port 5173 to port 8080, so the browser sees one origin
and there is no CORS problem in development. CORS is still configured on the
backend so the API works when called directly (curl, Postman).

**Why `open-in-view=false`?**
It disables the "open session in view" anti-pattern so that lazy loading must
happen inside a transaction. This is why several service methods are annotated
`@Transactional(readOnly = true)`.

---

## 10. Testing

### Manual test cases

| # | Test | Steps | Expected result |
|---|---|---|---|
| 1 | Student registration | Fill the register form with valid data | 201, account created, redirected to login |
| 2 | Duplicate email | Register again with the same email | 400 "An account with this email already exists." |
| 3 | Weak password | Register with a 4-character password | Validation error before the request is sent |
| 4 | Login as student | `rahul@student.edu` / `student123` | Redirected to `/student/dashboard` |
| 5 | Login as admin | `admin@college.edu` / `admin123` | Redirected to `/admin/dashboard` |
| 6 | Wrong password | Login with a bad password | 400 "Incorrect password. Please try again." |
| 7 | Student hits admin URL | Log in as a student, open `/admin/dashboard` | Redirected to `/student/dashboard` |
| 8 | Guest hits protected URL | Log out, open `/student/dashboard` | Redirected to `/login` |
| 9 | Event search | Type "code" in the search box | Only matching events listed |
| 10 | Filter by department | Select a department | Only that department's events |
| 11 | Register for an event | Click Register on an open event | 201, seat count increases by 1 |
| 12 | Duplicate registration | Click Register on the same event twice | 400 "You have already registered for this event." |
| 13 | Event full | Fill an event to capacity, try to register | 400 "Sorry, this event is full." |
| 14 | Deadline passed | Register for an event whose deadline passed | 400 "The registration deadline ... has passed." |
| 15 | Create event | Admin fills the create form | 201, event appears in the list |
| 16 | Validation on create | Submit with an empty title and capacity 0 | Field-level errors shown, no request sent |
| 17 | Deadline after event | Set the deadline later than the event date | 400 "The registration deadline cannot be after the event date." |
| 18 | Edit event | Change a title and save | 200, list reflects the new title |
| 19 | Delete event | Delete an event with registrations | Confirmation prompt, then the event and its registrations are gone |
| 20 | Admin sees registrations | Open `/admin/registrations` | Every registration listed with student and event details |
| 21 | Mark attended | Click the attended button | Status becomes ATTENDED |
| 22 | Cancel own registration | Student cancels from their dashboard | Status becomes CANCELLED, seat released |
| 23 | Dashboard statistics | Open the admin dashboard | KPI numbers match the tables |
| 24 | 404 page | Open `/does-not-exist` | Custom 404 page with links home |

### API tests with curl

```bash
# 404 for a missing event
curl -i http://localhost:8080/api/events/999

# 400 when a student tries an admin endpoint
curl -i -X POST http://localhost:8080/api/admin/events \
  -H "Content-Type: application/json" -H "X-User-Id: 2" \
  -d '{"title":"Test","eventDate":"2026-12-01","eventTime":"10:00:00",
       "venue":"Lab","capacity":10,"registrationDeadline":"2026-11-25"}'
# → "Access denied. This action is available to administrators only."

# 400 for validation
curl -i -X POST http://localhost:8080/api/admin/events \
  -H "Content-Type: application/json" -H "X-User-Id: 1" \
  -d '{"title":"","capacity":0}'
# → field errors for title, eventDate, eventTime, venue, capacity
```

---

## 11. Limitations

1. **Header-based admin check** instead of JWT — documented in section 8.
2. **No pagination.** The tables load every row; fine for a college, not for
   thousands of records.
3. **No email notifications** on registration or cancellation.
4. **No file uploads** — no event posters or profile pictures.
5. **Capacity race condition.** Two students clicking Register at the same
   instant could theoretically both pass the seat check before either commits.
   A production fix is a database-level lock or a conditional `UPDATE`.
6. **No unit/integration test suite.** Testing was manual plus curl, as listed
   in section 10.
7. **No refresh-token or "remember me"** flow; the session lives in
   `localStorage` until logout.

---

## 12. Future enhancements

1. Replace the header check with **JWT + Spring Security**.
2. Add **pagination and sorting** to both tables.
3. **Email/SMS notifications** on registration and reminders before the event.
4. **QR-code attendance** instead of a manual "mark attended" button.
5. **Event poster upload** stored as a BLOB or on disk.
6. **CSV/PDF export** of the registration list for the office.
7. **Feedback and rating** collection after an event.
8. **Calendar view** and an `.ics` download for each event.
9. **Charts** with a proper library once the data grows.
10. **Docker Compose** to start MySQL, backend and frontend with one command.

---

## 13. Likely viva questions and answers

**Q. Why three tables and not two?**
Because a student can register for many events and an event can have many
students — that is a many-to-many relationship, which needs a junction table.
`registrations` is that table, and it also stores `status` and `registered_at`,
which belong to the relationship, not to the student or the event.

**Q. Where is the foreign key for the registration stored?**
In `registrations` — on the "many" side. In JPA the `@ManyToOne` side owns the
foreign key; the `@OneToMany` side uses `mappedBy`.

**Q. What is `mappedBy`?**
It tells Hibernate this side is the **inverse** of the relationship and should
not create a second foreign key column. The real key is declared on the other
entity, by the field named in `mappedBy` (here, `event`).

**Q. Why `@Transactional` on some service methods?**
Because lazy collections (an event's registrations) can only be loaded while the
Hibernate session is open. `open-in-view=false` closes the session at the
controller boundary, so the service must supply the transaction itself.

**Q. How do you stop a student registering twice?**
Three layers: the React button disables after success, the service checks
`existsByUserIdAndEventId`, and the database has
`UNIQUE(user_id, event_id)`. The database constraint is the one that cannot be
bypassed.

**Q. How is the password protected?**
BCrypt with a random salt and 10 rounds. `seed.sql` stores hashes, and there is
no code path that writes a plain password to the column.

**Q. What happens if an admin deletes an event that has registrations?**
`ON DELETE CASCADE` (and `cascade = CascadeType.ALL` on the entity) deletes the
registrations too, and the UI warns the admin with a confirmation dialog first.

**Q. Why is `status` an enum?**
It restricts the value to five known states, so a typo cannot become a valid
status. It is stored with `EnumType.STRING` so the database column is readable
rather than a number.

**Q. Why does the search happen in SQL rather than in JavaScript?**
The browser receives only the matching rows instead of the whole table, which
matters as the data grows. The `Specification` builds the `WHERE` clause based
on which filters are set.

**Q. What is `ResponseEntity` used for?**
It lets a controller choose the HTTP status code and body — for example 201
Created when an event is made, and 404 when an id is not found.

**Q. Where is the code that turns an exception into a JSON error?**
`GlobalExceptionHandler`, annotated with `@RestControllerAdvice`. It handles our
custom exceptions, validation failures and any unexpected exception, all in one
place.

**Q. How can the frontend pass data between pages without a reload?**
React Router keeps the app mounted and swaps the page component. Shared state
(the logged-in user, toasts) lives in React context, and the session is
persisted in `localStorage`.

**Q. What would you improve with more time?**
The list in section 12. Lead with JWT authentication and pagination — they are
the two most obvious gaps.

---

## 14. Contribution split (edit for your team)

| Student name | Roll number | Modules handled |
|---|---|---|
| ______________ | __________ | Database design, Event entity + repository, Event CRUD APIs |
| ______________ | __________ | Registration module, capacity and deadline rules |
| ______________ | __________ | Authentication, BCrypt, admin dashboard statistics |
| ______________ | __________ | React UI: events, dashboards, forms, routing |

---

## 15. References

1. Spring Boot Reference Documentation — <https://docs.spring.io/spring-boot/docs/current/reference/html/>
2. Spring Data JPA Reference — <https://docs.spring.io/spring-data/jpa/reference/>
3. Jakarta Bean Validation 3.0 specification — <https://jakarta.ee/specifications/bean-validation/3.0/>
4. React documentation — <https://react.dev/>
5. React Router v6 documentation — <https://reactrouter.com/>
6. Vite documentation — <https://vitejs.dev/>
7. Bootstrap 5 documentation — <https://getbootstrap.com/docs/5.3/>
8. MySQL 8.0 Reference Manual — <https://dev.mysql.com/doc/refman/8.0/en/>
9. OWASP Password Storage Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>
10. OWASP REST Security Cheat Sheet — <https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html>
11. MDN Web Docs — HTTP response status codes — <https://developer.mozilla.org/en-US/docs/Web/HTTP/Status>
12. Baeldung — Spring Data JPA Specifications — <https://www.baeldung.com/rest-api-search-language-spring-data-specifications>
