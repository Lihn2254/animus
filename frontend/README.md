# Animus Frontend

Next.js web application for the Animus mental health analytics platform.

---

## Prerequisites

- **Node.js 20+** and npm
- Backend API running on `http://localhost:5000` (see [backend README](../backend/README.md))

---

## Setup Instructions

### 1. Install Dependencies

Navigate to the frontend directory and install all required packages:

```bash
cd frontend
npm install
```

This will install:
- Next.js 16 and React 19
- TypeScript
- Tailwind CSS v4
- react-hook-form with Zod validation
- react-icons

### 2. Configure API Endpoint (Optional)

By default, the frontend connects to the backend at `http://localhost:5000`.

If your backend is running on a different URL, update `src/app/api.ts`:

```typescript
export const API_URL = "http://localhost:5000";
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

The page will automatically reload when you make changes to the code.

### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the login page. If you haven't created a user yet, click "Sign up" to create a new account.

---

## Available Scripts

| Command           | Description                                          |
|-------------------|------------------------------------------------------|
| `npm run dev`     | Start the development server on port 3000            |
| `npm run build`   | Create an optimized production build                 |
| `npm run start`   | Start the production server (run `build` first)      |
| `npm run lint`    | Run ESLint to check for code issues                  |

---

## Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── (auth)/              # Authentication pages
│       │   ├── layout.tsx       # Auth layout (no header/footer)
│       │   ├── login/           # Login page
│       │   │   └── page.tsx
│       │   └── signup/          # Registration page
│       │       └── page.tsx
│       ├── (main)/              # Protected application pages
│       │   ├── layout.tsx       # Main layout (with header/footer)
│       │   ├── page.tsx         # Dashboard/home page
│       │   ├── reports/         # Analysis results page
│       │   │   └── page.tsx
│       │   └── settings/        # User settings page
│       │       └── page.tsx
│       ├── components/          # Reusable UI components
│       │   ├── Footer.tsx
│       │   ├── Header.tsx
│       │   └── RequireAuth.tsx  # Authentication guard
│       ├── context/             # React Context providers
│       │   └── AuthContext.tsx  # Auth state management
│       ├── lib/                 # Utility functions
│       │   └── fetchWithAuth.ts # Authenticated API requests
│       ├── services/            # API client functions
│       │   ├── analysis.ts      # Analysis API calls
│       │   ├── auth.ts          # Authentication API calls
│       │   └── userAccount.ts   # Account management
│       ├── types/               # TypeScript type definitions
│       │   ├── analysis.ts
│       │   └── user.ts
│       ├── api.ts               # API configuration
│       └── globals.css          # Global styles
├── public/                      # Static assets
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

---

## Application Pages

### Authentication Pages

| Route      | Description                                                |
|------------|------------------------------------------------------------|
| `/login`   | User login with username/email and password                |
| `/signup`  | New user registration with validation                      |

### Main Application Pages (Protected)

| Route       | Description                                               |
|-------------|-----------------------------------------------------------|
| `/`         | Dashboard with analysis overview and quick actions        |
| `/reports`  | View and manage historical analysis results               |
| `/settings` | User account settings and preferences                     |

All main pages require authentication. Users are redirected to `/login` if not authenticated.

---

## Development Workflow

### 1. Making Changes

Edit any file in `src/app/` and the page will automatically hot-reload with your changes.

### 2. Adding New Pages

Create a new folder in `src/app/(main)/` for protected pages or `src/app/(auth)/` for public pages:

```bash
mkdir src/app/(main)/newpage
touch src/app/(main)/newpage/page.tsx
```

### 3. Adding Components

Create reusable components in `src/app/components/`:

```bash
touch src/app/components/MyComponent.tsx
```

### 4. Working with the API

API service functions are in `src/app/services/`. Add new API calls there:

```typescript
// src/app/services/myservice.ts
import { fetchWithAuth } from "@/app/lib/fetchWithAuth";

export async function getMyData() {
  return fetchWithAuth("/api/myendpoint");
}
```

---

## Authentication Flow

The application uses JWT-based authentication:

1. User logs in via `/login`
2. Backend returns an access token
3. Token is stored in `localStorage`
4. `AuthContext` manages authentication state
5. `fetchWithAuth` automatically includes token in requests
6. `RequireAuth` component protects routes

To logout, the token is removed from `localStorage` and the user is redirected to `/login`.

---

## Styling

The project uses **Tailwind CSS v4** for styling.

### Adding Custom Styles

Global styles are in `src/app/globals.css`. For component-specific styles, use Tailwind utility classes:

```tsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
```

### Tailwind Configuration

Customize Tailwind in `tailwind.config.ts` to add custom colors, fonts, or breakpoints.

---

## Form Validation

Forms use **react-hook-form** with **Zod** for validation:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Too short"),
});

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  // ... rest of form
}
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, specify a different port:

```bash
PORT=3001 npm run dev
```

### API Connection Error

If you see "Failed to fetch" errors:

1. Verify the backend is running on `http://localhost:5000`
2. Check the `API_URL` in `src/app/api.ts`
3. Open browser DevTools Network tab to see the actual request

### TypeScript Errors

If you see TypeScript errors after pulling changes:

```bash
npm install
```

### Clear Next.js Cache

If you're experiencing unexpected behavior:

```bash
rm -rf .next
npm run dev
```

---

## Building for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized build in the `.next` folder.

### Run Production Server

```bash
npm run start
```

The production server will start on port 3000.

### Environment Variables for Production

For production deployments, create a `.env.production` file:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

---

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **react-hook-form** - Form handling
- **Zod** - Schema validation
- **react-icons** - Icon library

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [react-hook-form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

---

## Learn More

To learn more about Next.js features:

- [App Router](https://nextjs.org/docs/app) - Learn about the Next.js App Router
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching) - Learn about data fetching patterns
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) - Learn about React Server Components
