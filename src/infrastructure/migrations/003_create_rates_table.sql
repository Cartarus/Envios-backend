CREATE TABLE rates (
  id UUID PRIMARY KEY,
  origin_id UUID REFERENCES locations(id),
  destination_id UUID REFERENCES locations(id),
  min_weight INT NOT NULL,
  max_weight INT NOT NULL,
  price DECIMAL NOT NULL
);