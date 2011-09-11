CREATE DATABASE eightbitbeats CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE users (
    id VARCHAR(64) NOT NULL,
    display_name VARCHAR(12) NOT NULL,
    service VARCHAR(12) NOT NULL,
    service_id VARCHAR(50) NOT NULL,
    service_username VARCHAR(50) NOT NULL,
    service_name VARCHAR(50) NOT NULL
) CHARACTER SET utf8 COLLATE utf8_general_ci;
