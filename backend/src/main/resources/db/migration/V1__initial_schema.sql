CREATE TABLE locations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES locations(id),
    name VARCHAR(255) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE service_providers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    start_time TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    client_alias VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_room_start ON bookings(room_id, start_time);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_rooms_location ON rooms(location_id);
