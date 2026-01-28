# Pastebin-Lite

A simple Pastebin clone built with Next.js 16 and Prisma, deployed on Vercel with Neon (Postgres).

## Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ISHANT14gg/pastebin.git
    cd pastebin
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
    NEXT_PUBLIC_URL="http://localhost:3000"
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Persistence Layer

-   **Database:** PostgreSQL (hosted on Neon.tech).
-   **ORM:** Prisma (v5.10.2).
-   **Reasoning:** Postgres ensures data integrity and durability. Prisma provides type-safe database access. We use Prisma v5 for stability with Vercel's build environment.

## Design Decisions

-   **Next.js App Router:** Leveraged for server-side rendering (SSR) of paste pages (`/p/[id]`) to ensure fast loads and SEO friendliness (if public).
-   **Shared Service Layer:** Core logic (`getAndIncrementPaste`) is centralized in `lib/pasteService.ts`. This ensures that both the API (`/api/pastes/[id]`) and the View Page (`/p/[id]`) rely on the exact same limits and counting logic.
-   **Deterministic Testing:** The application parses `x-test-now-ms` headers (when `TEST_MODE=1` env var is set). This timestamp is passed down to the service layer to simulate expiration scenarios accurately for automated grading.
-   **Strict Validation:** The `POST` endpoint enforces strict types and boundaries (e.g., `ttl_seconds` must be a positive integer) to reject malformed requests early.

## API Endpoints

-   `GET /api/healthz`: Health check ({ "ok": true }).
-   `POST /api/pastes`: Create a paste.
-   `GET /api/pastes/:id`: Retrieve paste metadata.
