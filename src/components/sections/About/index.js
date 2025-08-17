import React from 'react';
import Image from 'next/image';
import style from './index.module.scss';

import LogoFM from 'p/img/about/shadow_lion.png';

import { userList } from '@/constants';

const SectionAbout = () => {
  const user = userList[0] || {};

  return (
    <div className={style.section_about_cont}>
      <div className={style.about_wrapper}>
        <div className={style.profile_section}>
          <div className={style.profile_picture}>
            <Image
              src={LogoFM.src}
              alt={`${user.firstName} ${user.lastName}`}
              width={200}
              height={200}
              className={style.profile_image}
            />
          </div>
          <div className={style.profile_info}>
            <p>
              Name
              <span
                className={style.info_value}
              >{`${user.firstName} ${user.lastName}`}</span>
            </p>
            <p>
              Age<span className={style.info_value}>{user.year}</span>
            </p>
            <p>
              Location
              <span
                className={style.info_value}
              >{`${user.city}, ${user.country}`}</span>
            </p>
          </div>
        </div>
        <div className={style.bio_section}>
          <p>
            Hey 👋🏻, I&#39;m Moracchini Florian, a 🟦⬜🟥 passionate web
            developer and designer. This portfolio is my creative hub, where I
            showcase projects, explore ideas, and narrate my digital journey. 🎮
          </p>
          <p>
            This portfolio is created with passion 🌊, inspired by simplicity ❄️
            and tranquility 💧. I hope you enjoy the experience ⚡ as much as I
            enjoyed creating it 🔨.
          </p>
          <p>
            I specialize in front-end development with expertise in ⚛️ React, ⚛️
            Next.js, and ⚛️ Three.js. My goal is to build responsive and
            interactive applications 💻 that provide a seamless user experience.
          </p>
          <p>{user.description}</p>
        </div>
      </div>
    </div>
  );
};

export default SectionAbout;
