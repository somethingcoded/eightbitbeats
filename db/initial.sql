CREATE DATABASE eightbitbeats CHARACTER SET utf8 COLLATE utf8_general_ci;
USE eightbitbeats;
CREATE TABLE users (
    id VARCHAR(64) NOT NULL,
    display_name VARCHAR(23) NOT NULL,
    service VARCHAR(12) NOT NULL,
    service_id VARCHAR(50) NOT NULL,
    service_username VARCHAR(50) NOT NULL,
    service_name VARCHAR(50) NOT NULL,
    last_login DATETIME NOT NULL,
    total_logins INT DEFAULT 1
) CHARACTER SET utf8 COLLATE utf8_general_ci;
