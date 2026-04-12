//=============================================================================
// SectionAbout — About section UI overlay (avatar, quick info, biography)
//
// React side of the About section. The 3D glass fragments are handled by
// the Three.js scene; this component is the HTML overlay shown alongside
// them with the personal info coming from `userList`.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React from 'react';

// import Image from 'next/image';

// Personal data — single source of truth for name, age, location, bio.
import { userList } from '@/constants';

// Avatar served from /public.
// import LogoFM from 'p/img/about/shadow_lion.png';

// CSS module: profile layout, biography typography, responsive tweaks.
import style from './index.module.scss';

/**
 * SectionAbout
 * Pure presentation component — no state, no effects.
 */
const SectionAbout = () => {
  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.section_about_cont}>
      <div className={style.about_wrapper}>
        {/* Profile column: avatar + quick info (name / age / location). */}
        <div className={style.profile_section}>
          <div className={style.profile_picture}>
            {/* <Image
              src={LogoFM.src}
              alt={`${userList.firstName} ${userList.lastName}`}
              width={200}
              height={200}
              className={style.profile_image}
            /> */}
          </div>
          <div className={style.profile_info}>
            <p>
              Name
              <span className={style.info_value}>
                {`${userList.firstName} ${userList.lastName}`}
              </span>
            </p>
            <p>
              Age<span className={style.info_value}>{userList.year}</span>
            </p>
            <p>
              Location
              <span className={style.info_value}>
                {`${userList.city}, ${userList.country}`}
              </span>
            </p>
          </div>
        </div>

        {/* Biography column: 4 paragraphs of personal pitch. */}
        <div className={style.bio_section}>
          <p>
            Hey 👋🏻, I&#39;m Moracchini Florian, a 🟦⬜🟥 passionate web
            developer and designer. This portfolio is my creative hub, where I
            showcase projects, explore ideas, and narrate my digital journey.
            🎮
          </p>
          <p>
            This portfolio is created with passion 🌊, inspired by simplicity
            ❄️ and tranquility 💧. I hope you enjoy the experience ⚡ as much
            as I enjoyed creating it 🔨.
          </p>
          <p>
            I specialize in front-end development with expertise in ⚛️ React,
            ⚛️ Next.js, and ⚛️ Three.js. My goal is to build responsive and
            interactive applications 💻 that provide a seamless user
            experience.
          </p>
          {/* Last paragraph is dynamic — pulled from userList. */}
          <p>{userList.description}</p>
        </div>
      </div>
    </div>
  );
};

export default SectionAbout;
