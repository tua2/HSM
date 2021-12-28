import React, {Component, Fragment} from 'react';
import {Redirect} from 'react-router-dom';
import Request from '../../common/commonRequest';
import AuthContext from '../../context/auth-context';

class AuthRoute extends Component {
  //props: role
  state = {
    loading: true,
    isAuthen: false,
    isAuthor: false,
    role: '',
    username: '',
    teacher: {},
  };

  async componentDidMount() {
    await this.doAuthenticate();
    await this.doAuthorize();
    this.setState({loading: false});
  }

  async doAuthenticate() {
    await Request.get('/Account/isSignedIn', 'cred', response => {
      this.setState({isAuthen: response.data});
    });
  }
  async getUserInfo() {
    await Request.get('/Account/currentUser', 'cred', response => {
      this.setState({username: response.data.userName, role: response.data.roles, teacher: response.data.teacher});
    });
  }
  async doAuthorize() {
    if (!this.state.isAuthen) return;
    const allowedRoles = this.props.roles;
    if (typeof allowedRoles === 'undefined') {
      this.setState({isAuthor: true});
      return;
    }
    await this.getUserInfo();
    const userRole = this.state.role;
    if (allowedRoles.filter(role => userRole === role).length > 0)
      this.setState({isAuthor: true});
  }

  render() {
    return (
      <AuthContext.Provider value={{
        isAuthen: this.state.isAuthen,
        isAuthor: this.state.isAuthor,
        user: {
          username: this.state.username,
          role: this.state.role,
        },
        teacher: this.state.teacher,
      }}>
        <Fragment>
          {!this.state.loading ? (
            this.state.isAuthen ? (
              this.state.isAuthor ? (
                this.props.children
              ) : (
                <p>Access Denied</p>
              )
            ) : (
              <Redirect to="/Login" />
            )
          ) : null}
        </Fragment>
      </AuthContext.Provider>
    );
  }
}

export default AuthRoute;
