import { useState, useEffect } from "react";
export default function ExpenseTrackerApp() {

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    return saved
      ? JSON.parse(saved)
      : ['Comida', 'Transporte', 'Gaming', 'Facultad'];
  });

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Comida',
    date: new Date().toISOString().split('T')[0],
  });

  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addExpense = () => {
    if (!newExpense.title || !newExpense.amount) return;

    const expense = {
      id: Date.now(),
      ...newExpense,
      amount: Number(newExpense.amount),
    };

    setExpenses([expense, ...expenses]);

    setNewExpense({
      title: '',
      amount: '',
      category: categories[0],
      date: new Date().toISOString().split('T')[0],
    });
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory)) return;

    setCategories([...categories, newCategory]);
    setNewCategory('');
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const totalMonth = monthlyExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  const categoryTotals = categories.map((category) => {
    const total = monthlyExpenses
      .filter((e) => e.category === category)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      category,
      total,
    };
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-2 text-green-400">
            Control de Gastos
          </h1>
          <p className="text-zinc-400 text-lg">
            Tu dashboard financiero personal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-800">
            <h2 className="text-zinc-400 mb-2">Gastos del Mes</h2>
            <p className="text-4xl font-bold text-red-400">
              ${totalMonth.toLocaleString()}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-800">
            <h2 className="text-zinc-400 mb-2">Cantidad de Gastos</h2>
            <p className="text-4xl font-bold text-blue-400">
              {monthlyExpenses.length}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-800">
            <h2 className="text-zinc-400 mb-2">Categorías</h2>
            <p className="text-4xl font-bold text-green-400">
              {categories.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-green-400">
              Agregar Gasto
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Descripción"
                value={newExpense.title}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    title: e.target.value,
                  })
                }
                className="w-full bg-zinc-800 rounded-2xl p-4 outline-none border border-zinc-700 focus:border-green-400"
              />

              <input
                type="number"
                placeholder="Monto"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    amount: e.target.value,
                  })
                }
                className="w-full bg-zinc-800 rounded-2xl p-4 outline-none border border-zinc-700 focus:border-green-400"
              />

              <select
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    category: e.target.value,
                  })
                }
                className="w-full bg-zinc-800 rounded-2xl p-4 outline-none border border-zinc-700 focus:border-green-400"
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>

              <input
                type="date"
                value={newExpense.date}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    date: e.target.value,
                  })
                }
                className="w-full bg-zinc-800 rounded-2xl p-4 outline-none border border-zinc-700 focus:border-green-400"
              />

              <button
                onClick={addExpense}
                className="w-full bg-green-500 hover:bg-green-400 transition-all rounded-2xl p-4 font-bold text-black"
              >
                Agregar Gasto
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">
              Categorías
            </h2>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Nueva categoría"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 bg-zinc-800 rounded-2xl p-4 outline-none border border-zinc-700 focus:border-blue-400"
              />

              <button
                onClick={addCategory}
                className="bg-blue-500 hover:bg-blue-400 transition-all px-6 rounded-2xl font-bold text-black"
              >
                +
              </button>
            </div>

            <div className="space-y-4">
              {categoryTotals.map((cat) => (
                <div
                  key={cat.category}
                  className="bg-zinc-800 rounded-2xl p-4 flex justify-between items-center"
                >
                  <span className="font-semibold">{cat.category}</span>
                  <span className="text-green-400 font-bold">
                    ${cat.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">
            Últimos Gastos
          </h2>

          <div className="space-y-4">
            {expenses.length === 0 && (
              <p className="text-zinc-500">No hay gastos todavía.</p>
            )}

            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-lg">{expense.title}</h3>
                  <p className="text-zinc-400">
                    {expense.category} • {expense.date}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-red-400 text-xl font-bold">
                    -${expense.amount.toLocaleString()}
                  </span>

                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="bg-red-500 hover:bg-red-400 transition-all px-4 py-2 rounded-xl font-bold text-black"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
