const API_URL = '/api';

export interface Booking {
  id: number;
  farmer_name: string;
  vehicle_no: string;
  hub_name: string;
  arrival_slot: string;
  status: string;
}

export interface QueueData {
  metrics: {
    waiting: number;
    active: number;
    completed: number;
  };
  queue: Booking[];
}

export const fetchQueue = async (): Promise<QueueData> => {
  const res = await fetch(`${API_URL}/queue`);
  if (!res.ok) throw new Error('Failed to fetch queue');
  return res.json();
};

export const updateBookingStatus = async (id: number, status: string) => {
  const res = await fetch(`${API_URL}/update-status/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
};

export const bookSlot = async (bookingData: { farmer_name: string; vehicle_no: string; hub_name: string; arrival_slot: string }) => {
  const res = await fetch(`${API_URL}/book-slot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to book slot');
  }
  return res.json();
};
