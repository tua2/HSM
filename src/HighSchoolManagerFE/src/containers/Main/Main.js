import React from 'react';
import {Route, Switch} from 'react-router-dom';
import AuthRoute from '../../hoc/AuthRoute/AuthRoute';
import AuthContext from '../../context/auth-context';
import Auth from '../../common/commonAuth';

import Home from '../Home/Home';

import Student from '../Student/Student';
import MyClass from '../Student/MyClass/MyClass';
import AddStudent from '../Student/AddStudent/AddStudent';
import ClassManager from '../Student/ClassManager/ClassManager';

import Assignment from '../Assignment/Assignment';

import Result from '../Result/Result';
import ResultView from '../Result/ResultView/ResultView';
import ResultManager from '../Result/ResultManager/ResultManager';

import Report from '../Report/Report';
import CreateReport from '../Report/CreateReport/CreateReport';

import Admin from '../Admin/Admin';
import Account from '../Admin/Account/Account';
import SchoolYear from '../Admin/SchoolYear/SchoolYear';

const main = () => {
  //TODO: Add AuthRoute for Admin
  return (
    <AuthContext.Consumer>
      {context => Auth.isInRoles(context.user.role, ['Admin']) ? (
        <AuthRoute roles={['Admin']}>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/Admin/Account" component={Account} />
            <Route path="/Admin/SchoolYear" component={SchoolYear} />
            <Route path="/Admin" component={Admin} />
          </Switch>
        </AuthRoute>
      ) : (
        <AuthRoute roles={['Manager', 'Teacher']}>
          <Switch>
            <Route path="/" exact component={Home} />

            <Route path="/Student/MyClass" component={MyClass} />
            <Route path="/Student/AddStudent" render={() => (
              <AuthRoute roles={['Manager']}>
                <AddStudent />
              </AuthRoute>
            )} />
            <Route path="/Student/ClassManager" render={props => (
              <AuthRoute roles={['Manager']}>
                <ClassManager history={{...props.history}}/>
              </AuthRoute>
            )} />
            <Route path="/Student" component={Student} />

            <Route path="/Assignment" render={() => (
              <AuthRoute roles={['Manager']}>
                <Assignment />
              </AuthRoute>
            )} />

            <Route path="/Result/View" component={ResultView} />
            <Route path="/Result/Manage" component={ResultManager} />
            <Route path="/Result" exact component={Result} />

            <Route path="/Conduct" exact render={() => <p>Conduct page</p>} />

            <Route path="/Report/Create" render={() => (
              <AuthRoute roles={['Manager']}>
                <CreateReport />
              </AuthRoute>
            )} />
            <Route path="/Report" exact component={Report} />

            <Route path="" render={() => <p>Not found</p>} />
          </Switch>
        </AuthRoute>
      )}
    </AuthContext.Consumer>
  );
};

export default main;
