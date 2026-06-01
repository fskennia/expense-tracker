import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COLORS = ['#4f46e5','#f97316','#22c55e','#ef4444','#a855f7','#06b6d4','#f59e0b','#6b7280'];

const fmt = (val) => `R$ ${Number(val).toFixed(2).replace('.', ',')}`;

const CATEGORY_EMOJI = {
  'Alimentação': '🍽️', 'Transporte': '🚗', 'Lazer': '🎮',
  'Saúde': '💊', 'Moradia': '🏠', 'Educação': '📚',
  'Assinaturas': '📱', 'Outros': '📦',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) { navigate('/login'); return; }
    setUser(JSON.parse(localStorage.getItem('user') || '{}'));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const analyzeFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Por favor, envie um arquivo PDF.');
      return;
    }
    setError('');
    setResult(null);
    setFileName(file.name);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('invoice', file);
      const res = await fetch(`${API_URL}/api/analyze-invoice`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    analyzeFile(e.dataTransfer.files[0]);
  };

  const pieData = result
    ? Object.entries(result.summary?.by_category || {}).map(([name, value]) => ({ name, value }))
    : [];

  const barData = result
    ? Object.entries(result.summary?.by_category || {})
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    : [];

  const necessaryPct = result
    ? Math.round((result.summary?.necessary_total / result.total) * 100)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>💰</span>
          <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700' }}>Expense Tracker</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>👤 {user?.name}</span>
          <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', background: 'white', fontSize: '0.85rem', color: '#374151' }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Upload */}
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !loading && fileRef.current.click()}
            style={{
              border: `2px dashed ${dragging ? '#4f46e5' : '#d1d5db'}`,
              borderRadius: '16px',
              padding: '4rem 2rem',
              textAlign: 'center',
              background: dragging ? '#eef2ff' : 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {loading ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#4f46e5' }}>Analisando sua fatura com IA...</p>
                <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Isso pode levar alguns segundos</p>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4f46e5', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', margin: '0 0 0.5rem 0' }}>
                  Arraste sua fatura em PDF
                </p>
                <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0' }}>ou clique para selecionar o arquivo</p>
                <div style={{ display: 'inline-block', padding: '0.6rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem' }}>
                  Selecionar PDF
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '1rem' }}>Faturas de cartão, extratos bancários • Máx. 10MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => analyzeFile(e.target.files[0])} />
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem 1.25rem', borderRadius: '10px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* File info + reset */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Análise da Fatura</h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.85rem' }}>📄 {fileName}</p>
              </div>
              <button
                onClick={() => { setResult(null); setFileName(''); setError(''); }}
                style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#374151' }}
              >
                ＋ Nova fatura
              </button>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total da Fatura', value: fmt(result.total), icon: '💳', color: '#4f46e5', bg: '#eef2ff' },
                { label: 'Necessários', value: fmt(result.summary?.necessary_total || 0), icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Desnecessários', value: fmt(result.summary?.unnecessary_total || 0), icon: '❌', color: '#dc2626', bg: '#fef2f2' },
                { label: 'Itens', value: result.items?.length || 0, icon: '📋', color: '#d97706', bg: '#fffbeb' },
              ].map(({ label, value, icon, color, bg }) => (
                <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '0 0 0.4rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                      <p style={{ color, fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{value}</p>
                    </div>
                    <div style={{ background: bg, borderRadius: '8px', padding: '0.5rem', fontSize: '1.2rem' }}>{icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Necessário vs Desnecessário bar */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '600' }}>✅ Necessário {necessaryPct}%</span>
                <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '600' }}>❌ Desnecessário {100 - necessaryPct}%</span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: '8px', height: '16px', overflow: 'hidden' }}>
                <div style={{ width: `${necessaryPct}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)', height: '100%', borderRadius: '8px', transition: 'width 1s ease' }} />
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Pie chart */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>Distribuição por Categoria</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val) => fmt(val)} />
                    <Legend formatter={(val) => `${CATEGORY_EMOJI[val] || '📦'} ${val}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>Gastos por Categoria</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 0, right: 10, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip formatter={(val) => fmt(val)} />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Items table */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>
                Todos os Itens ({result.items?.length})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                      {['Descrição', 'Categoria', 'Valor', 'Necessário'].map(h => (
                        <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.items?.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#111827' }}>{item.description}</td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <span style={{
                            background: COLORS[Object.keys(result.summary?.by_category || {}).indexOf(item.category) % COLORS.length] + '22',
                            color: COLORS[Object.keys(result.summary?.by_category || {}).indexOf(item.category) % COLORS.length],
                            padding: '0.2rem 0.6rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}>
                            {CATEGORY_EMOJI[item.category] || '📦'} {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: '700', color: '#111827' }}>{fmt(item.amount)}</td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>{item.necessary ? '✅' : '❌'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
