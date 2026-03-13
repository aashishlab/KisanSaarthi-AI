const API_URL = '/api';

export interface Booking {
  id: number;
  farmer_id: number;
  hub_id: number;
  slot_id: number;
  vehicle_no: string;
  token_number: number;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected';
  created_at: string;
  farmer_name?: string;
  farmer_phone?: string;
  slot_time?: string;
  hub_name?: string;
  hub_location?: string;
  hub_category?: string;
  waiting_time?: string;
  crop_type?: string;
  load_quantity?: number;
}

export interface Slot {
  id: number;
  hub_id: number;
  slot_time: string;
  capacity: number;
  booked_count: number;
  total_booked_load: number;
}


export interface QueueData {
  metrics: {
    waiting: number;
    active: number;
    completed: number;
  };
  queue: Booking[];
}

export interface RequestsData {
  requests: Booking[];
  total: number;
}

export interface Hub {
  id: number;
  factory_id: number;
  name: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity_per_slot: number;
  processing_capacity_per_hour: number;
  average_truck_load: number;
  working_start_time: string;
  working_end_time: string;
  break_start: string;
  break_end: string;
  queue_size: number;
  total_load?: number;
  created_at: string;
}

export const fetchQueue = async (): Promise<QueueData> => {
  const res = await fetch(`${API_URL}/queue`);
  if (!res.ok) throw new Error('Failed to fetch queue');
  return res.json();
};

export const fetchHubsByCategory = async (category: string): Promise<Hub[]> => {
  const res = await fetch(`${API_URL}/hubs?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error('Failed to fetch hubs by category');
  return res.json();
};

export const fetchCategoryCounts = async (): Promise<Record<string, number>> => {
  const res = await fetch(`${API_URL}/hubs/category-counts`);
  if (!res.ok) throw new Error('Failed to fetch category counts');
  return res.json();
};


export const fetchRequests = async (): Promise<RequestsData> => {
  const res = await fetch(`${API_URL}/requests`);
  if (!res.ok) throw new Error('Failed to fetch requests');
  return res.json();
};

export const fetchPendingCount = async (hub_id?: number): Promise<{ count: number }> => {
  const url = hub_id ? `${API_URL}/pending-count?hub_id=${hub_id}` : `${API_URL}/pending-count`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch pending count');
  return res.json();
};

export const acceptRequest = async (id: number) => {
  const res = await fetch(`${API_URL}/accept-request/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to accept request');
  }
  return res.json();
};

export const rejectRequest = async (id: number) => {
  const res = await fetch(`${API_URL}/reject-request/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to reject request');
  }
  return res.json();
};

export const assignSlot = async (id: number, arrival_slot: string) => {
  const res = await fetch(`${API_URL}/assign-slot/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ arrival_slot })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to assign slot');
  }
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

export interface RegisterFactoryData {
  factory_name: string;
  phone: string;
  password: string;
  hub_name: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity_per_slot: number;
}

export const registerFactory = async (data: RegisterFactoryData) => {
  const res = await fetch(`${API_URL}/factory/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to register factory');
  }
  return res.json();
};

export interface RegisterFarmerData {
  name: string;
  phone: string;
  password: string;
  village: string;
  vehicle_no: string;
  crop_type: string;
  preferred_hub: string;
}

export const registerFarmer = async (data: RegisterFarmerData) => {
  const res = await fetch(`${API_URL}/farmer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to register farmer');
  }
  return res.json();
};

export interface LoginData {
  phone: string;
  password: string;
  role?: string;
}

export const login = async (data: LoginData) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Login failed');
  }
  return res.json();
};

export const createSlot = async (data: { hub_id: number; slot_time: string; capacity: number }): Promise<any> => {
  const res = await fetch(`${API_URL}/slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create slot');
  return res.json();
};

export const fetchSlots = async (hub_id: number): Promise<Slot[]> => {
  const res = await fetch(`${API_URL}/slots?hub_id=${hub_id}`);
  if (!res.ok) throw new Error('Failed to fetch slots');
  return res.json();
};

export interface BookingPayloadSlot {
  slot_id: number;
  slot_time: string;
  allocated_load: number;
}

export interface BookingPayload {
  farmer_id: number;
  hub_id: number;
  vehicle_number: string;
  total_load: number;
  slots: BookingPayloadSlot[];
}

export interface BookingResponseSlot {
  slot_time: string;
  load: number;
}

export interface BookingResponse {
  booking_id: number;
  token_number: number;
  allocated_slots: BookingResponseSlot[];
  estimated_wait_time: string;
}

export const bookSlotNew = async (data: BookingPayload): Promise<BookingResponse> => {
  const res = await fetch(`${API_URL}/book-slot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Booking failed');
  }
  return res.json();
};

export const fetchHubBookings = async (hub_id: number): Promise<Booking[]> => {
  const res = await fetch(`${API_URL}/bookings?hub_id=${hub_id}`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
};

export const updateBookingStatusNew = async (id: number, status: string): Promise<any> => {
  const res = await fetch(`${API_URL}/update-booking-status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
};
export const fetchFactoryHub = async (factory_id: number): Promise<Hub> => {
  const res = await fetch(`${API_URL}/factory/hub/${factory_id}`);
  if (!res.ok) throw new Error('Failed to fetch factory hub');
  return res.json();
};

export const updateHubSettings = async (hub_id: number, data: any): Promise<any> => {
  const res = await fetch(`${API_URL}/hubs/${hub_id}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update hub settings');
  return res.json();
};

export type ArrivalBooking = Booking;

export const fetchFarmerBookings = async (farmer_id: number): Promise<ArrivalBooking[]> => {
  const res = await fetch(`${API_URL}/farmer/bookings/${farmer_id}`);
  if (!res.ok) throw new Error('Failed to fetch farmer bookings');
  return res.json();
};

// Legacy Aliases for backward compatibility
export const fetchFactoryBookings = fetchHubBookings;

export const approveBooking = async (id: number, data?: any) => {
  // Map old approval call to new status update
  return updateBookingStatusNew(id, 'Approved');
};
