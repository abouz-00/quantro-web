# 🏗️ Quantro System Architecture

## 📋 Overview

Quantro is a modern nutrition tracking application built with a component-based architecture, emphasizing modularity, type safety, and performance. The system follows a layered architecture pattern with clear separation of concerns.

## 🛠️ Technology Stack

### **Frontend**

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Hooks + Context API
- **Icons**: Lucide React + React Icons
- **Charts**: Chart.js + react-chartjs-2

### **Backend & Data**

- **API**: Next.js API Routes (Server-side)
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js (Google & Apple OAuth)
- **External APIs**: USDA FoodData Central API

### **Development & Deployment**

- **Build Tool**: Next.js with TypeScript
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel
- **Code Quality**: ESLint + Prettier

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                │
├─────────────────────────────────────────────────────────────┤
│  Components/     │  Pages/        │  Hooks/       │ Utils/  │
│  - food-log/     │  - /log        │  - useFoodData│ - date  │
│  - ui/           │  - /auth       │  - useGoals   │ - food  │
│  - charts/       │  - /dashboard  │  - useClipboard│ - calc │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼ HTTP/API Calls
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API)                  │
├─────────────────────────────────────────────────────────────┤
│  Routes/         │  Services/     │  Middleware/  │ Auth/   │
│  - /api/auth     │  - foodLog     │  - rate-limit │ - next  │
│  - /api/food-log │  - usda        │  - security   │ - auth  │
│  - /api/goals    │  - goals       │  - validation │         │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼ Database Queries
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (Prisma + DB)                   │
├─────────────────────────────────────────────────────────────┤
│  Models/         │  Database/     │  External/    │ Storage/│
│  - User          │  - SQLite (dev)│  - USDA API   │ - Local │
│  - FoodEntry     │  - PostgreSQL  │  - Auth APIs  │ - Cloud │
│  - Goals         │    (production)│               │         │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Component Architecture

### **Modular Component Structure**

The application follows a **domain-driven component organization**:

```text
src/components/
├── food-log/              # Domain: Food logging functionality
│   ├── core/             # Core business logic components
│   ├── charts/           # Data visualization components
│   ├── search/           # Search and modal components
│   ├── table/            # Table components with drag-drop
│   └── hooks/            # Domain-specific custom hooks
├── ui/                   # Shared UI components (buttons, modals, etc.)
├── log/                  # Page-specific components
└── examples/             # Demo/example components
```

### **Component Design Patterns**

1. **Compound Components**: Complex components broken into smaller, focused pieces
2. **Custom Hooks**: Logic separation for reusability and testing
3. **Render Props**: Flexible component composition
4. **Higher-Order Components**: Cross-cutting concerns (error boundaries)

## 🔄 Data Flow Architecture

### **Unidirectional Data Flow**

```text
User Action → Component → Custom Hook → Service → API → Database
                ↓            ↓          ↓       ↓       ↓
            UI Update ←─ State ←─── Response ←─ Data ←─ Query
```

### **State Management Strategy**

1. **Local State**: React `useState` for component-specific state
2. **Shared State**: Custom hooks for cross-component state
3. **Global State**: React Context for app-wide state (auth, themes)
4. **Server State**: API responses cached in localStorage
5. **Form State**: Controlled components with validation

### **Key Data Flows**

#### **Food Logging Flow**

```text
FoodSearchModal → useFoodData → foodLogService → /api/food-logs → Prisma → Database
                                     ↓
EnhancedFoodTable ← FoodEntry[] ← Local Storage ← Response
```

#### **Authentication Flow**

```text
Login Button → NextAuth.js → OAuth Provider → Session → Protected Routes
```

## 🎯 Design Patterns Used

### **1. Service Layer Pattern**

- **Location**: `src/services/`
- **Purpose**: Encapsulate API calls and business logic
- **Example**: `foodLogService.ts` handles all food-related operations

### **2. Custom Hook Pattern**

- **Location**: `src/hooks/`
- **Purpose**: Reusable stateful logic across components
- **Examples**: `useFoodData`, `useKeyboardShortcuts`, `useClipboard`

### **3. Repository Pattern**

- **Implementation**: Prisma ORM abstracts database operations
- **Benefits**: Database-agnostic queries, type safety

### **4. Observer Pattern**

- **Implementation**: React Context + useEffect
- **Use Case**: Real-time updates to nutrition calculations

### **5. Factory Pattern**

- **Location**: Utility functions and component builders
- **Example**: Date utility functions, food entry creators

### **6. Facade Pattern**

- **Implementation**: Barrel exports (`index.ts` files)
- **Purpose**: Simplified imports and clean API surfaces

## 🔐 Security Architecture

### **Authentication & Authorization**

- **Provider**: NextAuth.js with OAuth 2.0
- **Session Management**: JWT tokens with secure cookies
- **Route Protection**: Middleware-based auth checks

### **Input Validation**

- **Client-Side**: TypeScript types + form validation
- **Server-Side**: Schema validation with Prisma
- **XSS Prevention**: Input sanitization utilities

### **Rate Limiting**

- **Implementation**: `src/lib/security.ts`
- **Strategy**: IP-based rate limiting for API endpoints

## 📊 Performance Architecture

### **Frontend Optimizations**

- **Code Splitting**: Dynamic imports for large components
- **Bundle Optimization**: Next.js automatic optimizations
- **Image Optimization**: Next.js Image component
- **Caching**: Browser caching + localStorage for offline support

### **Backend Optimizations**

- **Database**: Efficient Prisma queries with indexing
- **API Caching**: Response caching for static data
- **CDN**: Vercel Edge Network for global distribution

## 🗄️ Database Design

### **Schema Overview**

```sql
User (NextAuth)          FoodEntry               Goals
├── id                   ├── id                  ├── id
├── email                ├── userId (FK)         ├── userId (FK)
├── name                 ├── foodName            ├── calories
└── accounts             ├── amount              ├── protein
                         ├── unit                ├── carbs
                         ├── calories            └── fat
                         ├── protein
                         ├── carbs
                         ├── fat
                         └── date
```

### **Data Relationships**

- **One-to-Many**: User → FoodEntries
- **One-to-One**: User → Goals
- **External**: FoodEntry → USDA FoodData (via API)

## 🚀 Deployment Architecture

### **Development Environment**

```text
Local Machine → SQLite → localhost:3000
                  ↓
              Prisma Studio (database GUI)
```

### **Production Environment**

```text
Vercel Edge Functions → PostgreSQL → CDN
         ↓                  ↓          ↓
    Auto-scaling      Connection Pool  Global Cache
```

### **CI/CD Pipeline**

```text
GitHub Push → Actions → Tests → Build → Deploy → Vercel
                ↓        ↓       ↓        ↓
              Lint    Jest    Next.js   Auto-Preview
```

## 🔧 Development Workflow

### **Project Structure Principles**

1. **Feature-Based Organization**: Group by domain, not by file type
2. **Barrel Exports**: Clean import paths with `index.ts` files
3. **Type Safety**: Full TypeScript coverage with strict mode
4. **Documentation**: Comprehensive README files for each module

### **Code Organization Rules**

- **Components**: Single responsibility, well-documented props
- **Hooks**: Pure functions, easy to test
- **Services**: Stateless, error-handled API layers
- **Utils**: Pure functions, no side effects

## 🧪 Testing Strategy

### **Testing Pyramid**

```text
E2E Tests (Planned)           ← Integration testing
    ↓
Component Tests              ← React Testing Library
    ↓
Unit Tests                  ← Jest for utilities/hooks
    ↓
Type Tests                  ← TypeScript compiler
```

### **Current Test Coverage**

- **Components**: Header, UI components
- **Hooks**: useClipboard, custom hooks
- **Utils**: dateUtils, calculation functions
- **Target**: 70%+ coverage maintained

## 📈 Scalability Considerations

### **Horizontal Scaling**

- **Stateless Architecture**: All state in database or client
- **API Design**: RESTful endpoints ready for microservices
- **Database**: PostgreSQL ready for read replicas

### **Vertical Scaling**

- **Performance Monitoring**: Built-in Vercel analytics
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Database Optimization**: Prisma query optimization

## 🎯 Future Architecture Evolution

### **Planned Enhancements**

1. **Microservices**: Split into nutrition-service, user-service
2. **Real-time Features**: WebSocket integration for live updates
3. **Mobile Apps**: React Native with shared business logic
4. **Advanced Analytics**: Dedicated analytics service

### **Technology Migration Path**

- **Database**: SQLite → PostgreSQL → Distributed DB
- **Auth**: NextAuth.js → Custom JWT service
- **Frontend**: SPA → Progressive Web App → Native Apps

---

## 📚 Key Architectural Decisions

### **Why Next.js App Router?**

- **Server-Side Rendering**: Better SEO and initial load times
- **API Integration**: Seamless full-stack development
- **Performance**: Automatic optimizations and code splitting

### **Why Modular Component Structure?**

- **Maintainability**: Easy to locate and modify features
- **Reusability**: Components can be used across different pages
- **Testing**: Isolated testing of individual components

### **Why Custom Hooks?**

- **Separation of Concerns**: Logic separated from UI
- **Reusability**: Hooks can be shared across components
- **Testing**: Easier to test business logic independently

This architecture provides a solid foundation for a scalable, maintainable nutrition tracking application while maintaining the flexibility to evolve with business requirements.
