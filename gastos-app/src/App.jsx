import { useEffect, useMemo, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBytw1Xe_XkJBYwe3ocujwQfbgaPzAusao",
  authDomain: "gastos-app-7497c.firebaseapp.com",
  projectId: "gastos-app-7497c",
  storageBucket: "gastos-app-7497c.firebasestorage.app",
  messagingSenderId: "1060465630927",
  appId: "1:1060465630927:web:0896d2e32e96f5eda961ba",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [categories, setCategories] = useState([
    "Comida",
    "Gaming",
    "Transporte",
    "Facultad",
  ]);

  const [savingsGoal, setSavingsGoal] = useState(100000);

  const [wallet, setWallet] = useState({
    cash: 0,
    digital: 0,
  });

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Comida",
    type: "gasto",
  });

  const [newCategory, setNewCategory] = useState("");

  // 🔐 Auth listener (IMPORTANTE)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  // 🔽 Cargar transacciones desde Firestore
  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return;

      const q = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactions(data);
    };

    loadTransactions();
  }, [user]);

  // 🔥 LOGIN
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setTransactions([]);
  };

  // ➕ AGREGAR TRANSACCIÓN (FIX REAL)
  const addTransaction = async () => {
    if (!form.title || !form.amount || !user) return;

    const newTransaction = {
      uid: user.uid,
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      type: form.type,
      date: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, "transactions"),
      newTransaction
    );

    // actualizar UI sin bugs
    setTransactions((prev) => [
      { id: docRef.id, ...newTransaction },
      ...prev,
    ]);

    setForm({
      title: "",
      amount: "",
      category: categories[0],
      type: "gasto",
    });
  };

  // ➕ categoría
  const addCategory = () => {
    if (!newCategory) return;
    setCategories([...categories, newCategory]);
    setNewCategory("");
  };

  // 📊 cálculos
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

      return { name: cat, value: total };
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

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-green-400">
            FinanceTracker Pro
          </h1>
        </div>

        {/* LOGIN */}
        {!user ? (
          <button
            onClick={loginWithGoogle}
            className="bg-white text-black px-6 py-3 rounded-2xl font-bold"
          >
            Iniciar sesión con Google
          </button>
        ) : (
          <div className="flex gap-4 items-center mb-6">
            <img
              src={user.photoURL}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p>{user.displayName}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 px-4 py-2 rounded-xl text-black"
            >
              Salir
            </button>
          </div>
        )}

        {/* FORM */}
        <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
          <input
            placeholder="Título"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="bg-zinc-800 p-2 rounded w-full mb-2"
          />

          <input
            type="number"
            placeholder="Monto"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
            className="bg-zinc-800 p-2 rounded w-full mb-2"
          />

          <button
            onClick={addTransaction}
            className="bg-green-500 text-black px-4 py-2 rounded"
          >
            Agregar
          </button>
        </div>

        {/* LISTA */}
        <div className="bg-zinc-900 p-4 rounded-2xl">
          {transactions.map((t) => (
            <div key={t.id} className="flex justify-between p-2">
              <span>{t.title}</span>
              <span
                className={
                  t.type === "gasto"
                    ? "text-red-400"
                    : "text-green-400"
                }
              >
                ${t.amount}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}