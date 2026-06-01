import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setAnalysis(null);
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount: parseFloat(amount) }),
      });
      const data = await res.json();
      const parsed = typeof data.analysis === 'string'
        ? JSON.parse(data.analysis.replace(/```json|```/g, '').trim())
        : data.analysis;
      setAnalysis(parsed);
    } catch (err) {
      setError('Erro ao analisar despesa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif' }}>
      <header style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '1.3rem' }}>💰 Expense Tracker</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>Olá, {user?.name}</span>
          <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: 'white' }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Analisar Despesa com IA</h2>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label>Descrição</label>
              <input
                type="text"
                placeholder="Ex: Almoço no restaurante"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label>Valor (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>

            {error && <div style={{ color: '#dc2626', background: '#fef2f2', padding: '0.75rem', borderRadius: '6px' }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ padding: '0.85rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
              {loading ? 'Analisando...' : 'Analisar'}
            </button>
          </form>

          {analysis && (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Resultado</h3>
              <p><strong>Categoria:</strong> {analysis.category}</p>
              <p style={{ marginTop: '0.5rem' }}><strong>Necessário:</strong> {analysis.necessary ? '✅ Sim' : '❌ Não'}</p>
              <p style={{ marginTop: '0.5rem' }}><strong>Dica:</strong> {analysis.tips}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
