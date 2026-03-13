import { useEffect, useState } from 'react';
import api from '../../api/axios';
import './settings.css';

const SettingsPage = () => {
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fetchSettings = async () => {
    const res = await api.get('/settings');
    setForm(res.data.data || {});
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/settings', form);
      alert('Settings updated');
      await fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      alert('Please select a logo file');
      return;
    }

    try {
      setUploadingLogo(true);

      const formData = new FormData();
      formData.append('logo', logoFile);

      await api.post('/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Logo uploaded successfully');
      setLogoFile(null);
      await fetchSettings();
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="page">
      <h1>System Settings</h1>

      <div className="settings-card">
        <h2>Company Logo</h2>

        {form.company_logo && (
          <div className="logo-preview-wrap">
            <img
              src={`http://localhost:5000${form.company_logo}`}
              alt="Company Logo"
              className="logo-preview"
            />
          </div>
        )}

        <div className="logo-upload-row">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0])}
          />
          <button
            type="button"
            onClick={handleLogoUpload}
            disabled={uploadingLogo}
          >
            {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <input
          name="company_name"
          value={form.company_name || ''}
          onChange={handleChange}
          placeholder="Company Name"
        />

        <input
          name="company_phone"
          value={form.company_phone || ''}
          onChange={handleChange}
          placeholder="Phone"
        />

        <input
          name="company_email"
          value={form.company_email || ''}
          onChange={handleChange}
          placeholder="Email"
        />

        <input
          name="company_website"
          value={form.company_website || ''}
          onChange={handleChange}
          placeholder="Website"
        />

        <textarea
          name="company_address"
          value={form.company_address || ''}
          onChange={handleChange}
          placeholder="Address"
        />

        <input
          name="invoice_prefix"
          value={form.invoice_prefix || ''}
          onChange={handleChange}
          placeholder="Invoice Prefix"
        />

        <input
          name="purchase_prefix"
          value={form.purchase_prefix || ''}
          onChange={handleChange}
          placeholder="Purchase Prefix"
        />

        <input
          name="currency_symbol"
          value={form.currency_symbol || ''}
          onChange={handleChange}
          placeholder="Currency"
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;