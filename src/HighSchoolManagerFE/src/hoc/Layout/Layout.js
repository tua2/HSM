import React, {Fragment} from 'react';
import styles from './Layout.module.css';
import Toolbar from '../../components/Navigation/Toolbar/Toolbar';
import Sidedrawer from '../../components/Navigation/Sidedrawer/Sidedrawer';

const layout = (props) => {
  return (
    <Fragment>
      <Toolbar />
      <div style={{display: 'flex'}}>
        <Sidedrawer />
        <div className={styles.Wrapper}>
          {props.children}
        </div>
      </div>
    </Fragment>
  );
}

export default layout;
