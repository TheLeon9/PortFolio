import React, { useState } from 'react';
import style from './index.module.scss';

import Image from 'next/image';
import Link from 'next/link';

import LogoGitHub from 'p/img/share_img/github_logo.svg';
import LogoLinkedin from 'p/img/share_img/linkedin_logo.svg';
import LogoMail from 'p/img/share_img/mail_logo.svg';

import { imgWH } from '@/constants/constants';

const SectionContact = () => {
  const [messageSent, setMessageSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessageSent(true);
  };

  return (
    <div className={style.section_contact_cont}>
      <form onSubmit={handleSubmit} className={style.contact_form}>
        <h6>Lets have a Chat 👋🏻</h6>
        <div className={style.form_group}>
          <div className={style.form_input_wrapper}>
            <label className={style.form_label} htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              className={style.form_input}
              required
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
              className={style.form_input}
              required
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
              className={style.form_input}
              required
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
              className={style.form_input}
              required
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
            className={style.textarea}
            required
          ></textarea>
        </div>
        {!messageSent ? (
          <button type="submit" className={style.btn_send}>
            Send message
          </button>
        ) : (
          <div className={style.banner}>
            <p>The recipient is not reachable</p>
          </div>
        )}
      </form>
      <div className={style.images_container}>
        {/* GitHub Button */}
        <Link
          href="https://github.com/TheLeon9"
          target="_blank"
          className={style.btn_share_contact}
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
          href="https://www.linkedin.com/in/florian-moracchini/"
          target="_blank"
          className={style.btn_share_contact}
        >
          <Image
            src={LogoLinkedin.src}
            alt="Logo Linkedin"
            width={imgWH}
            height={imgWH}
          />
        </Link>
        {/* Mail Button */}
        <Link href="" className={style.btn_share_contact}>
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
