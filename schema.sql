DROP TABLE IF EXISTS products;

CREATE TABLE products(
id SERIAL PRIMARY KEY,
name varchar(225) UNIQUE,
price varchar(225),
image varchar(225),
description varchar(225)
);