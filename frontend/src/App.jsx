import { useEffect, useMemo, useState } from 'react';

function normalizeTodo(todo) {
  return {
    id: todo.id,
    label: todo.title,
    done: todo.done,
    createdAt: todo.created_at
  };
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const payload = await response.json();
      if (payload && typeof payload.error === 'string') {
        errorMessage = payload.error;
      }
    } catch (_error) {
      // Ignore JSON parsing errors for non-JSON responses.
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);
  const [error, setError] = useState('');

  const remaining = useMemo(() => items.filter((item) => !item.done).length, [items]);

  useEffect(() => {
    let isMounted = true;

    async function loadTodos() {
      setIsLoading(true);
      setError('');
      try {
        const todos = await apiRequest('/api/todos');
        if (isMounted) {
          setItems(todos.map(normalizeTodo));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(`Chargement impossible: ${loadError.message}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTodos();

    return () => {
      isMounted = false;
    };
  }, []);

  function isItemPending(id) {
    return pendingIds.includes(id);
  }

  async function addTodo(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;

    setIsSubmitting(true);
    setError('');
    try {
      const created = await apiRequest('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ title: value })
      });
      setItems((prev) => [normalizeTodo(created), ...prev]);
      setText('');
    } catch (createError) {
      setError(`Creation impossible: ${createError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleTodo(id) {
    const current = items.find((item) => item.id === id);
    if (!current) return;

    setPendingIds((prev) => [...prev, id]);
    setError('');
    try {
      const updated = await apiRequest(`/api/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: !current.done })
      });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? normalizeTodo(updated) : item))
      );
    } catch (updateError) {
      setError(`Mise a jour impossible: ${updateError.message}`);
    } finally {
      setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id));
    }
  }

  async function removeTodo(id) {
    setPendingIds((prev) => [...prev, id]);
    setError('');
    try {
      await apiRequest(`/api/todos/${id}`, {
        method: 'DELETE'
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(`Suppression impossible: ${deleteError.message}`);
    } finally {
      setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id));
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Todo SaaS API Connecte</h1>
        <p className="subtitle">React + Express + Postgres</p>

        <form onSubmit={addTodo} className="todo-form">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Nouvelle tâche"
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting || !text.trim()}>
            {isSubmitting ? 'Ajout...' : 'Ajouter'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <p className="counter">
          {isLoading ? 'Chargement...' : `${remaining} tache(s) en cours`}
        </p>

        <ul className="list">
          {items.map((item) => (
            <li
              key={item.id}
              className={[
                item.done ? 'done' : '',
                isItemPending(item.id) ? 'pending' : ''
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <label>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleTodo(item.id)}
                  disabled={isItemPending(item.id)}
                />
                <span>{item.label}</span>
              </label>
              <button
                className="danger"
                type="button"
                onClick={() => removeTodo(item.id)}
                disabled={isItemPending(item.id)}
              >
                Supprimer
              </button>
            </li>
          ))}
          {!isLoading && items.length === 0 && (
            <li className="empty">Aucune tache pour le moment.</li>
          )}
        </ul>
      </section>
    </main>
  );
}

export default App;
