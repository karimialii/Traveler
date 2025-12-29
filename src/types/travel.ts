export interface TravelDates {
  arrivalDate: string;
  arrivalTime: string;
  returnDate: string;
  returnTime: string;
  destination: string;
}

export interface Hotel {
  name: string;
  checkInDate: string;
  checkOutDate: string;
  location: string;
  address?: string;
  approved: boolean;
}

export interface TravelPlan {
  id: string;
  dates: TravelDates;
  hotels: Hotel[];
  itinerary: ItineraryItem[];
  createdAt: Date;
}

export interface ItineraryItem {
  date: string;
  time: string;
  activity: string;
  location: string;
  description: string;
  type: 'accommodation' | 'activity' | 'dining' | 'transport';
}
