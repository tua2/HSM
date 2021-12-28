import React, {Component, Fragment} from 'react';
import {Route, Link} from 'react-router-dom';
import {Input, Select, Table, message} from 'antd';
import styles from './Account.module.css';
import CreateAccount from './CreateAccount/CreateAccount';

import AuthContext from '../../../context/auth-context';
import Request from '../../../common/commonRequest';
import Fetch from '../../../common/commonFetch';
import Modal from '../../../components/UI/Modal/Modal';
import LoadScreen from '../../../components/UI/LoadScreen/LoadScreen';
import Card from '../../../components/UI/Card/Card';
import Button from '../../../components/UI/Button/Button';

const {Option} = Select;

class Account extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,
    callFetchUsers: false,
    callStartChangingPassword: false,
    filters: {
      name: '',
    },
    updatingUser: {
      userName: null,
      password: null,
      ref: null,
    },

    tableColumns: [
      {
        title: 'Teacher',
        width: 232,
        key: 'teacher',
        render: (text, record, index) => record.teacher.name,
        sorter: (a,b) => a.teacher.name.localeCompare(b.teacher.name),
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'User Name',
        width: 200,
        key: 'username',
        dataIndex: 'userName',
        sorter: (a,b) => a.userName.localeCompare(b.userName),
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Role',
        key: 'subject',
        render: (text, record, index) => (
          <Select
            value={record.roles}
            style={{width: '100%', maxWidth: '200px'}}
            onChange={(event) => this.roleOnChangeHandler(event, record.userName)}
            disabled={this.context.user.username === record.userName}
          >
            {this.state.roles.map(r => (
              <Option key={r.id} value={r.name}>
                {r.name}
              </Option>
            ))}
          </Select>
        ),
        sorter: (a,b) => a.roles.localeCompare(b.roles),
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Password',
        width: 190,
        fixed: 'right',
        key: 'action',
        render: (text, record, index) => (
          record.userName === this.state.updatingUser.userName ? (
            <Input.Password
              value={this.state.updatingUser.password}
              style={{width: '100%'}}
              ref={this.state.updatingUser.ref}
              onChange={event => this.changePasswordHandler(event)}
              onBlur={() => this.stopChangingPasswordHandler()}
              onKeyDown={(event) => {
                if (event.key === 'Enter')
                  this.submitPasswordHandler();
                // Pressing ESC
                if (event.key === 'Escape') {
                  event.preventDefault();
                  this.setState({updatingUser: {userName: null, password: null, ref: null}});
                }
              }}
              placeholder="Press ENTER to save"
            />
          ) :
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <button
              style={{color: '#1890ff', cursor: 'pointer', WebkitAppearance: 'none', border: 'none', background: 'transparent'}}
              onClick={() => this.startChangingPasswordHandler(record.userName)}
            >
              <b>Reset Password</b>
            </button>
          </div>
        ),
      },
    ],
  }

  filterOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    let _filters = {...this.state.filters};
    _filters[key] = value;
    this.setState({filters: _filters});
    if (key !== 'name')
      this.setState({callUpdate: true, updating: true});
  };

  modalClosedHandler = () => {
    this.props.history.push('/Admin/Account');
  }

  roleOnChangeHandler = async (event, userName) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    let _updatedUsers = [...this.state.users];
    _updatedUsers.filter(u => u.userName === userName)[0].roles = value;
    this.setState({users: _updatedUsers});
    // Update
    await Request.put(`/Administrator/ChangeUserRole?userName=${userName}&role=${value}`, {}, 'cred');
    message.success('Updating role successfully');
  };

  startChangingPasswordHandler = (userName) => {
    let _updatingUser = {...this.state.updatingUser};
    _updatingUser.userName = userName;
    _updatingUser.ref = React.createRef();
    this.setState({updatingUser: _updatingUser, callStartChangingPassword: true});
  }
  stopChangingPasswordHandler = () => {
    let _updatingUser = {...this.state.updatingUser};
    _updatingUser.userName = null;
    _updatingUser.password = null;
    _updatingUser.ref = null;
    this.setState({updatingUser: _updatingUser});
  }

  changePasswordHandler = (event) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    let _updatingUser = {...this.state.updatingUser};
    _updatingUser.password = value;
    this.setState({updatingUser: _updatingUser});
  }

  submitPasswordHandler = async () => {
    let _updatingUser = {...this.state.updatingUser};
    if (!_updatingUser.password)
      return;
    await Request.put('/Administrator/ChangeUserPassword', {userName: _updatingUser.userName, password: _updatingUser.password}, 'cred',
      () => {
        this.setState({updatingUser: {userName: null, password: null, ref: null}});
        message.success('Changing password successfully');
      }, error => {
        console.log(error.response);
        message.error('Invalid password');
      });
  }

  async componentDidMount() {
    await Promise.all([Fetch.fetchUsers(this, this.state.filters), Fetch.fetchRoles(this)]);
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      if (this.state.callFetchUsers) {
        this.setState({callFetchUsers: false});
        await Fetch.fetchUsers(this, this.state.filters);
      }
      this.setState({updating: false});
    }
    if (this.state.callStartChangingPassword) {
      this.setState({callStartChangingPassword: false});
      this.state.updatingUser.ref.current.focus();
    }
  }

  render() {
    return (
      <Fragment>
        <Route path="/Admin/Account/Create" render={() => (
          <Modal modalClosed={this.modalClosedHandler}>
            <CreateAccount
              finish={() => {this.setState({callUpdate: true, updating: true, callFetchUsers: true}); this.modalClosedHandler()}}
            />
          </Modal>
        )} />
        {this.state.loading ? <LoadScreen style={{position: 'fixed', top: '64px', left: '225px'}} /> : (
          <div className={[styles.Account, styles.FadeWrapper].join(' ')}>
            <h1>Manage Accounts</h1>
            <p>View, add, edit accounts for teachers</p>
            <p>
              <Link to="/Admin/Account/Create">
                <Button color="primary" icon="fa-plus">
                  New Account
                </Button>
              </Link>
            </p>
            <Card style={{height: 'calc(100vh - 290px)', flexDirection: 'column'}} >
              <div className={styles.FilterWrapper}>
                <div>
                  <span>Name: </span>
                  <Input
                    className={styles.FilterInput}
                    placeholder="Teacher name"
                    value={this.state.filters.name}
                    onChange={event => this.filterOnChangeHandler(event, 'name')}
                    onKeyPress={event => {if (event.key === 'Enter') {this.setState({callUpdate: true, updating: true, callFetchUsers: true})}}}
                  />
                </div>
              </div>
              <div className={styles.TableWrapper}>
                <div style={{
                  height: 'calc(100vh - 420px)',
                  border: 'thin solid #e8e8e8',
                  borderRadius: '4px'
                }}>
                  {this.state.updating ? <LoadScreen /> :
                    <Fragment>
                      <div className={styles.FadeWrapper} style={{height: 'calc(100vh - 549px)'}}>
                        <Table
                          columns={this.state.tableColumns}
                          dataSource={this.state.users}
                          scroll={{y: 'calc(100vh - 462px)'}}
                          pagination={false}
                          size="small"
                          bordered
                        />
                      </div>
                    </Fragment>
                  }
                </div>
              </div>
            </Card>
          </div>
        )}
      </Fragment>
    );
  }
}

Account.contextType = AuthContext;
export default Account;
