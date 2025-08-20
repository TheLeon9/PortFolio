import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

import styles from './index.module.scss';

import { useTheme } from '@/context/ThemeContext';
import Logo from 'p/img/logo/logo_fm_white.svg';
import Katana from 'p/img/deco/katana.svg';
import DecoImage from 'p/img/deco/title_image.svg';
import LightImage from 'p/img/custom_img/sun.svg';
import DarkImage from 'p/img/custom_img/moon.svg';

export default function Layout({ children }) {
  const router = useRouter();
  const { logged, isLogged, status, darkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    isLogged(false);
    router.replace('/admin');
  };

  return (
    <div className={styles.layout_wrapper}>
      <div className={styles.background_global_container} />

      <div id="top" className={styles.global_container}>
        {/* Header */}
        <header className={styles.section_top}>
          <Image
            src={Logo}
            width={80}
            height={80}
            alt="Logo FM"
            className={styles.logo}
          />
        </header>

        {/* Navigation */}
        {logged && (
          <nav className={styles.section_nav}>
            <ul className={styles.nav_list}>
              <li>
                <Link href="/admin/user" className={styles.nav_item}>
                  User
                </Link>
              </li>
              <li>
                <Link href="/admin/projects" className={styles.nav_item}>
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/admin/skills" className={styles.nav_item}>
                  Skills
                </Link>
              </li>
            </ul>
          </nav>
        )}

        {/* Scroll to Top */}
        {logged && (
          <a
            href="#top"
            className={styles.scroll_to_top}
            aria-label="Scroll to Top"
          >
            <Image
              src={Katana}
              alt="Katana Left"
              className={styles.to_top_image_left}
            />
            <Image
              src={Katana}
              alt="Katana Right"
              className={styles.to_top_image_right}
            />
          </a>
        )}

        {/* Theme Toggle & Logout */}
        {logged && (
          <div className={styles.action_btn_cont}>
            <button
              onClick={toggleTheme}
              className={styles.theme_toggle_button}
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <Image
                  src={DarkImage}
                  width={40}
                  height={40}
                  alt="Logo FM"
                  className={styles.logo}
                />
              ) : (
                <Image
                  src={LightImage}
                  width={40}
                  height={40}
                  alt="Logo FM"
                  className={styles.logo}
                />
              )}
            </button>
            <button
              onClick={handleLogout}
              className={styles.logout_button}
              aria-label="Logout"
            >
              <Image
                src={DecoImage}
                width={40}
                height={40}
                alt="Logout"
                className={styles.deco_image}
              />
            </button>
          </div>
        )}

        {/* Content */}
        {React.cloneElement(children)}
      </div>

      {/* Alerts */}
      {status?.error && (
        <div className="error_banner">
          <p>{status.error}</p>
        </div>
      )}
      {status?.success && (
        <div className="success_banner">
          <p>{status.success}</p>
        </div>
      )}
    </div>
  );
}
