//=============================================================================
// ShareBtn — Toggleable social links (GitHub, LinkedIn, Mail)
//
// Renders a primary "share" button that, when clicked, slides three social
// link buttons into view. Each link is a Next.js <Link> opening in a new
// tab. Open/close state is local component state.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

// Constants: shared image size + user social URLs.
import { imgWH, userList } from '@/constants';

// Icons served from /public/img/share_img.
import CloseShare from 'p/img/share_img/close_share.svg';
import LogoGitHub from 'p/img/share_img/github_logo.svg';
import LogoLinkedin from 'p/img/share_img/linkedin_logo.svg';
import LogoMail from 'p/img/share_img/mail_logo.svg';
import LogoShare from 'p/img/share_img/share_logo.svg';

// CSS module: share button base styles + open/close transitions.
import style from './index.module.scss';

/**
 * ShareBtn
 * Local toggle of an open/close boolean — every visual transition is CSS.
 */
const ShareBtn = () => {
  //-- State / Refs -----------------------------------------------------------
  // True when the social links are visible, false when collapsed.
  const [shareOpen, setShareOpen] = useState(false);

  //-- Handlers ---------------------------------------------------------------
  // Single toggle handler — flips the boolean.
  const handleShareClicked = () => setShareOpen(!shareOpen);

  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.share_btn_cont}>
      {/* Decorative title rendered as two stacked span (CSS handles the
          marquee effect). */}
      <p className={style.btn_title}>
        <span>social</span>
        <span>social</span>
      </p>

      {/* Primary toggle button — icon swaps between share and close. */}
      <button
        onClick={handleShareClicked}
        className={`${style.btn_share} ${
          shareOpen ? style.btn_share_close : style.btn_share_open
        } hover_target_big`}
        aria-label="Toggle social links"
      >
        <Image
          src={shareOpen ? CloseShare : LogoShare}
          alt="Logo Share"
          width={imgWH}
          height={imgWH}
        />
      </button>

      {/* GitHub link — visible only when shareOpen is true (CSS-driven). */}
      <Link href={userList.github} target="_blank" aria-label="GitHub">
        <button
          className={`${style.btn_github} ${
            shareOpen ? style.btn_close : style.btn_open
          } hover_target_small`}
        >
          <Image
            src={LogoGitHub}
            alt="Logo GitHub"
            width={imgWH}
            height={imgWH}
          />
        </button>
      </Link>

      {/* LinkedIn link. */}
      <Link href={userList.linkedin} target="_blank" aria-label="LinkedIn">
        <button
          className={`${style.btn_link} ${
            shareOpen ? style.btn_close : style.btn_open
          } hover_target_small`}
        >
          <Image
            src={LogoLinkedin}
            alt="Logo Linkedin"
            width={imgWH}
            height={imgWH}
          />
        </button>
      </Link>

      {/* Mail link — opens the user's default mail client. */}
      <Link
        href={`mailto:${userList.email}`}
        target="_blank"
        aria-label="Email"
      >
        <button
          className={`${style.btn_mail} ${
            shareOpen ? style.btn_close : style.btn_open
          } hover_target_small`}
        >
          <Image src={LogoMail} alt="Logo Mail" width={imgWH} height={imgWH} />
        </button>
      </Link>
    </div>
  );
};

export default ShareBtn;
