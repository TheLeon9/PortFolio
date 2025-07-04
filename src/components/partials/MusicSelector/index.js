import React from 'react';

import style from './index.module.scss';

import MusicButton from '@/components/UI/MusicButton';

const MusicSelector = () => {
  return (
    <div className={style.music_selector_cont}>
      <MusicButton />
    </div>
  );
};

export default MusicSelector;
