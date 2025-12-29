'use client';

import { useState, useEffect } from 'react';
import { TravelDates, Hotel, ItineraryItem } from '@/types/travel';
import ItineraryMap from '../ItineraryMap';

interface Props {
  travelDates: TravelDates;
  hotels: Hotel[];
  onRestart: () => void;
}

export default function SuggestionsStep({
  travelDates,
  hotels,
  onRestart,
}: Props) {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    generateSuggestions();
  }, [travelDates, hotels]);

  // Auto-select first day when itinerary loads
  useEffect(() => {
    if (itinerary.length > 0 && !selectedDay) {
      setSelectedDay(itinerary[0].date);
    }
  }, [itinerary]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelDates,
          hotels,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setItinerary(data.itinerary);
      } else {
        console.error('Failed to generate itinerary');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDays = () => {
    const start = new Date(travelDates.arrivalDate);
    const end = new Date(travelDates.returnDate);
    return Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      accommodation: '🏨',
      activity: '🎯',
      dining: '🍽️',
      transport: '🚗',
    };
    return icons[type] || '📍';
  };

  // Group itinerary by day
  const groupedByDay = itinerary.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, ItineraryItem[]>);

  const days = Object.keys(groupedByDay).sort();
  const selectedDayItems = selectedDay ? groupedByDay[selectedDay] || [] : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Travel Plan</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-1">Destination</h3>
          <p className="text-2xl font-bold text-blue-600">
            {travelDates.destination}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-1">Trip Duration</h3>
          <p className="text-2xl font-bold text-green-600">
            {calculateTotalDays()} Days
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-900 mb-1">Hotels</h3>
          <p className="text-2xl font-bold text-purple-600">
            {hotels.length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Generating your travel plan...</p>
        </div>
      ) : itinerary.length > 0 ? (
        <>
          {/* Two Column Layout: Days on Left, Map on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Side: Days and Itinerary (40%) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Daily Itinerary</h3>
              
              {/* Day Tabs */}
              <div className="flex flex-wrap gap-2">
                {days.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedDay === day
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Day {idx + 1}
                    <span className="block text-xs opacity-80">
                      {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Day's Activities */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-200 p-4">
                  <h4 className="font-semibold text-indigo-900">
                    {selectedDay && new Date(selectedDay).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <p className="text-sm text-indigo-700">
                    {selectedDayItems.length} activities planned
                  </p>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="p-4 space-y-3">
                    {selectedDayItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-indigo-500 pl-4 py-3 bg-white hover:bg-gray-50 transition rounded-r"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {getActivityIcon(item.type)} {item.activity}
                            </p>
                            <p className="text-sm text-gray-600">{item.location}</p>
                          </div>
                          <p className="text-sm font-medium text-indigo-600">{item.time}</p>
                        </div>
                        <p className="text-sm text-gray-700">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Map (60%) */}
            <div className="lg:col-span-3">
              <ItineraryMap 
                itinerary={selectedDayItems} 
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
              />
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-600 text-center py-8">
          No itinerary items generated. Try again!
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          ← Start Over
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          🖨️ Print Plan
        </button>
      </div>
    </div>
  );
}
