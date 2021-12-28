import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import styles from './Admin.module.css';

class Admin extends Component {
  render() {
    return (
      <div className={[styles.Admin, styles.FadeWrapper].join(' ')}>
        <h1>Administration</h1>
        <p>Manage your school system</p>
        <br />
        <p>Go to <Link to="/Admin/Account">Account Manager</Link></p>
        <p>Start a new <Link to="/Admin/SchoolYear">School Year</Link></p>
      </div>
    );
  }
}

export default Admin
