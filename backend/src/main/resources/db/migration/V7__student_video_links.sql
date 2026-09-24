CREATE TABLE student_video_links (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    semester_number INTEGER NOT NULL,
    course_code VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_video_links_user_semester ON student_video_links (user_id, semester_number, created_at DESC);
