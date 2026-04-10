//=============================================================================
// SectionContact — Contact form + social links
//
// Pure HTML form with controlled inputs. The submission handler is a stub
// (no backend wired in) — it only flips the loading flag for the UX. The
// "messageSent" flag lives in ThemeContext so the success banner can be
// shown across remounts.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

// Theme context exposes `messageSent` so the banner survives section swaps.
import { useTheme } from '@/context/ThemeContext';

// Constants: shared image size + user social URLs + contact toggle.
import { imgWH, userList } from '@/constants';

// Social icons served from /public.
import LogoGitHub from 'p/img/share_img/github_logo.svg';
import LogoLinkedin from 'p/img/share_img/linkedin_logo.svg';
import LogoMail from 'p/img/share_img/mail_logo.svg';

// CSS module — form layout, input styles, error/success colours.
import style from './index.module.scss';

//-- Constants ----------------------------------------------------------------
// Empty form state used both as the initial value and after a successful submit.
const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
};

/**
 * SectionContact
 * Holds the local form state and a few UX flags. The actual submit logic
 * is intentionally stubbed — wire up the API call inside `handleSubmit`.
 */
const SectionContact = () => {
  //-- State / Refs -----------------------------------------------------------

  // `messageSent` toggles the post-submit thank-you banner.
  const { messageSent, setMessageSent } = useTheme();

  // Controlled inputs.
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Loading flag — disables the form while a submit is in flight.
  const [loading, setLoading] = useState(false);

  // Inline messages displayed below the submit button.
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  //-- Handlers ---------------------------------------------------------------

  /**
   * handleChange
   * Generic onChange that targets the input by its `id` attribute.
   * Also clears any previous error/success message so they don't linger
   * once the user starts typing again.
   */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
    setErrorMsg('');
    setSuccessMsg('');
  };

  /**
   * handleSubmit
   * Stub: prevents the default form submit, sets loading on and clears
   * messages. Real API call would replace the body of this function.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.section_contact_cont}>
      <form
        onSubmit={handleSubmit}
        className={style.contact_form}
        noValidate
        aria-describedby="form-error form-success"
      >
        <h6>Let&apos;s have a Chat 👋🏻</h6>

        {/* Row 1: first + last name. */}
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
              aria-required="true"
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
              aria-required="true"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Row 2: email + phone. */}
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
              aria-required="true"
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
              aria-required="true"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Big message textarea. */}
        <div className={style.form_input_wrapper_text_area}>
          <label className={style.form_label} htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            placeholder="Message"
            className={`${style.textarea} hover_target_small`}
            required
            aria-required="true"
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Submit button — three states: enabled, disabled, hidden when contact off. */}
        {userList.user_contact ? (
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

              {/* Inline messages. ID matches the form's aria-describedby. */}
              {errorMsg && (
                <p id="form-error" role="alert" className={style.error_message}>
                  {errorMsg}
                </p>
              )}
              {successMsg && (
                <p id="form-success" role="alert" className={style.success_message}>
                  {successMsg}
                </p>
              )}
            </>
          ) : (
            // Post-submit thank-you banner.
            <div className={style.banner}>
              <p>Thank you for submitting a Message</p>
            </div>
          )
        ) : (
          // Contact disabled at compile time via userList.user_contact.
          <p>You can&apos;t send a message at the moment.</p>
        )}
      </form>

      {/* Social icons column to the right of the form. */}
      <div className={style.images_container}>
        {/* GitHub */}
        <Link
          href={userList.github}
          target="_blank"
          className={`${style.btn_share_contact} hover_target_small`}
          aria-label="GitHub"
        >
          <Image
            src={LogoGitHub}
            alt="Logo GitHub"
            width={imgWH}
            height={imgWH}
          />
        </Link>

        {/* LinkedIn */}
        <Link
          href={userList.linkedin}
          target="_blank"
          className={`${style.btn_share_contact} hover_target_small`}
          aria-label="LinkedIn"
        >
          <Image
            src={LogoLinkedin}
            alt="Logo Linkedin"
            width={imgWH}
            height={imgWH}
          />
        </Link>

        {/* Mail */}
        <Link
          href={`mailto:${userList.email}`}
          target="_blank"
          className={`${style.btn_share_contact} hover_target_small`}
          aria-label="Email"
        >
          <Image src={LogoMail} alt="Logo Mail" width={imgWH} height={imgWH} />
        </Link>
      </div>
    </div>
  );
};

export default SectionContact;
