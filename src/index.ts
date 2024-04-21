import { Hono } from 'hono';

type Env = {
	DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// Temperature Table
app.get('/temperature', async (c) => {
	const results = await c.env.DB.prepare('SELECT * FROM temperature').all();
	return c.json(results.results);
});

app.post('/temperature', async (c) => {
	const data = await c.req.json();
	const temp = data.temp;
	const humidity = data.humidity;
	const results = await c.env.DB.prepare(
		'INSERT INTO temperature (temp, humidity) VALUES (?, ?)'
	)
		.bind(temp, humidity)
		.run();

	return c.json(results);
});

// Garden Table
app.get('/garden', async (c) => {
	const results = await c.env.DB.prepare(
		'SELECT * FROM garden WHERE harvested = 0'
	).all();
	return c.json(results);
});

app.get('/garden/:id', async (c) => {
	const id = c.req.param('id');
	const results = await c.env.DB.prepare(
		'SELECT * FROM garden WHERE id = ? AND harvested = 0 ORDER BY created_at DESC'
	)
		.bind(id)
		.first();
	return c.json(results);
});

app.post('/garden', async (c) => {
	const data = await c.req.json();
	const plant = data.plant;
	const planter = data.planter;
	const results = await c.env.DB.prepare(
		'INSERT INTO garden (plant, planter) VALUES (?, ?)'
	)
		.bind(plant, planter)
		.run();

	return c.json(results);
});

// Garden Table for Harvested info/updates
app.get('/harvested', async (c) => {
	const results = await c.env.DB.prepare(
		'SELECT * FROM garden WHERE harvested = 1'
	).all();
	return c.json(results);
});

app.patch('/harvested', async (c) => {
	const data = await c.req.json();
	const id = data.id;
	const results = await c.env.DB.prepare(
		'UPDATE garden SET harvested = 1 WHERE id = ?'
	)
		.bind(id)
		.run();

	return c.json(results);
});

// Soil Table
app.get('/soil/:planter', async (c) => {
	const id = c.req.param('planter');
	const results = await c.env.DB.prepare(
		'SELECT measurement FROM soil WHERE garden_id = (SELECT id FROM garden WHERE planter = ? AND harvested = false) ORDER BY measured DESC LIMIT 24'
	)
		.bind(id)
		.all();
	return c.json(results);
});

app.post('/soil', async (c) => {
	const data = await c.req.json();
	const measurement = data.measurement;
	const planter = data.planter;
	const results = await c.env.DB.prepare(
		'INSERT INTO soil (garden_id, measurement) SELECT id, ? FROM garden WHERE planter = ? AND harvested = false'
	)
		.bind(measurement, planter)
		.run();
	return c.json(results);
});

// Watering Table
app.get('/watering', async (c) => {
	const results = await c.env.DB.prepare('SELECT * FROM watering').all();
	return c.json(results);
});

app.get('/watering/:planter', async (c) => {
	const id = c.req.param('planter');
	const results = await c.env.DB.prepare(
		'SELECT watered FROM watering WHERE garden_id = (SELECT id FROM garden WHERE planter = ? AND harvested = false) ORDER BY watered DESC LIMIT 1'
	)
		.bind(id)
		.all();
	return c.json(results);
});

app.post('/watering', async (c) => {
	const data = await c.req.json();
	const planter = data.planter;
	const results = await c.env.DB.prepare(
		'INSERT INTO watering (soil_id, garden_id) SELECT s.id AS soil_id, g.id AS garden_id FROM garden g JOIN soil s ON g.id = s.garden_id WHERE g.planter = ? AND g.harvested = false ORDER BY s.measured DESC LIMIT 5'
	)
		.bind(planter)
		.run();
	return c.json(results);
});

export default app;
