import React from 'react';
import styles from './ToolbarUtil.module.css';

const toolbarUtil = props => {
  return (
    <div className={styles.ToolbarUtil}>
        {props.children}
        <div className={styles.Icon}>
          <i className={"fas fa-fw "+props.icon} title={props.label} ></i>
        </div>
        <div className={styles.active}></div>
        <div className={styles.Dropdown}>
          {props.dropdown}
        </div>
    </div>
  );
}

export default toolbarUtil;
