-- Discs table
CREATE TABLE discs (
    id SERIAL PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    disc_type TEXT NOT NULL CHECK (disc_type IN ('driver', 'midrange', 'putter')),
    speed INTEGER NOT NULL,
    glide INTEGER NOT NULL,
    turn INTEGER NOT NULL,
    fade INTEGER NOT NULL,
    status TEXT DEFAULT 'shelf' CHECK (status IN ('bag', 'shelf', 'wall_of_fame')),
    photo_url TEXT,
    ace_hole INTEGER,
    ace_course TEXT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Courses table (static data)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    holes INTEGER[] NOT NULL
);

-- Insert initial courses data
INSERT INTO courses (name, holes) VALUES
    ('Tyrifjorden Disc Golf Course', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]);

-- Enable RLS (Row Level Security) - optional for auth later
ALTER TABLE discs ENABLE ROW LEVEL SECURITY;

-- Create a simple policy to allow all operations (for demo)
CREATE POLICY "Allow all" ON discs
    FOR ALL USING (true) WITH CHECK (true);
