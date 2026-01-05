# MentorX Frontend

A modern, responsive frontend for the MentorX platform, built with React 19, TypeScript, and Vite.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 7](https://vitejs.dev/)
- **Package Manager:** [Bun](https://bun.sh/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest)
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Editor:** [TinyMCE React](https://www.tiny.cloud/docs/tinymce/latest/react-cloud/)

## 📁 Project Structure

```text
src/
├── api/          # API service definitions (Axios instances, endpoints)
├── components/   # Reusable UI components
│   ├── dashboard/ # Dashboard specific components
│   ├── features/  # Feature-based components (forum, user-management)
│   ├── landing/   # Landing page sections
│   ├── ui/        # Atomic UI components (Shadcn-like)
│   └── ...
├── hooks/        # Custom React hooks
├── layouts/      # Page layout components (Admin, Public, User)
├── lib/          # Utility functions and shared libraries
├── pages/        # Page components mapped to routes
├── routes/       # TanStack Router configuration
├── store/        # Redux store and slices
├── types/        # TypeScript type definitions and interfaces
├── App.tsx       # Root component
└── main.tsx      # Application entry point
```

## 🛠️ Getting Started

### Requirements

- [Bun](https://bun.sh/) installed on your machine.
- Node.js (Vite requirement, though Bun is used for package management).

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_API_URL=http://localhost:4000
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_TINYMCE_API_KEY=your-tinymce-api-key
   ```

### Running the Application

- **Development Mode:**
  ```bash
  bun dev
  ```
  The app will be available at `http://localhost:5173`.

- **Production Build:**
  ```bash
  bun run build
  ```

- **Preview Production Build:**
  ```bash
  bun run preview
  ```

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `bun dev` | Starts the development server with HMR. |
| `bun run build` | Runs type checking and builds the app for production. |
| `bun run lint` | Runs ESLint to check for code quality issues. |
| `bun run preview` | Previews the locally built production app. |

## 🧪 Tests

> [!IMPORTANT]
> **TODO:** No automated tests are currently configured. 
> Plan to integrate [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## 🔑 Environment Variables

- `VITE_API_URL`: The base URL for the backend API.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 2.0 Client ID for authentication.
- `VITE_TINYMCE_API_KEY`: API Key for the TinyMCE rich text editor.

## 📄 License

> [!NOTE]
> **TODO:** Add a LICENSE file. Currently, the project does not specify a license.
