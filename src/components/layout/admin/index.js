import React from 'react';
import styles from './index.module.scss';
import Link from 'next/link';

import { useTheme } from '@/context/ThemeContext.js';
import { useRouter } from 'next/router';

import Image from 'next/image';
import Logo from 'p/img/logo/logo_fm_white.svg';
import Katana from 'p/img/deco/katana.svg';
import Deco_Image from 'p/img/deco/title_image.svg';

export default function Layout({ children }) {
  const router = useRouter();
  const { logged, isLogged } = useTheme();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('❌ Logout failed:', err);
    }

    isLogged(false);
    router.replace('/');
  };

  return (
    <div className={styles.layout_wrapper}>
      <div className={styles.background_global_container}></div>
      <div id="top" className={styles.global_container}>
        {/* Header */}
        <div className={styles.section_top}>
          <Image
            src={Logo}
            width={80}
            height={80}
            alt="Logo FM"
            className={styles.logo}
          />
        </div>

        {/* Nav Bar */}
        {logged && (
          <nav className={styles.section_nav}>
            {/* Navigation Bar */}
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
              {/* <li>
                <Link href="/admin/dashboard" className={styles.nav_item}>
                  Dashboard
                </Link>
              </li> */}
            </ul>
          </nav>
        )}

        {/* Top Helper */}
        {logged && (
          <a href="#top" className={styles.scroll_to_top}>
            <Image
              src={Katana}
              width={0}
              height={0}
              alt="Left Katana"
              className={styles.to_top_image_left}
            />
            <Image
              src={Katana}
              width={0}
              height={0}
              alt="Right Katana"
              className={styles.to_top_image_right}
            />
          </a>
        )}

        {/* Log Out */}
        {logged && (
          <button onClick={handleLogout} className={styles.logout_button}>
            <Image
              src={Deco_Image}
              width={40}
              height={40}
              alt="Decoration Image"
              className={styles.deco_image}
            />
          </button>
        )}

        {/* Main / Children */}
        {React.cloneElement(children)}
      </div>
    </div>
  );
}
