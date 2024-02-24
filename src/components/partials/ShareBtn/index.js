import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import style from './index.module.scss';

import CloseShare from 'p/img/share_img/close_share.svg';
import LogoGitHub from 'p/img/share_img/logo_github.svg';
import LogoLinkedin from 'p/img/share_img/logo_linkedin.svg';
import LogoShare from 'p/img/share_img/logo_share.svg';

const ShareBtn = () => {
  const [shareOpen, setShareOpen] = useState(false);
  const [logoPath, setLogoPath] = useState('');

  useEffect(() => {
    if (shareOpen) {
      setLogoPath(CloseShare.src);
    } else {
      setLogoPath(LogoShare.src);
    }
  }, [shareOpen]);

  const handleShareClicked = () => {
    setShareOpen(!shareOpen);
  };

  return (
    <div className={style.share_btn_cont}>
      <button
        onClick={handleShareClicked}
        className={`${style.btn_share} ${
          shareOpen ? style.btn_share_close : style.btn_share_open
        }`}
      >
        <Image src={logoPath} alt="Logo Share" width={20} height={20} />
      </button>
      <Link href="https://github.com/TheLeon9" target="_blank">
        <button
          className={`${style.btn_github} ${
            shareOpen ? style.btn_github_close : style.btn_github_open
          }`}
        >
          <Image
            src={LogoGitHub.src}
            alt="Logo GitHub"
            width={20}
            height={20}
          />
        </button>
      </Link>
      <Link
        href="https://www.linkedin.com/in/florian-moracchini/"
        target="_blank"
      >
        <button
          className={`${style.btn_link} ${
            shareOpen ? style.btn_link_close : style.btn_link_open
          }`}
        >
          <Image
            src={LogoLinkedin.src}
            alt="Logo Linkedin"
            width={20}
            height={20}
          />
        </button>
      </Link>
    </div>
  );
};

export default ShareBtn;
