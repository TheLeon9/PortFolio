import React from 'react';
import styles from './index.module.scss';

import Image from 'next/image';
import Deco_Image from 'p/img/deco/title_image.svg';

const Pillar = () => {
  return (
    <div className={styles.pillar}>
      <div className={styles.section_image}>
        <Image
          src={Deco_Image}
          width={40}
          height={40}
          alt="Decoration Image"
          className={styles.deco_image}
        />
      </div>
      <div className={styles.deco_line}></div>
    </div>
  );
};

export default Pillar;
