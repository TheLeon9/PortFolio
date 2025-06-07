import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import style from './index.module.scss';

import CloseShare from 'p/img/share_img/close_share.svg';
import LogoGitHub from 'p/img/share_img/github_logo.svg';
import LogoLinkedin from 'p/img/share_img/linkedin_logo.svg';
import LogoMail from 'p/img/share_img/mail_logo.svg';
import LogoShare from 'p/img/share_img/share_logo.svg';

import { imgWH } from '@/constants';

const ShareBtn = () => {
  const [shareOpen, setShareOpen] = useState(false);

  const handleShareClicked = () => {
    setShareOpen(!shareOpen);
  };

  return (
    <div className={style.share_btn_cont}>
      <p className={style.btn_title}>
        <span>social</span>
        <span>social</span>
      </p>
      {/* Open and Close Share Button */}
      <button
        onClick={handleShareClicked}
        className={`${style.btn_share} ${
          shareOpen ? style.btn_share_close : style.btn_share_open
        }`}
      >
        <Image
          src={shareOpen ? CloseShare.src : LogoShare.src}
          alt="Logo Share"
          width={imgWH}
          height={imgWH}
        />
      </button>
      {/* GitHub Button */}
      <Link href="https://github.com/TheLeon9" target="_blank">
        <button
          className={`${style.btn_github} ${
            shareOpen ? style.btn_close : style.btn_open
          }`}
        >
          <Image
            src={LogoGitHub.src}
            alt="Logo GitHub"
            width={imgWH}
            height={imgWH}
          />
        </button>
      </Link>
      {/* LinkedIn Button */}
      <Link
        href="https://www.linkedin.com/in/florian-moracchini/"
        target="_blank"
      >
        <button
          className={`${style.btn_link} ${
            shareOpen ? style.btn_close : style.btn_open
          }`}
        >
          <Image
            src={LogoLinkedin.src}
            alt="Logo Linkedin"
            width={imgWH}
            height={imgWH}
          />
        </button>
      </Link>
      {/* Mail Button */}
      <Link href="" target="_blank">
        <button
          className={`${style.btn_mail} ${
            shareOpen ? style.btn_close : style.btn_open
          }`}
        >
          <Image
            src={LogoMail.src}
            alt="Logo Mail"
            width={imgWH}
            height={imgWH}
          />
        </button>
      </Link>
    </div>
  );
};

export default ShareBtn;
