import { useEffect, useMemo, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "XXXXXXXX",
  appId: "XXXXXXXX",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved
      ? JSON.parse(saved)
      : ["Comida", "Gaming", "Transporte", "Facultad"];
  });

  const [savingsGoal, setSavingsGoal] = useState(() => {
    return localStorage.getItem("goal") || 100000;
  });

  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem("wallet");

    return saved
      ? JSON.parse(saved)
      : {
          cash: 0,
          digital: 0,
        };
  });

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Comida",
    type: "gasto",
  });

  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("wallet", JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem("goal", savingsGoal);
  }, [savingsGoal]);

  const addTransaction = () => {
    if (!form.title || !form.amount) return;

    const newTransaction = {
      id: Date.now(),
      ...form,
      amount: Number(form.amount),
      date: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);

    setForm({
      title: "",
      amount: "",
      category: categories[0],
      type: "gasto",
    });
  };

  const addCategory = () => {
    if (!newCategory) return;

    setCategories([...categories, newCategory]);
    setNewCategory("");
  };

  const totalExpenses = transactions
    .filter((t) => t.type === "gasto")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "ingreso")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSavings = totalIncome - totalExpenses;

  const chartData = useMemo(() => {
    return categories.map((cat) => {
      const total = transactions
        .filter((t) => t.category === cat && t.type === "gasto")
        .reduce((acc, curr) => acc + curr.amount, 0);

      return {
        name: cat,
        value: total,
      };
    });
  }, [transactions, categories]);

  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f97316",
    "#e11d48",
    "#8b5cf6",
    "#14b8a6",
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-5xl font-black text-green-400 mb-2">
            FinanceTracker Pro
          </h1>
          <p className="text-zinc-400 text-lg">
            Gestión inteligente de gastos, ingresos y ahorro.
          </p>
        </div>

        <div>
          {!user ? (
            <button
              onClick={loginWithGoogle}
              className="bg-white text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all"
            >
              Iniciar sesión con Google
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold">{user.displayName}</p>
                <p className="text-zinc-400 text-sm">{user.email}</p>
              </div>

              <img
                src={user.photoURL}
                alt="profile"
                className="w-12 h-12 rounded-full"
              />

              <button
                onClick={logout}
                className="bg-red-500 px-4 py-2 rounded-xl font-bold text-black"
              >
                Salir
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
            <h2 className="text-zinc-400 mb-2">Gastos</h2>
            <p className="text-3xl font-bold text-red-400">
              ${totalExpenses.toLocaleString()}
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
            <h2 className="text-zinc-400 mb-2">Ingresos</h2>
            <p className="text-3xl font-bold text-blue-400">
              ${totalIncome.toLocaleString()}
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
            <h2 className="text-zinc-400 mb-2">Ahorro</h2>
            <p className="text-3xl font-bold text-green-400">
              ${totalSavings.toLocaleString()}
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
            <h2 className="text-zinc-400 mb-2">Meta Mensual</h2>
            <input
              type="number"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              className="bg-zinc-800 p-2 rounded-xl w-full mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-green-400">
              Nueva Transacción
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Descripción"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className="w-full bg-zinc-800 p-4 rounded-2xl"
              />

              <input
                type="number"
                placeholder="Monto"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                className="w-full bg-zinc-800 p-4 rounded-2xl"
              />

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
                className="w-full bg-zinc-800 p-4 rounded-2xl"
              >
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="w-full bg-zinc-800 p-4 rounded-2xl"
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>

              <button
                onClick={addTransaction}
                className="w-full bg-green-500 hover:bg-green-400 transition-all rounded-2xl p-4 text-black font-bold"
              >
                Agregar
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">
              Balance
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-zinc-400 mb-2">Dinero en efectivo</p>
                <input
                  type="number"
                  value={wallet.cash}
                  onChange={(e) =>
                    setWallet({
                      ...wallet,
                      cash: Number(e.target.value),
                    })
                  }
                  className="w-full bg-zinc-800 p-4 rounded-2xl"
                />
              </div>

              <div>
                <p className="text-zinc-400 mb-2">Dinero digital</p>
                <input
                  type="number"
                  value={wallet.digital}
                  onChange={(e) =>
                    setWallet({
                      ...wallet,
                      digital: Number(e.target.value),
                    })
                  }
                  className="w-full bg-zinc-800 p-4 rounded-2xl"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-yellow-400">
              Categorías
            </h2>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newCategory}
                placeholder="Nueva categoría"
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 bg-zinc-800 p-4 rounded-2xl"
              />

              <button
                onClick={addCategory}
                className="bg-blue-500 px-5 rounded-2xl text-black font-bold"
              >
                +
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="bg-zinc-800 p-4 rounded-2xl"
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 h-[450px]">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">
              Distribución de Gastos
            </h2>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={130}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 overflow-auto max-h-[450px]">
            <h2 className="text-2xl font-bold mb-6 text-orange-400">
              Historial
            </h2>

            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-zinc-800 p-4 rounded-2xl flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">
                      {transaction.title}
                    </h3>

                    <p className="text-zinc-400">
                      {transaction.category}
                    </p>
                  </div>

                  <div
                    className={`font-bold text-xl ${
                      transaction.type === "gasto"
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {transaction.type === "gasto" ? "-" : "+"}$
                    {transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">
            Próximamente
          </h2>

          <ul className="space-y-3 text-zinc-300">
            <li>• Login con Google</li>
            <li>• Guardado en la nube</li>
            <li>• APK Android</li>
            <li>• Estadísticas avanzadas</li>
            <li>• Exportar PDF y Excel</li>
            <li>• Modo premium estilo banco</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
