import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CATEGORY_COLORS = {
  'Alimentação': '#f97316',
  'Transporte': '#3b82f6',
  'Lazer': '#a855f7',
  'Saúde': '#22c55e',
  'Moradia': '#ef4444',
  'Educação': '#06b6d4',
  'Assinaturas': '#f59e0b',
  'Outros': '#6b7280',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
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
    const file = e.dataTransfer.files[0];
    analyzeFile(file);
  };

  const fmt = (val) => `R$ ${Number(val).toFixed(2).replace('.', ',')}`;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '1.3rem', margin: 0 }}>💰 Expense Tracker</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>Olá, {user?.name}</span>
          <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: 'white', fontSize: '0.9rem' }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? '#4f46e5' : '#d1d5db'}`,
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            background: dragging ? '#eef2ff' : 'white',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
            {loading ? 'Analisando fatura...' : 'Arraste sua fatura em PDF ou clique para selecionar'}
          </p>
          {!loading && <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>Suporte a faturas de cartão, extratos bancários e boletos</p>}
          {loading && <div style={{ marginTop: '1rem', color: '#4f46e5' }}>⏳ A IA está lendo e categorizando seus gastos...</div>}
          <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => analyzeFile(e.target.files[0])} />
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Total da Fatura', value: fmt(result.total), color: '#1a1a1a' },
                { label: 'Gastos Necessários', value: fmt(result.summary?.necessary_total || 0), color: '#22c55e' },
                { label: 'Gastos Desnecessários', value: fmt(result.summary?.unnecessary_total || 0), color: '#ef4444' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'white', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>{label}</p>
                  <p style={{ color, fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* By category */}
            {result.summary?.by_category && (
              <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Por Categoria</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(result.summary.by_category).map(([cat, val]) => {
                    const pct = Math.round((val / result.total) * 100);
                    const color = CATEGORY_COLORS[cat] || '#6b7280';
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.9rem' }}>{cat}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{fmt(val)} ({pct}%)</span>
                        </div>
                        <div style={{ background: '#f3f4f6', borderRadius: '4px', height: '8px' }}>
                          <div style={{ width: `${pct}%`, background: color, borderRadius: '4px', height: '8px', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items list */}
            <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Itens Detalhados ({result.items?.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <span style={{
                        background: CATEGORY_COLORS[item.category] || '#6b7280',
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                      }}>{item.category}</span>
                      <span style={{ fontSize: '0.9rem', color: '#374151' }}>{item.description}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{fmt(item.amount)}</span>
                      <span title={item.necessary ? 'Necessário' : 'Desnecessário'}>{item.necessary ? '✅' : '❌'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setResult(null); setError(''); }}
              style={{ padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              Analisar outra fatura
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
