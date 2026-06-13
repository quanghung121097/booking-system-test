import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import api from '../api/axios';
import { toApiDateTime } from '../utils/datetime';

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('user') ?? 'null');
  } catch {
    return null;
  }
})();

export const defaultBookingQuery = {
  page: 1,
  per_page: 10,
  user_name: '',
  from: '',
  to: '',
};

const initialState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: storedUser,
  rooms: [],
  selectedRoom: null,
  bookings: [],
  bookingsMeta: null,
  bookingQuery: { ...defaultBookingQuery },
  roomsLoading: false,
  bookingsLoading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ROOMS_LOADING':
      return { ...state, roomsLoading: action.payload, error: null };
    case 'SET_BOOKINGS_LOADING':
      return { ...state, bookingsLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, roomsLoading: false, bookingsLoading: false, error: action.payload };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload, roomsLoading: false };
    case 'SELECT_ROOM':
      return {
        ...state,
        selectedRoom: action.payload,
        bookings: [],
        bookingsMeta: null,
        bookingQuery: { ...defaultBookingQuery },
      };
    case 'SET_BOOKINGS':
      return {
        ...state,
        bookings: action.payload.items,
        bookingsMeta: action.payload.meta,
        bookingQuery: action.payload.query ?? state.bookingQuery,
        bookingsLoading: false,
      };
    case 'REMOVE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter((b) => b.id !== action.payload),
        bookingsMeta: state.bookingsMeta
          ? { ...state.bookingsMeta, total: Math.max(0, state.bookingsMeta.total - 1) }
          : null,
      };
    default:
      return state;
  }
}

const BookingContext = createContext(null);

/** Tránh gọi GET /rooms trùng lặp (React StrictMode mount 2 lần ở dev) */
let roomsRequest = null;

function buildBookingParams(query) {
  const params = {
    page: query.page ?? 1,
    per_page: query.per_page ?? 10,
  };

  if (query.user_name?.trim()) {
    params.user_name = query.user_name.trim();
  }
  if (query.from) {
    params.from = toApiDateTime(query.from);
  }
  if (query.to) {
    params.to = toApiDateTime(query.to);
  }

  return params;
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/token', { email, password });
    localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({ type: 'SET_USER', payload: data.user });
    }
    dispatch({ type: 'SET_AUTH', payload: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'SET_AUTH', payload: false });
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_ROOMS', payload: [] });
    dispatch({ type: 'SELECT_ROOM', payload: null });
  }, []);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout]);

  const fetchRooms = useCallback(async () => {
    if (roomsRequest) return roomsRequest;

    roomsRequest = (async () => {
      dispatch({ type: 'SET_ROOMS_LOADING', payload: true });
      try {
        const { data } = await api.get('/rooms');
        dispatch({ type: 'SET_ROOMS', payload: data.data ?? data });
      } catch (e) {
        dispatch({ type: 'SET_ERROR', payload: e.message });
      } finally {
        roomsRequest = null;
      }
    })();

    return roomsRequest;
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchRooms();
    }
  }, [state.isAuthenticated, fetchRooms]);

  const selectRoom = useCallback((room) => {
    dispatch({ type: 'SELECT_ROOM', payload: room });
  }, []);

  const fetchBookings = useCallback(async (roomId, query = defaultBookingQuery) => {
    const mergedQuery = { ...defaultBookingQuery, ...query };
    dispatch({ type: 'SET_BOOKINGS_LOADING', payload: true });

    try {
      const { data } = await api.get(`/rooms/${roomId}/bookings`, {
        params: buildBookingParams(mergedQuery),
      });

      dispatch({
        type: 'SET_BOOKINGS',
        payload: {
          items: data.data ?? [],
          meta: data.meta ?? null,
          query: mergedQuery,
        },
      });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, []);

  const createBooking = useCallback(async (payload) => {
    const { data } = await api.post('/bookings', payload);
    return data.data ?? data;
  }, []);

  const deleteBooking = useCallback(
    async (id) => {
      dispatch({ type: 'REMOVE_BOOKING', payload: id });
      try {
        await api.delete(`/bookings/${id}`);
        return true;
      } catch (e) {
        if (state.selectedRoom?.id) {
          await fetchBookings(state.selectedRoom.id, state.bookingQuery);
        }
        return false;
      }
    },
    [state.selectedRoom, state.bookingQuery, fetchBookings],
  );

  return (
    <BookingContext.Provider
      value={{
        ...state,
        login,
        logout,
        fetchRooms,
        selectRoom,
        fetchBookings,
        createBooking,
        deleteBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookingContext must be used within BookingProvider');
  return ctx;
}
