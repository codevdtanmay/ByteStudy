CREATE TABLE IF NOT EXISTS hnbgu_achievers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    batch VARCHAR(64) NOT NULL,
    cgpa VARCHAR(32),
    achievement_title VARCHAR(255) NOT NULL,
    quote TEXT,
    company_or_exam VARCHAR(255),
    photo_url TEXT,
    badge_label VARCHAR(100) DEFAULT 'STAR ACHIEVER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO hnbgu_achievers (name, branch, batch, cgpa, achievement_title, quote, company_or_exam, photo_url, badge_label, created_at)
VALUES
('Aditya Rawat', 'Computer Science & Engineering', '2024', '9.64', 'GATE CS AIR 148 & Software Engineer', 'Focusing on core CS fundamentals like Algorithms and OS from 2nd year made cracking GATE and tech interviews seamless.', 'IIT Bombay / Microsoft', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', 'GATE TOPPER', NOW()),
('Priya Bhatt', 'Information Technology', '2024', '9.78', 'University Gold Medalist & SDE at Oracle', 'ByteCollege syllabus navigator and past year papers kept me aligned throughout my semester exams.', 'Oracle Cloud Systems', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300', 'GOLD MEDALIST', NOW()),
('Rohan Negi', 'Electronics & Communication', '2025', '9.42', 'Smart India Hackathon Winner 2024', 'Consistency matters more than cramming. Utilize every resource, solve PYQs, and build practical projects.', 'SIH Champion / Qualcomm Intern', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', 'HACKATHON WINNER', NOW()),
('Sneha Joshi', 'Computer Science & Engineering', '2023', '9.55', 'Placed at Amazon (AWS) - 44 LPA', 'Start DSA early, maintain a healthy CGPA above 8.5, and never skip university semester mock tests.', 'Amazon AWS', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', 'TOP PLACEMENT', NOW())
ON CONFLICT (id) DO NOTHING;
