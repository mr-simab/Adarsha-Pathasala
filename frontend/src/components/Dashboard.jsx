import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { cacheManager } from '../cacheManager';

function Dashboard({ user, onViewChange }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let cachedData = {};
      if (user.role === 'admin') {
        cachedData.students = await cacheManager.get('students');
        cachedData.teachers = await cacheManager.get('teachers');
        if (!cachedData.students) {
          cachedData.students = await api.get('/students');
          await cacheManager.set('students', cachedData.students, 'students');
        }
        if (!cachedData.teachers) {
          cachedData.teachers = await api.get('/users/teachers');
          await cacheManager.set('teachers', cachedData.teachers, 'teachers');
        }
      } else if (user.role === 'teacher') {
        cachedData.students = await cacheManager.get('students');
        if (!cachedData.students) {
          cachedData.students = await api.get('/students');
          await cacheManager.set('students', cachedData.students, 'students');
        }
      } else if (user.role === 'parent') {
        cachedData.notifications = await cacheManager.get('notifications');
        cachedData.notes = await cacheManager.get('notes');
        if (!cachedData.notifications) {
          cachedData.notifications = await api.get('/notifications');
          await cacheManager.set('notifications', cachedData.notifications, 'notifications');
        }
        if (!cachedData.notes) {
          cachedData.notes = await api.get('/notes');
          await cacheManager.set('notes', cachedData.notes, 'notes', 24 * 60 * 60 * 1000);
        }
      }
      setData(cachedData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) loadData();
    });
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h2>Welcome, {user.displayName} ({user.role})</h2>

      {user.role === 'admin' && (
        <div className="admin-panel">
          <h3>Admin Panel</h3>
          <button onClick={() => onViewChange('manage-users')}>Manage Users</button>
          <button onClick={() => onViewChange('manage-classes')}>Manage Classes</button>
          <button onClick={() => onViewChange('manage-students')}>Manage Students</button>
          <button onClick={() => onViewChange('fees')}>Fee Management</button>
        </div>
      )}

      {user.role === 'teacher' && (
        <div className="teacher-panel">
          <h3>Teacher Panel</h3>
          <button onClick={() => onViewChange('attendance')}>Take Attendance</button>
          <button onClick={() => onViewChange('upload-notes')}>Upload Notes</button>
        </div>
      )}

      {(user.role === 'parent' || user.role === 'student') && (
        <div className="parent-panel">
          <h3>Notifications</h3>
          <ul>
            {data.notifications?.map(n => (
              <li key={n.id}>{n.type}: {n.message}</li>
            ))}
          </ul>
          <h3>Notes</h3>
          <ul>
            {data.notes?.map(n => (
              <li key={n.id}>
                <a href={n.driveUrl} target="_blank" rel="noopener noreferrer">
                  {n.title} - {n.subject}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
