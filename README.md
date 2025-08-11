# AICal - AI Calorie Calculator

![AICal Logo](public/vercel.svg) <!-- You might want to create a proper logo -->

AICal (aical) is a Next.js application that uses AI to analyze food images and provide detailed nutritional information. Users can take photos of their meals to instantly get calorie counts, macronutrient breakdowns, and track their daily food intake.

## 🌟 Features

- **AI-Powered Food Analysis**: Take a photo of your food and get instant nutritional analysis
- **Detailed Nutrition Breakdown**: View calories, protein, carbs, fat, and vitamin content
- **Food Journal**: Keep track of all your meals by date and meal type
- **Daily Dashboard**: Monitor your daily nutritional intake at a glance
- **Personalized Nutrition Goals**: Set and track goals for daily calorie and macronutrient intake
- **Meal-Specific Goals**: Set individual nutrition targets for breakfast, lunch, dinner, and snacks

## 🚀 Technology Stack

- **Frontend**: [Next.js 15.3.0](https://nextjs.org/) with [React 19](https://react.dev/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/) with custom theme
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) components
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **AI**: [Google Gemini AI](https://ai.google.dev/) for image analysis
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/) for schema validation
- **State Management**: React Context API with localStorage persistence

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (>= 16.x)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) (if using the database features)

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aical.git
   cd aical
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/aical"
   GEMINI_API_KEY="your_gemini_api_key"
   NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key" # Only if needed in client components
   ```

4. Set up the database:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Same key as GEMINI_API_KEY, if needed on the client side | No |

## 💾 Database Schema

The application uses Prisma with PostgreSQL. The main schema includes:

```prisma
model FoodEntry {
  id          String   @id @default(cuid())
  userId      String
  foodName    String
  calories    Int
  protein     Int
  carbs       Int
  fats        Int
  createdAt   DateTime @default(now())
  imageUrl    String?

  @@index([userId])
}
```

## 📱 Usage

### Food Analysis

1. Navigate to the home page
2. Take a photo of your food or upload an existing image
3. The AI will analyze the image and return nutritional information
4. Save the meal to your food journal with specific meal type and time

### Food Journal

1. Navigate to the "Journal alimentaire" tab
2. Browse your meal history by date
3. View detailed nutritional information for each day and meal type
4. Add or remove meals from your journal

### Setting Nutrition Goals

1. Click on the "Objectifs" button in the journal view
2. Set daily goals for calories, protein, carbs, and fats
3. Set specific goals for each meal type (breakfast, lunch, dinner, snacks)
4. Track your progress with visual indicators

## 📁 Project Structure

```
aical/
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── src/
│   ├── actions/          # Server actions
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── ui/           # UI components (from shadcn/ui)
│   │   └── ...           # Custom components
│   ├── context/          # React context providers
│   └── lib/              # Utility functions and shared code
├── .env.local            # Environment variables (not in repo)
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.mjs    # PostCSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔄 API Routes

### `/api/analyze`

- **Method**: POST
- **Purpose**: Analyze food images using Google Gemini AI
- **Request Body**:
  ```json
  {
    "image": {
      "inlineData": {
        "data": "base64EncodedImageString",
        "mimeType": "image/jpeg"
      }
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "foodAnalysis": {
        "identifiedFood": "Food name and description",
        "portionSize": "Estimated portion size in grams",
        "nutritionFactsPerPortion": {
          "calories": "Estimated calories",
          "protein": "Protein in grams",
          "carbs": "Carbs in grams",
          "fat": "Fat in grams",
          "fiber": "Fiber in grams",
          "sugar": "Sugar in grams"
        },
        "additionalNotes": ["Vitamin content", "Allergens", etc]
      }
    }
  }
  ```

## 🧩 Key Components

- **ImageUploader**: Handles image upload and API call to analyze food
- **NutritionCard**: Displays the nutritional information of analyzed food
- **DailyDashboard**: Shows daily nutrition overview and meal tracking
- **MealsContext**: Manages meal data and goals across the application
- **NutritionGoalsDialog**: Allows setting custom nutrition goals

## 🌐 Internationalization

The application is currently available in French only, with plans to add more languages in future versions.

## 🔍 Future Enhancements

- User authentication system
- Recipe suggestions based on nutritional goals
- Barcode scanning for packaged foods
- Export and sharing options for nutrition data
- Meal planning features
- Additional languages support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Google Gemini AI](https://ai.google.dev/)
- [Framer Motion](https://www.framer.com/motion/)
