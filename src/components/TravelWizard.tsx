'use client';

import { useState, useEffect } from 'react';
import DateTimeStep from './steps/DateTimeStep';
import HotelStep from './steps/HotelStep';
import SuggestionsStep from './steps/SuggestionsStep';
import { TravelDates, Hotel } from '@/types/travel';

interface SavedTravel {
  id: string;
  travelDates: TravelDates;
  hotels: Hotel[];
  savedAt: string;
}

export default function TravelWizard() {
  const [step, setStep] = useState(1);
  const [travelDates, setTravelDates] = useState<TravelDates | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [savedTravels, setSavedTravels] = useState<SavedTravel[]>([]);
  const [showSavedTravels, setShowSavedTravels] = useState(false);

  // Load saved travels from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedTravels');
    if (saved) {
      setSavedTravels(JSON.parse(saved));
    }
  }, []);

  const saveCurrentTravel = () => {
    if (!travelDates) return;

    const newTravel: SavedTravel = {
      id: Date.now().toString(),
      travelDates,
      hotels,
      savedAt: new Date().toISOString(),
    };

    const updated = [newTravel, ...savedTravels];
    setSavedTravels(updated);
    localStorage.setItem('savedTravels', JSON.stringify(updated));
    alert('Travel saved successfully!');
  };

  const loadTravel = (travel: SavedTravel) => {
    setTravelDates(travel.travelDates);
    setHotels(travel.hotels);
    setStep(3);
    setShowSavedTravels(false);
  };

  const deleteTravel = (id: string) => {
    const updated = savedTravels.filter(t => t.id !== id);
    setSavedTravels(updated);
    localStorage.setItem('savedTravels', JSON.stringify(updated));
  };

  const handleDateSubmit = (dates: TravelDates) => {
    setTravelDates(dates);
    setStep(2);
  };

  const handleHotelSubmit = (hotelList: Hotel[]) => {
    setHotels(hotelList);
    setStep(3);
  };

  const handleRestart = () => {
    setStep(1);
    setTravelDates(null);
    setHotels([]);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✈️</span>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Travel Planner</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Saved Travels Button */}
              {step === 1 && savedTravels.length > 0 && (
                <button
                  onClick={() => setShowSavedTravels(!showSavedTravels)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  📋 Saved Travels ({savedTravels.length})
                </button>
              )}

              {/* Save Current Travel Button */}
              {step === 3 && (
                <button
                  onClick={saveCurrentTravel}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  💾 Save Travel
                </button>
              )}

              {/* Progress Steps - iOS style */}
              {step < 3 && (
                <div className="flex items-center gap-4">
                  {[1, 2].map((num) => (
                    <div key={num} className="flex items-center gap-2">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                          step >= num
                            ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg dark:shadow-blue-900/50'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {num}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        step >= num ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {num === 1 ? 'Dates' : 'Hotels'}
                      </span>
                      {num < 2 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Saved Travels List */}
      {showSavedTravels && step === 1 && (
        <div className="max-w-4xl mx-auto px-6 py-8 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Travels</h2>
              <button
                onClick={() => setShowSavedTravels(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {savedTravels.map((travel) => (
                <div
                  key={travel.id}
                  className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md dark:hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {travel.travelDates.destination}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        📅 {new Date(travel.travelDates.arrivalDate).toLocaleDateString()} - {new Date(travel.travelDates.returnDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        🏨 {travel.hotels.length} hotel{travel.hotels.length !== 1 ? 's' : ''} • Saved {new Date(travel.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadTravel(travel)}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteTravel(travel.id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className={step === 3 ? '' : 'max-w-2xl mx-auto px-6 py-8'}>
        {step === 1 && !showSavedTravels && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-8 animate-fadeIn">
            <DateTimeStep onSubmit={handleDateSubmit} />
          </div>
        )}
        {step === 2 && travelDates && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-8 animate-fadeIn">
            <HotelStep travelDates={travelDates} onSubmit={handleHotelSubmit} />
          </div>
        )}
        {step === 3 && travelDates && (
          <SuggestionsStep
            travelDates={travelDates}
            hotels={hotels}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
