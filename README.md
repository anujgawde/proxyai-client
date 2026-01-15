# ProxyAI Client

> AI-powered meeting intelligence platform that helps you stay on top of every meeting without being in the room.

ProxyAI provides live transcripts, AI-powered summaries, and AI QnA with real-time conversations, allowing teams to stay informed and productive without attending every session. View Demo [here.](https://drive.google.com/file/d/1PReB_AkqONzoTPIQ-a94elQ_6hPoNTqO/view?usp=drive_link)

## Features

- **Live Transcripts** - Real-time transcription from multiple concurrent meetings

- **AI-Powered Summaries** - Automatic summaries generated every 2 minutes

- **Platform Support** - Integrates Google Calendar (Zoom and Teams Coming Soon).

- **Real-Time Updates** - Server-sent events (SSE) for live meeting status and content updates

- **Meeting Management** - Track, and analyze meetings across all platforms

- **Q&A Interface** - Ask questions about meetings using AI-powered retrieval

- **Attention Alerts** - Smart notifications when your presence is required (coming soon)

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router

- **Language**: TypeScript

- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/)

- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + React Context

- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)

- **Real-time Communication**: Server-Sent Events (SSE)

- **HTTP Client**: [Axios](https://axios-http.com/)

- **Icons**: [Lucide React](https://lucide.dev/)

- **Date Handling**: [date-fns](https://date-fns.org/)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20.x or higher

- npm or yarn package manager

- A Firebase project with Authentication enabled

- OAuth credentials for meeting platforms (Google: Google Calendar, Zoom & Teams: Temporarily Optional)

## Getting Started

### 1. Clone the Repository

```bash

git  clone <repository-url>

cd  proxyai-client

```

### 2. Install Dependencies

```bash

npm  install

```

### 3. Environment Configuration

Create environment files for development and production:

#### Development Environment (`.env.development`)

```bash

# Firebase Configuration

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com

NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id

NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id



# Firebase Service Account (for server-side operations)

NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com

NEXT_PUBLIC_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_firebase_private_key\n-----END PRIVATE KEY-----\n"



# Backend API

API_BASE_URL=http://localhost:8001



# Zoom OAuth

NEXT_PUBLIC_ZOOM_CLIENT_ID=your_zoom_client_id

NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/oauth/zoom

ZOOM_CLIENT_SECRET=your_zoom_client_secret



# Google OAuth

GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/google

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=your_google_client_secret

```

#### Production Environment (`.env.production`)

Copy `.env.development` and update values for production:

- Replace `localhost` URLs with production domains

- Update redirect URIs to production callback URLs

- Use production Firebase project credentials

### 4. Run Development Server

```bash

# Run with development environment

npm  run  dev



# Run with production environment variables

npm  run  prod

```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash

npm  run  build

npm  start

```

## Project Structure

```

proxyai-client/

├── src/

│ ├── api/ # API service layer

│ │ ├── auth/ # Authentication APIs

│ │ ├── meetings/ # Meeting APIs

│ │ ├── providers/ # Provider integration APIs

│ │ └── users/ # User management APIs

│ ├── app/ # Next.js app directory

│ │ ├── auth/ # Authentication pages

│ │ ├── meetings/ # Meeting management pages

│ │ ├── oauth/ # OAuth callback handlers

│ │ ├── settings/ # Settings pages

│ │ └── demo/ # Demo pages

│ ├── components/ # React components

│ │ ├── ui/ # Reusable UI components

│ │ ├── auth/ # Authentication components

│ │ ├── meetings/ # Meeting-related components

│ │ ├── settings/ # Settings components

│ │ └── shared/ # Shared components

│ ├── contexts/ # React contexts

│ ├── hooks/ # Custom React hooks

│ ├── lib/ # Utility libraries

│ ├── types/ # TypeScript type definitions

│ └── config/ # Configuration files

├── public/ # Static assets

└── ...config files

```

## Key Features Implementation

### Authentication Flow

ProxyAI uses Firebase Authentication with support for:

- Email/Password authentication

- OAuth integration with meeting providers

- Protected routes with middleware

- Persistent auth state management

### Real-Time Updates

The application uses Server-Sent Events (SSE) for real-time updates:

```typescript
// Connection established in meetings page

const eventSource = new EventSource(
  `${API_BASE_URL}/meetings/sse?userId=${userId}`
);

// Handles:

// - meeting_status_update: Meeting status changes

// - transcript_update: Live transcript updates

// - summary_update: New AI-generated summaries
```

### Meeting Provider Integration

Supports OAuth flows for:

- **Google Meet**: Google Calendar integration

Coming Soon:

- **Zoom**: Calendar access and meeting management

- **Microsoft Teams**: Calendar and meeting access

Integration tokens are stored securely and managed through the settings interface.

## Available Scripts

```bash

# Development

npm  run  dev  # Run development server with dev env

npm  run  prod  # Run development server with prod env



# Production

npm  run  build  # Build for production

npm  start  # Start production server



# Code Quality

npm  run  lint  # Run ESLint

```

## Environment Variables Reference

| Variable | Description | Required |

|----------|-------------|----------|

| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |

| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |

| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |

| `API_BASE_URL` | Backend API base URL | Yes |

| `NEXT_PUBLIC_ZOOM_CLIENT_ID` | Zoom OAuth client ID | Optional |

| `ZOOM_CLIENT_SECRET` | Zoom OAuth secret | Optional |

| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |

| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Optional |

## Development Guidelines

### Code Style

- Use TypeScript for all new files

- Follow React best practices and hooks patterns

- Use functional components with TypeScript interfaces

- Implement error boundaries for production resilience

### Component Patterns

```typescript
// Preferred component structure

interface ComponentProps {
  prop1: string;

  prop2?: number;
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic

  return <div>{/* JSX */}</div>;
}
```

### API Service Pattern

All API calls are abstracted through service layers in [src/api/](src/api/):

```typescript
// Example usage

import { meetingsService } from "@/api/meetings";

const meetings = await meetingsService.getMeetingsByStatus("live");
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel

2. Add environment variables in Vercel dashboard

3. Deploy with automatic builds on push

### Self-Hosted

1. Build the application: `npm run build`

2. Set environment variables in your hosting environment

3. Run: `npm start`

4. Configure reverse proxy (nginx/Apache) for production

## Troubleshooting

### OAuth Callback Issues

Ensure redirect URIs match exactly in:

- Provider OAuth application settings (Zoom/Google/Teams)

- Environment variables

- Callback handler routes

### SSE Connection Failures

- Verify backend server is running and accessible

- Check CORS configuration on backend

- Ensure API_BASE_URL is correctly set

### Firebase Authentication Errors

- Verify Firebase configuration in environment variables

- Check Firebase console for enabled authentication methods

- Ensure service account credentials are properly formatted

## Browser Support

- Chrome/Edge (latest 2 versions)

- Firefox (latest 2 versions)

- Safari (latest 2 versions)

## Contributing

1. Create a feature branch from `main`

2. Make your changes with clear commit messages

3. Test thoroughly in development environment

4. Submit a pull request with detailed description

## Support

For issues and questions:

- Create an issue in the repository

- Contact the development team

---
