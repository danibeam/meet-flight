export interface FlightSearchProvider {
  searchCheapestDates(params: {
    origin: string;
    destination: string;
    departureDateRange: string;
    duration: string;
    nonStop: boolean;
  }): Promise<FlightDateResult[]>;
}

export interface FlightDateResult {
  departureDate: string;
  returnDate: string;
  price: { total: string; currency: string };
}
