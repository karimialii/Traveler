'use client';

import { useState } from 'react';
import DateTimeStep from './steps/DateTimeStep';
import HotelStep from './steps/HotelStep';
import SuggestionsStep from './steps/SuggestionsStep';
import { TravelDates, Hotel } from '@/types/travel';

export default function TravelWizard() {
  const [step, setStep] = useState(1);
  const [travelDates, setTravelDates] = useState<TravelDates | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✈️</span>
              <h1 className="text-xl font-semibold text-gray-900">Travel Planner</h1>
            </div>
            
            {/* Progress Steps - iOS style */}
            {step < 3 && (
              <div className="flex items-center gap-4">
                {[1, 2].map((num) => (
                  <div key={num} className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                        step >= num
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {num}
                    </div>
                    <span className={`text-sm font-medium ${
                      step >= num ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {num === 1 ? 'Dates' : 'Hotels'}
                    </span>
                    {num < 2 && <div className="w-8 h-px bg-gray-300" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Step Content */}
      <div className={step === 3 ? '' : 'max-w-2xl mx-auto px-6 py-8'}>
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <DateTimeStep onSubmit={handleDateSubmit} />
          </div>
        )}
        {step === 2 && travelDates && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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
