import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import style from './index.module.scss';

import LogoGitHub from 'p/img/share_img/github_logo.svg';
import LogoLinkedin from 'p/img/share_img/linkedin_logo.svg';
import LogoMail from 'p/img/share_img/mail_logo.svg';

import { imgWH } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { useConstants } from '@/context/ConstantsContext';

const SectionContact = () => {
  const { user } = useConstants();
  const { messageSent, setMessageSent } = useTheme();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
    // Clear messages on new input
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('✅ Your message has been sent successfully!');
        setMessageSent(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: '',
        });
      } else {
        setErrorMsg(
          data.message || '❌ Something went wrong, please try again.'
        );
      }
    } catch {
      setErrorMsg('❌ Failed to send the message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.section_contact_cont}>
      <form onSubmit={handleSubmit} className={style.contact_form} noValidate>
        <h6>Let&apos;s have a Chat 👋🏻</h6>

        <div className={style.form_group}>
          <div className={style.form_input_wrapper}>
            <label className={style.form_label} htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              className={`${style.form_input} hover_target_small`}
              required
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={style.form_input_wrapper}>
            <label className={style.form_label} htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              className={`${style.form_input} hover_target_small`}
              required
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className={style.form_group}>
          <div className={style.form_input_wrapper}>
            <label className={style.form_label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className={`${style.form_input} hover_target_small`}
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={style.form_input_wrapper}>
            <label className={style.form_label} htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Phone"
              className={`${style.form_input} hover_target_small`}
              required
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className={style.form_input_wrapper_text_area}>
          <label className={style.form_label} htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            placeholder="Message"
            className={`${style.textarea} hover_target_small`}
            required
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {user.user_contact ? (
          !messageSent ? (
            <>
              <button
                type="submit"
                className={`${style.btn_send} hover_target_big`}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? 'Sending...' : 'Send message'}
              </button>

              {errorMsg && <p className={style.error_message}>{errorMsg}</p>}
              {successMsg && (
                <p className={style.success_message}>{successMsg}</p>
              )}
            </>
          ) : (
            <div className={style.banner}>
              <p>Thank you for submitting a Message</p>
            </div>
          )
        ) : (
          <div>You can&apos;t send a message at the moment.</div>
        )}
      </form>

      <div className={style.images_container}>
        {/* GitHub Button */}
        <Link
          href={user.github}
          target="_blank"
          className={`${style.btn_share_contact} hover_target_small`}
          aria-label="GitHub"
        >
          <Image
            src={LogoGitHub.src}
            alt="Logo GitHub"
            width={imgWH}
            height={imgWH}
          />
        </Link>
        {/* LinkedIn Button */}
        <Link
          href={user.linkedin}
          target="_blank"
          className={`${style.btn_share_contact} hover_target_small`}
          aria-label="LinkedIn"
        >
          <Image
            src={LogoLinkedin.src}
            alt="Logo Linkedin"
            width={imgWH}
            height={imgWH}
          />
        </Link>
        {/* Mail Button */}
        <Link
          href={`mailto:${user.email}`}
          target="_blank"
          className={`${style.btn_share_contact} hover_target_small`}
          aria-label="Email"
        >
          <Image
            src={LogoMail.src}
            alt="Logo Mail"
            width={imgWH}
            height={imgWH}
          />
        </Link>
      </div>
    </div>
  );
};

export default SectionContact;
