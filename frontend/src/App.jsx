import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import { api } from './api';
import { cacheManager } from './cacheManager';
import { requestPermission, onMessageListener } from './firebase';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  const registerFCMToken = useCallback(async (userData) => {
    if (userData.role === 'parent' || userData.role === 'student') {
      const fcmToken = await requestPermission();
      if (fcmToken) {
        try {
          await api.post('/device-tokens', { token: fcmToken });
        } catch (error) {
          console.error('Failed to register FCM token:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      document.body.className = savedTheme;

      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response?.user) {
            setUser(response.user);
            await cacheManager.syncData(response.user.role);
            await registerFCMToken(response.user);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }

      onMessageListener().then((payload) => {
        if (!payload?.notification || !('Notification' in window)) return;
        new Notification(payload.notification.title, {
          body: payload.notification.body,
        });
      });

      setLoading(false);
    };
    initApp();
  }, [registerFCMToken]);

  const handleLogin = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken, user: userData } = response;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    await cacheManager.syncData(userData.role);
    await registerFCMToken(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    cacheManager.clearCache();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="app">
      <header className="header">
        <h1>Adarsha Pathasala Data Management System</h1>
        <div className="header-actions">
          <button onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button onClick={() => setCurrentView('profile')}>Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        {currentView === 'dashboard' && <Dashboard user={user} onViewChange={setCurrentView} />}
        {currentView === 'profile' && <Profile user={user} onBack={() => setCurrentView('dashboard')} />}
      </main>
    </div>
  );
}

export default App;
