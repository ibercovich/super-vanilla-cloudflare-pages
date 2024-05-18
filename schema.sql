
DROP TABLE contacts;

CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone CHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
('Amelia', 'Hall', '0123498765', 'amelia.hall@example.com');
