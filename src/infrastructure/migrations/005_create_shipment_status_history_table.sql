CREATE TABLE shipment_status_history (
  id UUID PRIMARY KEY,
  shipment_id UUID REFERENCES shipments(id),
  status VARCHAR(30),
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMP DEFAULT NOW()
);
