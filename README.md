# MTOGO

MTOGO is a food delivery platform built as a group project for the Kanban and DevOps course. Customers order food from restaurants, restaurants manage their own menus, and local delivery employees collect and deliver the orders. The system supports MTOGO's daily operations and is designed to grow with the business.

## Case summary

- Customers have personal accounts and can see restaurant menus and prices before ordering
- Restaurants manage their own menus. MTOGO only displays them
- Restaurants pay a service fee and a commission based on the order value excluding VAT. The commission falls from 6% for small orders to 3% for orders over 1,000 DKK
- Delivery employees see and accept orders, and can earn performance based bonuses that must stay financially sustainable for MTOGO
- Customers receive order updates and can rate the food, the overall experience and the delivery person afterwards
- Management has a dashboard of order status
- The system supports English and Danish
- Payment is handled by an external provider, which is mocked
- Complaint management is not part of this project, but the design must allow it to be added later

## Repository structure

```
Backend/    Java API
Frontend/   React and Vite web app
docs/       Policies, Definition of Done, code standards and flow reviews
```

## Tech stack

Backend:

- Java 27 and Maven
- Javalin 6 for the REST API
- Hibernate with HikariCP and PostgreSQL
- JWT based authentication and BCrypt password hashing
- Jackson for JSON, Lombok, Jakarta Mail
- JUnit 5 and H2 for tests

Frontend:

- React 18 and Vite 5
- React Router
- CSS modules

## Getting started

Prerequisites:

- JDK 27
- Maven
- A running PostgreSQL database

Configuration is read from `Backend/src/main/resources/config.properties`. The file is not in git because it contains secrets. Copy `config.properties.example` to `config.properties` in the same folder and fill in the following keys:

| Key | Purpose |
| --- | --- |
| `DEPLOYED` | Whether the app runs in a deployed environment |
| `FRONTEND_URL` | Address of the frontend |
| `BACKEND_URL` | Address of the backend |
| `PORT` | Port the API listens on |
| `CONNECTION_STR` | Database connection string |
| `DB_NAME` | Database name |
| `DB_USERNAME` | Database user |
| `DB_PASSWORD` | Database password |
| `ISSUER` | JWT issuer |
| `TOKEN_EXPIRE_TIME` | JWT lifetime |
| `SECRET_KEY` | JWT signing key |
| `COMPANY_NAME` | Name used in emails (default `MTOGO`) |
| `SMTP_USERNAME` | SMTP login, e.g. the Gmail address mail is sent from |
| `SMTP_PASSWORD` | SMTP password (for Gmail, an app password) |
| `SMTP_FROM` | Optional sender address, if it differs from `SMTP_USERNAME` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_AUTH`, `SMTP_STARTTLS`, `SMTP_TIMEOUT` | Optional, default to Gmail (`smtp.gmail.com:587` with STARTTLS) |

Locally (`DEPLOYED=false`), mail sends through the real SMTP server once `SMTP_USERNAME` and `SMTP_PASSWORD` are set. Links in emails point to `http://localhost:<PORT>` and `FRONTEND_URL` (default `http://localhost:5173`).

Build and test:

```
cd Backend
mvn verify
```

Run the API by starting `app.Main` from your IDE. When it is running, `GET /api/health` returns `Health OK`.

Run the frontend:

```
cd Frontend
npm install
npm run dev
```

See `Frontend/README.md` for more about the frontend.

## Deployment

When code is pushed to `main`, the CD pipeline builds Docker images for the backend and the frontend and pushes them to Docker Hub. The frontend image is built with `VITE_API_URL` pointing at the backend.

- Backend: https://mtogo.api.roneu.dk
- Frontend: https://mtogo.roneu.dk

After each deploy the smoke workflow runs a few tests against the deployed backend to check that it answers.

## Testing

| Level | What | Run |
| --- | --- | --- |
| Backend unit and integration tests | JUnit 5 with an H2 database in memory | `cd Backend` and `mvn verify` |
| Frontend tests | Vitest, including a check that every API call matches a backend route | `cd Frontend` and `npm test` |
| End to end tests | Playwright in a browser against a backend with test data (`PlaywrightServer`) | `cd Frontend` and `npm run test:e2e` |
| Smoke tests | Vitest against the deployed backend after each deploy | `cd Frontend` and `npm run test:smoke` |

CI runs the backend and frontend tests and the Playwright tests on every pull request. The backend build fails if line coverage is below the minimum in `Backend/pom.xml` or SpotBugs finds high priority problems.

To try the app locally without PostgreSQL, the Playwright test server can be started. It uses an in memory database with test data, for example the restaurant owner `owner@mtogo.dk` with the password `Password123!`, and turns mail off.

## Feature flags

Unfinished features are merged to `main` behind a feature flag that is turned off. The flags are defined in `Backend/src/main/resources/feature-flags.properties`, which also says which user stories each flag belongs to. An environment variable with the same name, for example `FEATURE_ORDERING=true`, overrides the file on the server without a new deploy. The frontend reads the flags from `GET /api/features`.

## Monitoring

The backend exposes metrics in the Prometheus format at `/metrics`: JVM metrics such as memory, garbage collection and threads, and a timer for every request with method, route and status code. Prometheus on the server collects the metrics and Grafana shows them on a dashboard with requests, response times, error rate and the most used routes.

## How we work

- We use a Kanban board in GitHub Projects with a prioritized backlog: https://github.com/users/Freddyboi123/projects/1
- We never work directly on `main`. Branches are short lived, created from `main` and merged back into `main` through a pull request after another team member has reviewed it
- A branch is created from the newest `main`, and `main` is merged into the branch before the pull request is merged
- `main` must always be stable and ready to deploy
- Every pull request needs a review and a passing automated build
- Each person works on one issue at a time. If you take an issue, you finish it within a reasonable time, otherwise it is released
- Issues and sub issues are the unit of work. Cycle time is measured on issues and sub issues, lead time is measured on user stories from the start of development until they are visible in production
- Not every issue is a user story. Technical work is tracked as tech stories
- We work feature driven. Each epic is a feature with its user stories as sub issues, and a feature is done when it is in production
- Unfinished features are kept behind feature flags
- We review our flow every week and note decisions and experiments
- Releases follow Semantic Versioning
- Documentation is written in English

Our policies, Definition of Done and code standards are maintained by the team in the `docs` folder.
