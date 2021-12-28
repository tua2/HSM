import React from 'react';
import styles from './Toolbar.module.css';
import ToolbarUtil from './ToolbarUtil/ToolbarUtil';
import logoimg from '../../../assets/images/sgh_logo.png';
import AuthContext from '../../../context/auth-context';
import Request from '../../../common/commonRequest';

const toolbar = (props) => {
  return (
    <AuthContext.Consumer>
      {context => (
        <div className={styles.Toolbar}>
          <a className={styles.Logo} href="/" >
            <img src={logoimg} alt="" title="Sai Gon High" />
          </a>
          <div className={styles.Search}></div>
          <div className={styles.Utils}>
            <ToolbarUtil label="Account" icon="fa-user-circle" dropdown={(
              <div className={styles.DropdownLink} onClick={() => {
                Request.post('/Account/Logout', {}, 'cred', () => {
                  window.location.reload();
                });
              }}>
                <div style={{
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <i className="fas fa-fw fa-sign-out-alt" style={{marginRight: '8px'}}></i>
                  Logout
                </div>
              </div>
            )} >
              <span>{context.teacher.name}</span>
            </ToolbarUtil>
          </div>
        </div>
      )}
    </AuthContext.Consumer>
  );
}

export default toolbar;
