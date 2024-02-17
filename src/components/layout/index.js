import React from 'react';
import style from './index.module.scss';

import NavBar from '@/components/partials/NavBar';
import ScrollBtn from '@/components/partials/ScrollBtn';
import ShareBtn from '@/components/partials/ShareBtn';
import Sentence from '@/components/partials/Sentence';

const Layout = ({ children }) => {
  return (
    <div className={style.global_cont}>
      <NavBar />
      <ScrollBtn />
      <ShareBtn />
      <Sentence />
      {children}
    </div>
  );
};

export default Layout;
