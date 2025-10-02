# 📱 Quantro Web UI

**Track what fuels you.**  
This repository contains the Web User Interface (UI) for Quantro, a private full-stack health application focused on nutrition tracking.

## �️ Project Context & Architecture

This repository's sole purpose is to provide the **Web User Interface (UI)** for the Quantro application. It serves as the client application that consumes data from the separate **Backend API** (named `quantro-backend`).

The application uses **Feature Flagging** logic returned by the API to conditionally render new features, enabling controlled rollouts, A/B testing, and gradual feature deployment without requiring UI redeployments.

## 💻 Technology Stack

This repository leverages modern web technologies:

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React and React Icons
- **Charts**: Chart.js with react-chartjs-2
- **Animations**: Framer Motion
- **Testing**: Jest with React Testing Library

## 🚀 Local Setup & Running

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- The separate **Backend API** (`quantro-backend`) must be running locally

### Step-by-Step Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/quantro-dev/quantro-web.git
   cd quantro-web
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the Backend API**  
   Ensure the separate Backend API (`quantro-backend`) is running locally on port `3001`. The web UI will not function without the API running.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run the test suite
- `npm run lint` - Check code quality

## 🧪 Testing & Deployment

### Running Tests

Execute the automated test suite using:

```bash
npm run test
```

### Deployment

The web application is deployed as a **static or serverless asset** on Vercel. In production, it points to the live Backend API URL, ensuring seamless integration with the backend services.

The continuous deployment (CD) flow is handled through GitHub Actions, automatically deploying changes to the main branch.
