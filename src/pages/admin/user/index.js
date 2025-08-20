import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';

import { useTheme } from '@/context/ThemeContext.js';
import { useRouter } from 'next/router';
import { withAdminAuth } from '@/lib/auth/auth.js';

import Title from '@/components/UI/admin/Title';
import Pillar from '@/components/UI/admin/Pillar';
import { log } from 'handlebars';

// --- Auth guard SSR ---
export const getServerSideProps = withAdminAuth();

export default function User() {
  const { logged, setStatus } = useTheme();
  const router = useRouter();

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    year: '',
    country: '',
    city: '',
    email: '',
    description: '',
    linkedin: '',
    github: '',
    user_contact: true,
    user_chatbot: true,
  });

  // --- Fetch user on mount ---
  useEffect(() => {
    if (!logged) {
      router.replace('/admin');
    } else {
      (async () => {
        try {
          const res = await fetch('/api/user');
          const data = await res.json();
          if (res.ok && data.data?.[0]) setFormData(data.data[0]);
          else
            setStatus((prev) => ({
              ...prev,
              error: data.message || '❌ Failed to fetch user',
            }));
        } catch {
          setStatus((prev) => ({
            ...prev,
            error: '❌ Failed to fetch user',
          }));
        }
      })();
    }
  }, [logged, router, setStatus]);

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const res = await fetch(`/api/user?id=${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setStatus({
        loading: false,
        error: !res.ok ? data.message || '❌ Update failed' : '',
        success: res.ok ? '✅ Profile updated successfully' : '',
      });
    } catch {
      setStatus({
        loading: false,
        error: '❌ Error updating profile',
        success: '',
      });
    }
  };

  return (
    <div className={styles.section_container}>
      <div className={styles.user}>
        <Pillar />
        <div className={styles.container}>
          <Title title="User" />
          <form className={styles.user_form} onSubmit={handleSubmit}>
            <div className={styles.multiple_input_cont}>
              {['lastName', 'firstName'].map((field) => (
                <input
                  key={field}
                  className="input_style"
                  type="text"
                  name={field}
                  placeholder={field}
                  value={formData[field]}
                  onChange={handleChange}
                />
              ))}
            </div>
            <input
              className="input_style"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <div className={styles.multiple_input_cont}>
              <input
                className="input_style"
                type="number"
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleChange}
                min="1"
                max="120"
              />
              {['city', 'country'].map((field) => (
                <input
                  key={field}
                  className="input_style"
                  type="text"
                  name={field}
                  placeholder={field}
                  value={formData[field]}
                  onChange={handleChange}
                />
              ))}
            </div>
            {['linkedin', 'github'].map((field) => (
              <input
                key={field}
                className="input_style"
                type="url"
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChange={handleChange}
              />
            ))}
            <textarea
              className="input_style"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
            />
            <div className={styles.checkbox_group}>
              <label className={styles.checkbox_wrapper}>
                <input
                  type="checkbox"
                  checked={formData.user_chatbot}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      user_chatbot: !prev.user_chatbot,
                    }))
                  }
                />
                <span className={styles.custom_checkbox}></span>
                <p className="p_white">Activate ChatBot</p>
              </label>

              <label className={styles.checkbox_wrapper}>
                <input
                  type="checkbox"
                  checked={formData.user_contact}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      user_contact: !prev.user_contact,
                    }))
                  }
                />
                <span className={styles.custom_checkbox}></span>
                <p className="p_white">Activate Contact</p>
              </label>
            </div>

            <button type="submit" className="input_button">
              UPDATE
            </button>
          </form>
        </div>
        <Pillar />
      </div>
    </div>
  );
}
