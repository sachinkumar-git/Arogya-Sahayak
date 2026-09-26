# Arogya Sahayak

A full-stack telemedicine platform for rural India. Patients can consult doctors by video, voice or chat, either independently or with help from a village health assistant (Sahayak) who can record vitals using a digital health kit. Prescriptions are saved to the patient's health record, while the medicine finder helps locate nearby pharmacies with available stock.

The interface supports **English, हिंदी and ਪੰਜਾਬੀ**, with browser-based voice input for supported devices.

Built with **MongoDB, Express, React and Node.js (MERN)**, with TypeScript on the frontend.

## Product Preview

<table>
  <tr>
    <td width="50%"><img src="docs/image.png" alt="Arogya Sahayak landing page" width="100%" /></td>
    <td width="50%"><img src="docs/image%20copy.png" alt="Arogya Sahayak product overview" width="100%" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/image%20copy%202.png" alt="Patient dashboard" width="100%" /></td>
    <td width="50%"><img src="docs/image%20copy%205.png" alt="Doctor dashboard" width="100%" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/image%20copy%204.png" alt="Sahayak dashboard" width="100%" /></td>
    <td width="50%"><img src="docs/image%20copy%203.png" alt="Medicine finder" width="100%" /></td>
  </tr>
</table>

---

## What Arogya Sahayak Does

Arogya Sahayak models the workflow behind a complete telemedicine consultation rather than a simple appointment form.

### Patients

- Book consultations by specialty with a selected doctor or the **first available doctor**
- Choose video, voice or chat for immediate or scheduled consultations
- Raise an **emergency consultation** or call the 108 ambulance
- Chat with the doctor and join a private video or voice room during an active consultation
- View prescriptions, consultation summaries, vitals and uploaded medical reports
- Maintain a medical profile with blood group, allergies, chronic conditions and emergency contact details

### Sahayaks

- Find patients by phone number or email and book assisted consultations
- Record patient vitals including BP, pulse, temperature, SpO₂, blood sugar and weight
- Track digital health kit status
- Monitor active consultations and daily activity

### Doctors

- Manage an auto-refreshing patient queue
- Accept open cases based on specialty and priority
- Start consultations, chat with patients and review medical history
- Record or review vitals
- Complete consultations with diagnosis, structured prescriptions, advice and follow-up dates

### Everyone

- Search medicines by brand name, generic name, use, or Hindi/Punjabi name
- View pharmacy stock status and prices
- Access pharmacy call and directions links

---

## Key Engineering Highlights

### Race-safe consultation claiming

Open consultation cases use a conditional atomic update when doctors compete to accept the same case. Exactly one doctor can claim the case, while concurrent attempts receive a clear conflict response.

### Server-enforced business rules

The API is the source of truth for consultation and booking rules, including doctor availability, specialty matching, slot conflicts, duplicate instant consultations, emergency scheduling, cancellation and fee snapshots.

### Privacy-aware health records

Patient history is available only to the patient and authorised members of the care relationship. Uploaded reports are stored outside public folders and served through access-controlled endpoints.

### Secure session and API layer

The backend uses MongoDB-backed sessions, Passport authentication, CSRF protection, Helmet security headers, Content Security Policy, rate limiting, Joi validation, upload restrictions and secure production cookies.

### Medicine availability logic

Expired inventory is excluded, the cheapest sellable batch is selected when multiple batches exist, and low-stock conditions are surfaced to users.

### Multilingual and accessible UI

The application supports English, Hindi and Punjabi, browser voice input, keyboard-accessible controls, responsive mobile layouts, loading/empty/error states and print-friendly medical records and prescriptions.

---

## Consultation Lifecycle

```text
scheduled ──start──> in_progress ──complete──> completed
    │                      │
    └────── cancel ────────┘

waiting + no doctor
        │
        ▼
   open case
        │
        ▼
 doctor accepts
```

---

## Architecture

```text
                         Arogya Sahayak
                              |
              +---------------+---------------+
              |                               |
      React + TypeScript               Express 5 API
              |                               |
      Pages / Components             Auth / Roles / CSRF
              |                       Joi / Uploads
      React Query / Context
              |                               |
              +---------------+---------------+
                              |
                         Controllers
                              |
                           Services
                        (business rules)
                              |
                    Serializers + Mongoose
                              |
                           MongoDB
```

The frontend handles presentation, routing, interaction and i18n. The Express API provides authentication, role guards, validation, uploads and business rules. Controllers remain thin, while services contain domain logic and serializers control the data exposed to each role.

In development, Vite serves the frontend on `:5173` and proxies `/api` to the backend on `:8080`. In production, Express serves the built frontend alongside the API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, React Router 6, Vite 5 |
| Data fetching | TanStack Query 5 |
| UI | Tailwind CSS 3, Radix UI primitives (shadcn/ui), Lucide icons |
| Backend | Node.js 20+, Express 5 |
| Database | MongoDB, Mongoose 9 |
| Authentication | Passport, passport-local-mongoose, express-session, connect-mongo |
| Security | Helmet, CSP, express-rate-limit, CSRF tokens |
| Validation | Joi |
| File uploads | Multer |
| Video / voice | Jitsi Meet |
| Voice input | Web Speech API |
| Testing | Node test runner, Supertest |
| Code quality | ESLint, TypeScript strict mode |

---

## Getting Started

### Requirements

- Node.js 20+
- MongoDB 6+ running locally, or a MongoDB Atlas connection string

### Installation

```bash
git clone <your-repository-url>
cd Arogya-Sahayak
npm install
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Then seed the development database:

```bash
npm run seed
```

### Development

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| API | `http://localhost:8080` |

### Production

```bash
npm run build
npm start
```

Express serves the production React build alongside the API.

---

## Demo

The seed script creates demo accounts for all three roles.

| Role | Email | Notes |
|---|---|---|
| Patient | `patient@arogya.demo` | Ram Singh |
| Sahayak | `sahayak@arogya.demo` | Priya Sharma |
| Doctor | `doctor@arogya.demo` | Dr. Anjali Verma |

**Demo password:** `Arogya@123`

These accounts are intended only for local and portfolio demonstrations.

---

## API Highlights

The backend exposes REST APIs for:

- Authentication and session management
- Role-based consultation workflows
- Doctor queues and case claiming
- Patient lookup and medical records
- Vitals and prescription management
- Medicine and pharmacy availability
- Secure medical file access

All API responses are JSON. Validation errors return field-level details, and state-changing requests require the session CSRF token.

---

## Database Design

```text
User
 ├──< Consultation
 │      ├── vitals
 │      ├── prescription[]
 │      └── messages[]
 │
 └──< HealthRecord >── Consultation

Pharmacy
 └── inventory[] >── Medicine
```

Core models:

- **User** — authentication, role and role-specific profile data
- **Consultation** — booking, queue state, participants, vitals, prescription and messages
- **HealthRecord** — consultation records, vitals and uploaded medical documents
- **Medicine** — medicine metadata and local-language names
- **Pharmacy** — pharmacy information and inventory batches

---

## Testing

Run the backend integration suite with:

```bash
npm test
```

The current test suite covers authentication and CSRF, role-based access, booking rules, specialty matching, slot conflicts, duplicate protection, concurrent doctor acceptance, consultation lifecycle, health-record access, upload validation and medicine stock ranking.

Run the complete project validation with:

```bash
npm run check
```

This runs linting, strict TypeScript checks, backend tests and the production build.

---

## Scripts

Run from the repository root.

| Command | Purpose |
|---|---|
| `npm run dev` | Start backend and frontend development servers |
| `npm run seed` | Seed demo doctors, patients, pharmacies and medicines |
| `npm test` | Run backend integration tests |
| `npm run lint` | Run ESLint for both workspaces |
| `npm run typecheck` | Run strict TypeScript checks |
| `npm run build` | Build the frontend for production |
| `npm start` | Start the production server |
| `npm run check` | Run lint, typecheck, tests and build |

---

## Project Structure

```text
Arogya-Sahayak/
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── tests/
│   │   └── integration/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       ├── translations/
│       └── types/
│
├── docs/
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
└── README.md
```

---

## Future Improvements

- Real-time queue and chat updates over WebSockets
- Offline support for Sahayaks in low-connectivity environments
- SMS reminders for consultations and follow-ups
- Cloud object storage for medical reports
- Production deployment with managed infrastructure

---

## Project Scope

Arogya Sahayak currently focuses on teleconsultations, health records and medicine availability.

Not included at this stage:

- Online payment processing
- Pharmacy inventory management through the application
- Dedicated video infrastructure
- Integration with national health ID systems

---

## Why This Project

Arogya Sahayak is designed around a real healthcare workflow: connecting rural patients with doctors, enabling assisted consultations, capturing vitals, preserving medical records and helping patients locate available medicines.

From an engineering perspective, the project goes beyond appointment CRUD by handling concurrent case claiming, server-side consultation rules, role-based privacy, secure file access, inventory logic, multilingual interaction and integration testing.

---

## License

Released under the [MIT License](LICENSE).
