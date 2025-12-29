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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Compact Top Bar - Booking Style */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Destination</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{travelDates.destination}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dates</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(travelDates.arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(travelDates.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{calculateTotalDays()} days</p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏨</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hotels</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{hotels.length}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onRestart}
              className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center animate-fadeIn">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Creating your itinerary...</p>
          </div>
        </div>
      ) : itinerary.length > 0 ? (
        <>
          {/* Full Width Split Layout */}
          <div className="flex h-[calc(100vh-64px)]">
            {/* Left Sidebar: Days and Activities */}
            <div className="w-[480px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Day Selector */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {days.map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedDay === day
                          ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg dark:shadow-blue-900/50 scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                      }`}
                    >
                      <div className="text-sm font-semibold">Day {idx + 1}</div>
                      <div className="text-xs opacity-80 mt-0.5">
                        {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedDay && new Date(selectedDay).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedDayItems.length} activities
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedDayItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg dark:hover:shadow-2xl hover:border-gray-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer hover:scale-[1.02] animate-fadeIn"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 shadow-md">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base">{getActivityIcon(item.type)}</span>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                  {item.activity}
                                </h4>
                              </div>
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{item.location}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Full-Width Map */}
            <div className="flex-1">
              <ItineraryMap 
                itinerary={selectedDayItems} 
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <p className="text-gray-500 dark:text-gray-400">No itinerary generated. Please try again.</p>
        </div>
      )}
    </div>
  );
}
