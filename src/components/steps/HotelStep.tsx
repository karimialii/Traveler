'use client';

import { useState } from 'react';
import { TravelDates, Hotel } from '@/types/travel';

interface Props {
  travelDates: TravelDates;
  onSubmit: (hotels: Hotel[]) => void;
}

interface HotelSearchResult {
  name: string;
  location: string;
  address: string;
}

export default function HotelStep({ travelDates, onSubmit }: Props) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelSearch, setHotelSearch] = useState('');
  const [searchResults, setSearchResults] = useState<HotelSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelSearchResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualHotel, setManualHotel] = useState({
    name: '',
    address: '',
    checkInDate: travelDates.arrivalDate,
    checkOutDate: travelDates.returnDate,
  });

  const handleSearch = async (page: number = 1) => {
    if (!hotelSearch.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/search-hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName: hotelSearch,
          destination: travelDates.destination,
          page: page,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
        setCurrentPage(page);
        setHasMore(data.hasMore || false);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHotel = (hotel: HotelSearchResult) => {
    setSelectedHotel(hotel);
  };

  const handleApproveHotel = () => {
    if (!selectedHotel) return;

    const newHotel: Hotel = {
      name: selectedHotel.name,
      location: selectedHotel.location,
      address: selectedHotel.address,
      checkInDate: travelDates.arrivalDate,
      checkOutDate: travelDates.returnDate,
      approved: true,
    };

    setHotels([...hotels, newHotel]);
    setHotelSearch('');
    setSearchResults([]);
    setSelectedHotel(null);
  };

  const handleAddManualHotel = () => {
    if (!manualHotel.name.trim() || !manualHotel.address.trim()) return;

    const newHotel: Hotel = {
      name: manualHotel.name,
      location: travelDates.destination,
      address: manualHotel.address,
      checkInDate: manualHotel.checkInDate,
      checkOutDate: manualHotel.checkOutDate,
      approved: true,
    };

    setHotels([...hotels, newHotel]);
    setManualHotel({
      name: '',
      address: '',
      checkInDate: travelDates.arrivalDate,
      checkOutDate: travelDates.returnDate,
    });
    setShowManualEntry(false);
  };

  const handleRemoveHotel = (index: number) => {
    setHotels(hotels.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(hotels);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hotel Selection</h2>

      {/* Toggle between Search and Manual Entry */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setShowManualEntry(false)}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            !showManualEntry
              ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          🔍 Search Hotels
        </button>
        <button
          type="button"
          onClick={() => setShowManualEntry(true)}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            showManualEntry
              ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          ✏️ Enter Manually
        </button>
      </div>

      {!showManualEntry ? (
        /* Hotel Search Form */
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Search for Hotels
          </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hotel Name *
            </label>
            <input
              type="text"
              value={hotelSearch}
              onChange={(e) => setHotelSearch(e.target.value)}
              placeholder="e.g., Hilton, Marriott, The Plaza"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            📍 Location: {travelDates.destination} | 📅 {travelDates.arrivalDate} to {travelDates.returnDate}
          </p>

          <button
            type="button"
            onClick={() => handleSearch(1)}
            disabled={loading || !hotelSearch.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg"
          >
            {loading ? 'Searching...' : 'Search Hotels'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-6 space-y-3 animate-fadeIn">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Search Results:</h4>
            {searchResults.map((hotel, idx) => (
              <div
                key={idx}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedHotel?.name === hotel.name
                    ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:scale-[1.01]'
                }`}
                onClick={() => handleSelectHotel(hotel)}
              >
                <p className="font-semibold text-gray-900 dark:text-white">{hotel.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{hotel.location}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{hotel.address}</p>
              </div>
            ))}

            {selectedHotel && (
              <button
                type="button"
                onClick={handleApproveHotel}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg mt-4"
              >
                ✓ Approve & Add {selectedHotel.name}
              </button>
            )}

            {hasMore && (
              <button
                type="button"
                onClick={() => handleSearch(currentPage + 1)}
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg mt-4"
              >
                {loading ? 'Loading...' : 'Load More Hotels'}
              </button>
            )}
          </div>
        )}

        {searchResults.length === 0 && hotelSearch && !loading && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">No hotels found. Try a different name.</p>
        )}
      </div>
      ) : (
        /* Manual Hotel Entry Form */
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Enter Hotel Details Manually
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hotel Name *
              </label>
              <input
                type="text"
                value={manualHotel.name}
                onChange={(e) => setManualHotel({ ...manualHotel, name: e.target.value })}
                placeholder="e.g., Hotel Mondial"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                value={manualHotel.address}
                onChange={(e) => setManualHotel({ ...manualHotel, address: e.target.value })}
                placeholder="e.g., 5 Boulevard Montmartre, 75002 Paris, France"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  value={manualHotel.checkInDate}
                  onChange={(e) => setManualHotel({ ...manualHotel, checkInDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  value={manualHotel.checkOutDate}
                  onChange={(e) => setManualHotel({ ...manualHotel, checkOutDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddManualHotel}
              disabled={!manualHotel.name.trim() || !manualHotel.address.trim()}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              ✓ Add Hotel
            </button>
          </div>
        </div>
      )}

      {/* Selected Hotels */}
      {hotels.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Selected Hotels</h3>
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ✓ {hotel.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{hotel.location}</p>
                  {hotel.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{hotel.address}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveHotel(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                📅 Check-in: {hotel.checkInDate} | Check-out: {hotel.checkOutDate}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={hotels.length === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg"
        >
          Get Suggestions →
        </button>
      </div>
    </form>
  );
}
