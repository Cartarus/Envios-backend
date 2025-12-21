CREATE TABLE shipments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  origin_id UUID REFERENCES locations(id),
  destination_id UUID REFERENCES locations(id),
  weight INT,
  height INT,
  width INT,
  length INT,
  price DECIMAL,
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW()
);
