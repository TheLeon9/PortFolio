import React from 'react';
import styles from './index.module.scss';

const Title = (props) => {
  return (
    <div className={styles.section_title}>
      <h1>{props.title}</h1>
    </div>
  );
};

export default Title;
