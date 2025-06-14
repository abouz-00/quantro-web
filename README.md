# 📱 Quantro

**Track what fuels you.**  
Quantro is a fast, focused nutrition tracking app for people who log their food seriously. Built with modern tools like Next.js, TypeScript, Tailwind CSS, and the USDA FoodData Central API.

---

## ⚡ Features

### 🍽️ Food Logging
- 🔍 **Live USDA Food Search** - Search through 400k+ foods from the USDA database
- ⭐ **Favorites System** - Save frequently used foods for quick access
- � **Custom Foods** - Create and save your own food entries with custom macros
- 📅 **Date Navigation** - Track food intake across different days
- 🎯 **Flexible Portions** - Support for grams, ounces, cups, tablespoons, and teaspoons
- 🔄 **Drag & Drop Reordering** - Organize your food entries with intuitive drag-and-drop

### 📊 Nutrition Tracking  
- � **Real-time Macro Tracking** - Live calculation of calories, protein, carbs, and fat
- 🎯 **Custom Targets** - Set personalized daily goals for all macronutrients
- 📊 **Visual Progress Bars** - Color-coded progress indicators for each macro
- ✏️ **Inline Editing** - Edit food amounts directly in the table
- 🗑️ **Quick Removal** - Easy food entry deletion

### 🎨 User Experience
- 🌈 **Modern UI** - Clean, colorful interface built with Tailwind CSS and shadcn/ui
- 🚀 **Blazing Fast** - Optimized for speed with Next.js 15 and React 19
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔒 **Local Storage** - Data persists locally (no account required)
- 🎭 **Error Boundaries** - Robust error handling for smooth user experience

---

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **@dnd-kit** - Modern drag-and-drop functionality
- **Chart.js & Recharts** - Data visualization
- **React DatePicker** - Date selection component
- **USDA FoodData Central API** - Comprehensive nutrition database

---

## 🧪 Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- USDA API Key (optional, defaults to DEMO_KEY)

### Setup Instructions

1. **Navigate to the project directory**
   ```bash
   cd quantro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration (Optional)**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_USDA_API_KEY=your_api_key_here
   ```
   > **Note:** The app works with DEMO_KEY, but get a free API key from [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide.html) for higher rate limits.

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - For development access to the food logging interface, append `?key=dev-access` to the URL

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page with access control
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── food-log/          # Food logging components
│   │   ├── FoodTable.tsx
│   │   ├── FoodSearchModal.tsx
│   │   ├── MacroChart.tsx
│   │   └── ...
│   ├── log/
│   │   └── LogPage.tsx    # Main logging interface
│   └── LandingPage.tsx    # Public landing page
└── lib/
    └── utils.ts           # Utility functions
```

---

## 🌐 Live Site

👉 [https://quantro.fit](https://quantro.fit)

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

### 📈 Next Milestones

- [ ] Export/import CSV or Excel logs
- [ ] PWA support with offline functionality
- [ ] User authentication & cloud sync (Firebase/Supabase)
- [ ] Meal categorization (breakfast, lunch, dinner, snacks)
- [ ] Food entry search and filtering
- [ ] Bulk food operations (select multiple, batch delete)

### 🌟 Advanced Features

- [ ] In-app recipe builder & batch logging
- [ ] Barcode scanner (mobile camera integration)
- [ ] Micronutrient tracking (Vitamins, Minerals)
- [ ] Charting: Weekly/monthly trends & exportable graphs
- [ ] Smart insights: AI-driven meal suggestions & deficiencies alert
- [ ] Photo logging for meals
- [ ] Integration with fitness trackers

### 🚀 Future Vision

- [ ] iOS & Android native apps (React Native)
- [ ] Apple Health / Google Fit integration
- [ ] Social sharing & community challenges
- [ ] Custom meal plans & grocery lists
- [ ] Multi-language support
- [ ] Advanced analytics and reporting  

---

## 📬 Contact

For questions, feedback, or support:

- 📧 **Email:** [hello@quantro.fit](mailto:hello@quantro.fit)
- 🐦 **Twitter:** [@quantroapp](https://twitter.com/quantroapp)

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
