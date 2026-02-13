const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { pool, waitForDatabase, initSchema } = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/todos', async (_req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, title, done, created_at FROM todos ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/todos', async (req, res, next) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING id, title, done, created_at',
      [title]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/todos/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const hasTitle = Object.prototype.hasOwnProperty.call(req.body, 'title');
  const hasDone = Object.prototype.hasOwnProperty.call(req.body, 'done');

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'invalid id' });
  }

  if (!hasTitle && !hasDone) {
    return res.status(400).json({ error: 'nothing to update' });
  }

  const updates = [];
  const values = [];

  if (hasTitle) {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      return res.status(400).json({ error: 'title cannot be empty' });
    }
    values.push(title);
    updates.push(`title = $${values.length}`);
  }

  if (hasDone) {
    if (typeof req.body.done !== 'boolean') {
      return res.status(400).json({ error: 'done must be boolean' });
    }
    values.push(req.body.done);
    updates.push(`done = $${values.length}`);
  }

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id, title, done, created_at`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'todo not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/todos/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'invalid id' });
  }

  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'todo not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'internal server error' });
});

async function start() {
  await waitForDatabase();
  await initSchema();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`todo-api listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
