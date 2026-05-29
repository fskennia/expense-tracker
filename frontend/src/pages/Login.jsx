import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }

    // Simular login (em produção, você faria uma chamada ao backend)
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    // Armazenar dados do usuário localmente
    localStorage.setItem('user', JSON.stringify({
      email,
      name: email.split('@')[0],
      loginTime: new Date().toISOString()
    }));

    localStorage.setItem('isAuthenticated', 'true');

    // Redirecionar para dashboard
    navigate('/dashboard');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>💰 Expense Tracker</h1>
          <p>Gerencie suas despesas com facilidade</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <p>Não tem conta?</p>
          <button 
            type="button" 
            className="signup-link"
            onClick={handleSignup}
          >
            Criar conta
          </button>
        </div>

        <div className="demo-credentials">
          <p className="demo-title">🧪 Credenciais de Teste:</p>
          <p>Email: <strong>teste@email.com</strong></p>
          <p>Senha: <strong>123456</strong></p>
        </div>
      </div>
    </div>
  );
}
