import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f8fafc',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '18px',
          padding: '28px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        }}
      >
        <h1 style={{ margin: '0 0 10px', fontSize: '28px', color: '#111827' }}>
          Access Denied
        </h1>
        <p style={{ margin: '0 0 20px', color: '#64748b', lineHeight: 1.6 }}>
          You do not have permission to access this page.
        </p>

        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            background: '#2563eb',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '10px 16px',
            fontWeight: 600,
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;