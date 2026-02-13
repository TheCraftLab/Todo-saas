import { useMemo, useState } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');

  const remaining = useMemo(() => items.filter((item) => !item.done).length, [items]);

  function addTodo(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;

    setItems((prev) => [
      { id: crypto.randomUUID(), label: value, done: false },
      ...prev
    ]);
    setText('');
  }

  function toggleTodo(id) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }

  function removeTodo(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Todo SaaS (starter)</h1>
        <p className="subtitle">Mode dev Docker + hot reload</p>

        <form onSubmit={addTodo} className="todo-form">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Nouvelle tâche"
          />
          <button type="submit">Ajouter</button>
        </form>

        <p className="counter">{remaining} tache(s) en cours</p>

        <ul className="list">
          {items.map((item) => (
            <li key={item.id} className={item.done ? 'done' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleTodo(item.id)}
                />
                <span>{item.label}</span>
              </label>
              <button className="danger" onClick={() => removeTodo(item.id)}>Supprimer</button>
            </li>
          ))}
          {items.length === 0 && <li className="empty">Aucune tache pour le moment.</li>}
        </ul>
      </section>
    </main>
  );
}

export default App;
