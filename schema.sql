CREATE TABLE garden (
    id integer PRIMARY KEY AUTOINCREMENT,
    plant varchar(255),
    planter integer,
    planted datetime DEFAULT CURRENT_TIMESTAMP,
    harvested boolean DEFAULT FALSE
);

CREATE TABLE soil (
    id integer PRIMARY KEY AUTOINCREMENT,
    measurement varchar(255),
    measured datetime DEFAULT CURRENT_TIMESTAMP,
    garden_id integer,
    FOREIGN KEY (garden_id) REFERENCES garden (id)
);

CREATE TABLE watering (
    id integer PRIMARY KEY AUTOINCREMENT,
    soil_id integer,
    garden_id integer,
    watered datetime DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (garden_id) REFERENCES garden (id),
    FOREIGN KEY (soil_id) REFERENCES soil (id)
);

CREATE TABLE temperature (
    id integer PRIMARY KEY AUTOINCREMENT,
    temp decimal(6,2),
    humidity decimal(6,2),
    created_at datetime DEFAULT CURRENT_TIMESTAMP
);