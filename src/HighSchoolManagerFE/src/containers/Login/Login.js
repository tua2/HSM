import React, {Component, Fragment} from 'react';
import {Redirect} from 'react-router-dom';
import {message, Input} from 'antd';
import Button from '../../components/UI/Button/Button';
import Request from '../../common/commonRequest';
import styles from './Login.module.css';

import logoimg from '../../assets/images/sgh_logo_with_tagline.png';
import LoadScreen from '../../components/UI/LoadScreen/LoadScreen';

class Login extends Component {
  state = {
    loading: true,
    isAuthen: false,
    loginModel: {
      userName: null,
      password: null,
    },
    signingIn: false,
  };

  async componentDidMount() {
    await this.doAuthenticate();
    this.setState({loading: false});
    if (!this.state.isAuthen)
      this.usernameInput.focus();
  }

  async doAuthenticate() {
    await Request.get('/Account/isSignedIn', 'cred', response => {
      this.setState({isAuthen: response.data});
    });
  }

  loginModelOnChangeHandler = (event, key) => {
    const value = event.target.value;
    this.setState(prevState => {
      let newModel = {...prevState.loginModel};
      newModel[key] = value;
      return {loginModel: newModel};
    });
  };

  passwordOnKeyPressHandler = event => {
    if (event.key === 'Enter') {
      this.submitLoginModel();
    }
  };

  validateLoginModel() {
    if (!this.state.loginModel.userName) {
      message.error('Please enter username');
      return false;
    }
    if (!this.state.loginModel.password) {
      message.error('Please enter password');
      return false;
    }
    return true;
  }

  submitLoginModel = () => {
    // Exit conditions
    if (this.state.signingIn) return;
    if (!this.validateLoginModel()) return;

    this.setState({signingIn: true});
    const loginModel = {...this.state.loginModel};
    Request.post('/Account/Login', loginModel, 'cred', () => {
      window.location.reload();
    }, error => {
      console.log(error.response);
      message.error('Incorrect username or password');
      this.setState({signingIn: false});
    });
  }

  render() {
    return (
      <Fragment>
        {!this.state.loading ? (
          this.state.isAuthen ? (
            <Redirect to="/" />
          ) : (
            <div className={styles.Login}>
              <LoadScreen style={{position: 'fixed', height: '100vh', backgroundColor: '#F2F2F2'}} disabled={!this.state.signingIn} />
              <div className={styles.LoginBox}>
                <div className={styles.Logo} style={{margin: '5px 0 10px 0', zIndex: '100'}}>
                  <img src={logoimg} alt="" title="Sai Gon High - powered by HighSchoolManager" width="100%" height="100%" />
                </div>
                <Input
                  style={{margin: '5px 0'}}
                  placeholder="Username"
                  ref={input => this.usernameInput = input}
                  value={this.state.loginModel.userName}
                  onChange={event =>
                    this.loginModelOnChangeHandler(event, 'userName')
                  }
                />
                <Input.Password
                  style={{margin: '5px 0'}}
                  placeholder="Password"
                  onKeyPress={this.passwordOnKeyPressHandler}
                  value={this.state.loginModel.password}
                  onChange={event =>
                    this.loginModelOnChangeHandler(event, 'password')
                  }
                />
                <Button style={{margin: '10px 0 5px 0'}} color="primary" clicked={this.submitLoginModel}>
                  Login
                </Button>
              </div>
            </div>
          )
        ) : null}
      </Fragment>
    );
  }
}

export default Login;
