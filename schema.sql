
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS users_sessions;

CREATE TABLE users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    email    VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name     VARCHAR(50) NOT NULL
);

CREATE TABLE users_sessions (
    session_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL
                CONSTRAINT users_sessions_users_id_fk
                REFERENCES users
                ON UPDATE CASCADE ON DELETE CASCADE,
    token       TEXT NOT NULL,
    expires_at  INTEGER NOT NULL
);

CREATE TABLE contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name  VARCHAR(50) NOT NULL,
    last_name   VARCHAR(50) NOT NULL,
    phone       CHAR(15) NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO contacts (first_name, last_name, phone, email) VALUES 
('John', 'Doe', '1234567890', 'john.doe@example.com'),
('Jane', 'Smith', '2345678901', 'jane.smith@example.com'),
('Michael', 'Brown', '3456789012', 'michael.brown@example.com'),
('Emily', 'Davis', '4567890123', 'emily.davis@example.com'),
('Matthew', 'Johnson', '5678901234', 'matthew.johnson@example.com'),
('Olivia', 'Wilson', '6789012345', 'olivia.wilson@example.com'),
('Daniel', 'Martinez', '7890123456', 'daniel.martinez@example.com'),
('Sophia', 'Anderson', '8901234567', 'sophia.anderson@example.com'),
('David', 'Taylor', '9012345678', 'david.taylor@example.com'),
('Emma', 'Thomas', '0123456789', 'emma.thomas@example.com'),
('James', 'Moore', '1234509876', 'james.moore@example.com'),
('Ava', 'Jackson', '2345610987', 'ava.jackson@example.com'),
('William', 'White', '3456721098', 'william.white@example.com'),
('Isabella', 'Harris', '4567832109', 'isabella.harris@example.com'),
('Alexander', 'Clark', '5678943210', 'alexander.clark@example.com'),
('Mia', 'Lewis', '6789054321', 'mia.lewis@example.com'),
('Ethan', 'Robinson', '7890165432', 'ethan.robinson@example.com'),
('Charlotte', 'Walker', '8901276543', 'charlotte.walker@example.com'),
('Benjamin', 'Young', '9012387654', 'benjamin.young@example.com'),
('Amelia', 'Hall', '0123498765', 'amelia.hall@example.com'),
('Liam', 'Scott', '1234678901', 'liam.scott@example.com'),
('Lucas', 'King', '2345789012', 'lucas.king@example.com'),
('Mason', 'Green', '3456890123', 'mason.green@example.com'),
('Harper', 'Baker', '4567901234', 'harper.baker@example.com'),
('Ella', 'Nelson', '5678012345', 'ella.nelson@example.com'),
('Logan', 'Carter', '6789123456', 'logan.carter@example.com'),
('Abigail', 'Mitchell', '7890234567', 'abigail.mitchell@example.com'),
('Elijah', 'Perez', '8901345678', 'elijah.perez@example.com'),
('Grace', 'Roberts', '9012456789', 'grace.roberts@example.com'),
('Henry', 'Turner', '0123567890', 'henry.turner@example.com'),
('Avery', 'Phillips', '1234678902', 'avery.phillips@example.com'),
('Jackson', 'Campbell', '2345789013', 'jackson.campbell@example.com'),
('Sebastian', 'Parker', '3456890124', 'sebastian.parker@example.com'),
('Aria', 'Evans', '4567901235', 'aria.evans@example.com'),
('Luke', 'Edwards', '5678012346', 'luke.edwards@example.com'),
('Zoe', 'Collins', '6789123457', 'zoe.collins@example.com'),
('Jack', 'Stewart', '7890234568', 'jack.stewart@example.com'),
('Riley', 'Sanchez', '8901345679', 'riley.sanchez@example.com'),
('Samuel', 'Morris', '9012456780', 'samuel.morris@example.com');

