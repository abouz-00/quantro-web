# 📱 Quantro

**Track what fuels you.**  
Quantro is a fast, focused nutrition tracking app for people who log their food seriously. Built with modern tools like Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma ORM, and the USDA FoodData Central API.

## 🌐 Live Site

👉 [https://quantro.fit](https://quantro.fit)

## 🎯 Beta Access

Quantro is currently in beta with a curated invite system. Features include:

- **Invite Management** - Admin dashboard for managing beta invitations
- **Email Notifications** - Beautiful, branded invitation emails
- **Access Control** - Secure beta access validation
- **User Onboarding** - Streamlined sign-up process for beta users

*Interested in joining the beta? Follow our social media for updates on invite availability.*

> **🚀 Currently in Beta** - Join the beta to get early access to the most focused nutrition tracking experience.

> **🚀 Currently in Beta** - Join the beta to get early access to the most focused nutrition tracking experience.

---

## ⚡ Features

### 🍽️ Food Logging

- 🔍 **Live USDA Food Search** - Search through 400k+ foods from the USDA database
- ⭐ **Favorites System** - Save frequently used foods for quick access
- 📝 **Custom Foods** - Create and save your own food entries with custom macros
- 📅 **Date Navigation** - Track food intake across different days
- 🎯 **Flexible Portions** - Support for grams, ounces, cups, tablespoons, and teaspoons
- 🔄 **Drag & Drop Reordering** - Organize your food entries with intuitive drag-and-drop
- 🍽️ **Meal Types** - Organize food entries by meal (breakfast, lunch, dinner, snacks) with collapsible sections

### 📊 Nutrition Tracking  

- 📈 **Real-time Macro Tracking** - Live calculation of calories, protein, carbs, and fat
- 🎯 **Custom Targets** - Set personalized daily goals for all macronutrients
- 📊 **Visual Progress Bars** - Color-coded progress indicators for each macro
- 📊 **Nutrient Donut Charts** - Visual breakdown of macro distribution
- ✏️ **Inline Editing** - Edit food amounts directly in the table
- 🗑️ **Quick Removal** - Easy food entry deletion

### 🔐 Authentication & Beta Access

- 🔑 **Multi-Auth Options** - Sign in with Google or Apple
- 🎯 **Beta Access Control** - Curated beta invite system with email notifications
- 👤 **User Profiles** - Personalized nutrition goals and preferences
- 🔄 **Cloud Sync** - Your data syncs across devices when signed in
- 📧 **Email Integration** - Beautiful beta invite emails via Resend API

### 🎨 User Experience

- 🌈 **Modern UI** - Clean, colorful interface built with Tailwind CSS and shadcn/ui
- 🚀 **Blazing Fast** - Optimized for speed with Next.js 15 and React 19
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎭 **Error Boundaries** - Robust error handling for smooth user experience
- 📱 **PWA Support** - Install as a progressive web app on mobile devices
- 🛠️ **Admin Dashboard** - Beta invite management and monitoring tools
- 🎯 **TypeScript** - Full type safety for better developer experience

---

## 🏛️ Project Architecture

Quantro follows modern React/Next.js best practices with:

- **Component-Based Architecture** - Modular, reusable UI components
- **Custom Hooks** - Separated business logic for better testing
- **Type Safety** - Full TypeScript implementation
- **Server Components** - Optimized performance with Next.js App Router
- **Database Layer** - Prisma ORM with type-safe database operations
- **Error Boundaries** - Graceful error handling throughout the app
- **Responsive Design** - Mobile-first approach with Tailwind CSS

### **Key Directories**

```text
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   ├── food-log/       # Food logging components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── charts/         # Data visualization components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── services/           # API and external service integrations
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

---

## 🚧 Roadmap

### ✅ Core MVP (Completed)

- [x] Live USDA food search & selection
- [x] Add/remove food entries with accurate macros
- [x] Daily totals & macro progress bars
- [x] Custom calorie/protein/carb/fat targets
- [x] Date picker & historical log view
- [x] Drag & drop food entry reordering
- [x] Favorites system for frequently used foods
- [x] Custom food creation and management
- [x] Inline editing of food amounts
- [x] Responsive mobile-friendly design
- [x] PWA support with offline functionality
- [x] User authentication (Google & Apple Sign-In)
- [x] Cloud data synchronization
- [x] Beta access control system
- [x] Admin dashboard for beta management
- [x] Email notification system for invites
- [x] Comprehensive test suite (Jest + React Testing Library)
- [x] Meal categorization UI (breakfast, lunch, dinner, snacks)
- [x] Production deployment on Vercel
- [x] PostgreSQL database integration

### 📈 Next Milestones

- [ ] Export/import CSV or Excel logs
- [ ] Food entry search and filtering within daily logs
- [ ] Bulk food operations (select multiple, batch delete)
- [ ] Weekly/monthly nutrition analytics
- [ ] Nutrition goal recommendations based on user profile
- [ ] Enhanced meal planning features

### 🌟 Advanced Features

- [ ] In-app recipe builder & batch logging
- [ ] Barcode scanner (mobile camera integration)
- [ ] Micronutrient tracking (Vitamins, Minerals)
- [ ] Advanced charts: Weekly/monthly trends & exportable graphs
- [ ] Smart insights: AI-driven meal suggestions & deficiencies alert
- [ ] Photo logging for meals
- [ ] Integration with fitness trackers
- [ ] Meal planning and grocery list generation
- [ ] Custom recipe creation and macro calculation

### 🚀 Future Vision

- [ ] Flutter mobile apps (iOS & Android)
- [ ] Social sharing & community challenges
- [ ] Custom meal plans & grocery lists
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] API for third-party integrations  

---

## 💻 Technology Stack

### **Frontend & Core**

- **Framework**: Next.js 15 with App Router & React 19
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS 4.0 + DaisyUI + Tailwind Merge
- **UI Components**: shadcn/ui, Headless UI, Radix UI
- **Icons**: Lucide React, React Icons, Heroicons
- **Animations**: Framer Motion, tw-animate-css

### **Backend & Data**

- **Database**: Prisma ORM with PostgreSQL (production) / SQLite (development)
- **Authentication**: NextAuth.js v5 with Google & Apple providers
- **Email**: Resend API for beta invitations and notifications
- **External APIs**: USDA FoodData Central API

### **Development & Testing**

- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier
- **Dev Tools**: TypeScript strict mode, custom scripts
- **Database Tools**: Prisma migrations, schema management

### **Deployment & Infrastructure**

- **Hosting**: Vercel with automatic deployments
- **CI/CD**: GitHub Actions integration
- **Security**: Environment variable management, CORS, CSP headers
- **Monitoring**: Built-in error boundaries and logging

---

## 🛠️ Development Setup

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/quantrodev/quantro.git
cd quantro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### **Available Scripts**

- `npm run dev` - Start development server on port 3000
- `npm run dev:clean` - Clean restart development server
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

### **Database Management**

- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `./scripts/switch-db.sh local` - Switch to local SQLite database
- `./scripts/setup-test-db.sh` - Set up test database

---

## 📬 Contact

For questions, feedback, or support:

- 📧 **Email:** [hello@quantro.fit](mailto:hello@quantro.fit)
- 🐦 **X/Twitter:** [@quantro_app](https://x.com/quantro_app)
- 📸 **Instagram:** [@quantro_app](https://instagram.com/quantro_app)
- 📱 **TikTok:** [@quantro_app](https://tiktok.com/@quantro_app)

---

## 📄 License

Quantro is proprietary software. All rights reserved. This project is not open-source and may not be redistributed or modified without explicit permission.

---

## 📸 Screenshots

> **Note:** Screenshots coming soon! The app features a modern, clean interface built with Tailwind CSS.

**Key Interface Highlights:**

- 🎨 Beautiful gradient backgrounds and card-based layout
- 📊 Visual macro progress bars with color coding
- 🔍 Intuitive food search with real-time suggestions
- 📱 Responsive design that works on all screen sizes
- ⭐ Favorites and custom food management
- 🎯 Customizable nutrition targets

---

Made with ❤️ for the nutrition tracking community
