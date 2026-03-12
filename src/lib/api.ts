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
  queue_size: number;
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

export const fetchPendingCount = async (): Promise<{ count: number }> => {
  const res = await fetch(`${API_URL}/pending-count`);
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

