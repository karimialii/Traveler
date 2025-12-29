import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { TravelDates, Hotel, ItineraryItem } from '@/types/travel';

interface RequestBody {
  travelDates: TravelDates;
  hotels: Hotel[];
}

// Call Python script to generate itinerary using Google Gemini
async function generateGeminiItinerary(
  travelDates: TravelDates,
  hotels: Hotel[]
): Promise<ItineraryItem[]> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'generate_itinerary.py');
    const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
    
    const python = spawn(pythonPath, [pythonScript], {
      env: {
        ...process.env,
        GOOGLE_GEMINI_KEY: process.env.GOOGLE_GEMINI_KEY,
      },
    });

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        reject(new Error(`Python script failed: ${errorOutput}`));
        return;
      }

      try {
        const itinerary = JSON.parse(output);
        resolve(itinerary);
      } catch (e) {
        console.error('Failed to parse Python output:', output);
        reject(new Error('Failed to parse itinerary response'));
      }
    });

    // Send input to Python script
    const inputData = {
      destination: travelDates.destination,
      arrivalDate: travelDates.arrivalDate,
      arrivalTime: travelDates.arrivalTime,
      returnDate: travelDates.returnDate,
      returnTime: travelDates.returnTime,
      hotels: hotels,
    };

    python.stdin.write(JSON.stringify(inputData));
    python.stdin.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { travelDates, hotels } = body;

    // Validate input
    if (!travelDates || !travelDates.destination) {
      return NextResponse.json(
        { error: 'Invalid travel dates' },
        { status: 400 }
      );
    }

    // Check if API key is set
    if (!process.env.GOOGLE_GEMINI_KEY) {
      return NextResponse.json(
        { error: 'Google Gemini API key not configured. Set GOOGLE_GEMINI_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Generate itinerary using Gemini
    const itinerary = await generateGeminiItinerary(travelDates, hotels);

    return NextResponse.json({ itinerary }, { status: 200 });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json(
      { error: `Failed to generate itinerary: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
