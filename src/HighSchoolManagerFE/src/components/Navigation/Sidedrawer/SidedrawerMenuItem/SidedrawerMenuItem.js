import React from 'react';
import {NavLink} from 'react-router-dom';
import styles from './SidedrawerMenuItem.module.css';

const sidedrawerMenuItem = props => {
  return (
    <NavLink
      to={props.link}
      exact
      className={styles.SidedrawerMenuItem}
      activeClassName={styles.active}
    >
      <div className={styles.label}>
        {props.label}
      </div>
      <div className={styles.divider}></div>
      <div className={styles.indicator}></div>
    </NavLink>
  );
}

export default sidedrawerMenuItem;
