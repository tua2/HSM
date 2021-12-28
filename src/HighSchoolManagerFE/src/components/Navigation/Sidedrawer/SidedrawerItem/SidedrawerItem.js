import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import styles from './SidedrawerItem.module.css';

class SidedrawerItem extends Component {
  state = {
    isInActive: false,
  }

  render() {
    return (
      <li className={[styles.SidedrawerWrapper, (this.props.isactive ? styles.WrapperActive : null)].join(' ')}>
        <NavLink
          to={this.props.link}
          exact={this.props.exact}
          className={styles.SidedrawerItem}
          activeClassName={styles.active}
          onClick={this.props.clicked}
        >
          <div className={styles.label}>
            <i className={"fas fa-fw "+this.props.icon}></i>
            {this.props.label}
          </div>
          <div className={[styles.indicator, (this.props.isactive ? styles.active : null)].join(' ')}></div>
        </NavLink>
        <div className={styles.SidedrawerMenu}>
          {this.props.children}
        </div>
      </li>
    );
  }
};

export default SidedrawerItem;
