-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Layouts Table
CREATE TABLE IF NOT EXISTS layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Plots Table
CREATE TABLE IF NOT EXISTS plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
    plot_number VARCHAR(50),
    survey_number VARCHAR(50),
    area_sqm NUMERIC(12, 2),
    perimeter_m NUMERIC(12, 2),
    original_geometry geometry(Polygon, 0), -- SRID 0 as it's local CAD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roads Table
CREATE TABLE IF NOT EXISTS roads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
    name VARCHAR(255),
    original_geometry geometry(Polygon, 0)
);

-- Plot Dimensions
CREATE TABLE IF NOT EXISTS plot_dimensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    edge_type VARCHAR(50), -- e.g., 'frontage', 'depthB', 'depthT'
    length_m NUMERIC(10, 2) NOT NULL
);

-- Spatial Labels
CREATE TABLE IF NOT EXISTS spatial_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
    text_content TEXT NOT NULL,
    position geometry(Point, 0),
    rotation NUMERIC(8, 4)
);

-- Source Provenance
CREATE TABLE IF NOT EXISTS source_provenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_table VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    layer VARCHAR(255),
    entity_handle VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Indexes
CREATE INDEX IF NOT EXISTS plots_geom_idx ON plots USING GIST (original_geometry);
CREATE INDEX IF NOT EXISTS roads_geom_idx ON roads USING GIST (original_geometry);
CREATE INDEX IF NOT EXISTS labels_geom_idx ON spatial_labels USING GIST (position);
