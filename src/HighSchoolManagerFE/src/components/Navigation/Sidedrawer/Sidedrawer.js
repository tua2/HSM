import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import styles from './Sidedrawer.module.css';
import Auth from '../../../common/commonAuth';
import AuthContext from '../../../context/auth-context';
import LoadScreen from '../../UI/LoadScreen/LoadScreen';
import SidedrawerItem from './SidedrawerItem/SidedrawerItem';
import SidedrawerMenuItem from './SidedrawerMenuItem/SidedrawerMenuItem';

class Sidedrawer extends Component {
  state = {
    loading: false,
    currentPage: "",
  }

  onClickHandler = (_page) => {
    if (this.state.currentPage !== _page)
      this.setState({currentPage: _page});
  }

  componentDidMount() {
    this.setState({currentPage: window.location.pathname.split('/')[1]});
  }
  componentDidUpdate() {
    if ("/"+this.state.currentPage !== "/"+this.props.location.pathname.split('/')[1]) {
      this.onClickHandler(this.props.location.pathname.split('/')[1]);
    }
  }

  render() {
    return (
      <AuthContext.Consumer>
        {context => (
          <div className={styles.Sidedrawer}>
            {!context.user.role ? <LoadScreen /> :
              <ul>
                <SidedrawerItem link="/" label="Home" icon="fa-home" exact isactive={this.state.currentPage === ""} clicked={() => this.onClickHandler('')}>
                </SidedrawerItem>
                {Auth.isInRoles(context.user.role, ["Admin"]) ? (
                  <Fragment>
                    <SidedrawerItem link="/Admin" label="Administration" icon="fa-users-cog" exact
                      isactive={this.state.currentPage === "Admin"}
                      clicked={() => this.onClickHandler('Admin')}
                    >
                      <SidedrawerMenuItem link="/Admin/Account" label="Accounts" />
                      <SidedrawerMenuItem link="/Admin/SchoolYear" label="School Years" />
                    </SidedrawerItem>
                  </Fragment>
                ) : null}
                {Auth.isInRoles(context.user.role, ["Manager", "Teacher"]) ? (
                  <Fragment>
                    <SidedrawerItem link="/Student" label="Students" icon="fa-users" exact
                      isactive={this.state.currentPage === "Student"}
                      clicked={() => this.onClickHandler('Student')}
                    >
                      <SidedrawerMenuItem link="/Student/MyClass" label="My Class" />
                      {!Auth.isInRoles(context.user.role, ["Manager"]) ? null : (
                        <Fragment>
                          <SidedrawerMenuItem link="/Student/AddStudent" label="Add Student" />
                          <SidedrawerMenuItem link="/Student/ClassManager" label="Class Manager" />
                        </Fragment>
                      )}
                    </SidedrawerItem>

                    {!Auth.isInRoles(context.user.role, ["Manager"]) ? null : (
                      <SidedrawerItem link="/Assignment" label="Assignments" icon="fa-chalkboard-teacher" exact
                        isactive={this.state.currentPage === "Assignment"}
                        clicked={() => this.onClickHandler('Assignment')}
                      >
                      </SidedrawerItem>
                    )}

                    <SidedrawerItem link="/Result" label="Results" icon="fa-graduation-cap" exact
                      isactive={this.state.currentPage === "Result"}
                      clicked={() => this.onClickHandler('Result')}
                    >
                      <SidedrawerMenuItem link="/Result/View" label="View" />
                      <SidedrawerMenuItem link="/Result/Manage" label="Manage" />
                    </SidedrawerItem>

                    {/*
                    <SidedrawerItem link="/Conduct" label="Conduct" icon="fa-clipboard-list" exact
                      isactive={this.state.currentPage === "Conduct"}
                      clicked={() => this.onClickHandler('Conduct')}
                    >
                      <SidedrawerMenuItem link="/Conduct/Violations" label="Violation Record" />
                      <SidedrawerMenuItem link="/Conduct/RulesManager" label="Rules Manager" />
                    </SidedrawerItem>
                    */}

                    <SidedrawerItem link="/Report" label="Reports" icon="fa-chart-bar" exact
                      isactive={this.state.currentPage === "Report"}
                      clicked={() => this.onClickHandler('Report')}
                    >
                      {!Auth.isInRoles(context.user.role, ["Manager"]) ? null : (
                        <Fragment>
                          <SidedrawerMenuItem link="/Report/Create" label="Create" />
                        </Fragment>
                      )}
                    </SidedrawerItem>
                  </Fragment>
                ) : null}
              </ul>
            }
          </div>
        )}
      </AuthContext.Consumer>
    );
  }

};

export default withRouter(Sidedrawer);
