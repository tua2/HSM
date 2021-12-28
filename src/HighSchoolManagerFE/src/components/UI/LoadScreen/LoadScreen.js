import React from 'react';
import styles from './LoadScreen.module.css';

const loadScreen = props => {
  return (
    <div
      style={props.style}
      className={[
        styles.LoadScreen,
        props.disabled ? styles.disabled : null,
      ].join(' ')}>
      <div className={styles.Mover} />
    </div>
  );
};

export default loadScreen;
