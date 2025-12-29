# Travel Planner Web App

A modern, interactive travel planning application built with Next.js, React, and Tailwind CSS.

## Features

- **Step 1: Travel Dates** - Input your destination, departure date, arrival date/time, and return date
- **Step 2: Hotels** - Add multiple hotel preferences with amenities selection
- **Step 3: AI Suggestions** - Get personalized travel itineraries based on your dates and hotels
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Validation** - Form validation with helpful error messages

## Tech Stack

- **Frontend**: Next.js 16+ with React 19
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **API**: Built-in API routes for itinerary generation

## Running Locally

The development server is running at **http://localhost:3000**

To start it manually:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

## Usage

1. **Enter Trip Details** - Destination, departure date, arrival date/time, return date
2. **Select Hotels** - Add hotels with location, price, and amenities
3. **Get Suggestions** - View your complete personalized travel itinerary

## Project Structure

- `src/app/page.tsx` - Home page
- `src/components/TravelWizard.tsx` - Main wizard component
- `src/components/steps/` - Individual form steps
- `src/app/api/generate-itinerary/route.ts` - API for generating travel plans
- `src/types/travel.ts` - TypeScript type definitions

## Customization

To integrate real AI suggestions, update `src/app/api/generate-itinerary/route.ts` to call OpenAI, Claude, or another API service.

## Deployment

Deploy to Vercel, Netlify, AWS Amplify, or any Node.js-compatible hosting.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
