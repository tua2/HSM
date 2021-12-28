import React, {Component, Fragment} from 'react';
import styles from './Modal.module.css';

import Backdrop from '../Backdrop/Backdrop';

class Modal extends Component {
  render() {
    return(
      <Fragment>
        <Backdrop clicked={this.props.modalClosed} />
        <div className={styles.Modal}>
          {this.props.children}
        </div>
      </Fragment>
    );
  }
}

export default Modal;
