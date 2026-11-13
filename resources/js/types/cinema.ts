export type MovieRatingAge = 'SU' | '13+' | '17+' | '21+';
export type MovieStatus = 'now_showing' | 'upcoming' | 'archived';

export interface Genre {
    id: number;
    name: string;
    slug: string;
}

export interface Movie {
    id: number;
    title: string;
    slug: string;
    synopsis: string;
    duration_minutes: number;
    rating_age: MovieRatingAge;
    director: string;
    cast: string;
    language: string;
    subtitle: string;
    trailer_url: string | null;
    poster_path: string;
    banner_path: string | null;
    release_date: string;
    status: MovieStatus;
    genres?: Genre[];
    showtimes_count?: number;
    created_at?: string;
}

export interface Cinema {
    id: number;
    name: string;
    slug: string;
    city: string;
    address: string;
    phone: string | null;
    is_active: boolean;
    studios?: Studio[];
}

export type StudioType = 'regular' | 'deluxe' | 'imax' | 'vip_premiere';

export interface Studio {
    id: number;
    cinema_id: number;
    name: string;
    type?: StudioType;
    studio_type: StudioType | string;
    capacity?: number;
    total_seats?: number;
    price_multiplier: number;
    cinema?: Cinema;
    seats?: Seat[];
}

export type SeatType = 'regular' | 'vip' | 'couple';

export interface Seat {
    id: number;
    studio_id: number;
    row_label: string;
    seat_number: number;
    seat_type: SeatType;
    is_active: boolean;
}

export interface Showtime {
    id: number;
    movie_id: number;
    studio_id: number;
    show_date: string;
    start_time: string;
    end_time: string;
    base_price: number;
    is_active: boolean;
    movie?: Movie;
    studio?: Studio;
    cinema?: Cinema;
    booked_seats_count?: number;
    available_seats_count?: number;
}

export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'expired';
export type SeatBookingStatus = 'held' | 'booked' | 'released';

export interface BookingSeat {
    id: number;
    booking_id: number;
    showtime_id: number;
    seat_id: number;
    price: number;
    status: SeatBookingStatus;
    held_until: string | null;
    seat?: Seat;
}

export type PaymentMethod =
    | 'qris'
    | 'bca_va'
    | 'va_bca'
    | 'mandiri_va'
    | 'va_mandiri'
    | 'bni_va'
    | 'va_bni'
    | 'gopay'
    | 'ewallet_gopay'
    | 'ovo'
    | 'ewallet_ovo'
    | 'credit_card';

export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'failed'
    | 'expired'
    | 'refunded';

export interface Payment {
    id: number;
    booking_id: number;
    payment_code: string;
    payment_method: string;
    amount: number;
    status: PaymentStatus;
    payment_gateway_ref: string | null;
    payload_response: Record<string, any> | null;
    va_number?: string | null;
    qr_payload?: string | null;
    expired_at?: string | null;
    paid_at: string | null;
    created_at: string;
    booking?: Booking;
}

export interface Ticket {
    id: number;
    booking_id: number;
    seat_id: number;
    ticket_code: string;
    qr_code_token: string;
    qr_code_url?: string;
    qr_data_uri?: string;
    status?: string;
    is_used: boolean;
    used_at: string | null;
    verified_by_user_id: number | null;
    seat?: Seat;
    booking?: Booking;
    booking_seat?: {
        seat?: Seat;
    };
}

export interface Voucher {
    id: number;
    code: string;
    title: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_discount: number | null;
    quota?: number;
    usage_limit?: number | null;
    used_count: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export interface Booking {
    id: number;
    booking_code: string;
    user_id: number;
    showtime_id: number;
    voucher_id: number | null;
    subtotal: number;
    discount_amount: number;
    service_fee: number;
    total_amount: number;
    status: BookingStatus;
    held_until: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
    showtime?: Showtime;
    booking_seats?: BookingSeat[];
    payment?: Payment;
    tickets?: Ticket[];
    voucher?: Voucher;
}

export interface SeatGridItem extends Seat {
    status: 'available' | 'selected' | 'held' | 'booked';
    calculated_price: number;
}
