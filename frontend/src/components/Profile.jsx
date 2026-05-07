function Profile({ user, onBack }) {
  return (
    <div className="profile">
      <h2>Profile</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {user.displayName}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Email:</strong> {user.email || 'N/A'}</p>
        <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
      </div>
      <button onClick={onBack}>Back to Dashboard</button>
    </div>
  );
}

export default Profile;