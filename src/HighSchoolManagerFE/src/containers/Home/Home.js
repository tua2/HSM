import React, {Component, Fragment} from 'react';
import {Link} from 'react-router-dom';
import styles from './Home.module.css';

import Request from '../../common/commonRequest';
import Auth from '../../common/commonAuth';
import AuthContext from '../../context/auth-context';
import LoadScreen from '../../components/UI/LoadScreen/LoadScreen';

class Home extends Component {
  state = {
    loading: true,
    cardList: [],
  }

  getCardButton(link, title, icon, info) {
    return (
      <Link to={link} key={link} style={{display: 'flex'}}>
        <div className={styles.CardButton}>
          <div>
            <div className={styles.CardIcon}>
              <i className={"fas fa-fw "+icon}></i>
            </div>
            <div className={styles.CardInfo}>
              <Fragment>
                <span className={styles.CardTitle}>
                  <h2>{title}</h2>
                </span>
                <span className={styles.CardDesc}>
                  {info}
                </span>
              </Fragment>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  async componentDidMount() {
    let cardList = [];
    if (Auth.isInRoles(this.context.user.role, ['Manager', 'Teacher'])) {
      // MY CLASS
      let classesPromise = await Request.get('/Class/Get?headTeacherID='+this.context.teacher.teacherID, 'cred');
      let _classes = classesPromise.data;
      if (_classes.length > 0) {
        let _class = _classes[0];
        let studentsPromise = await Request.get('/Student/Get?classID='+_class.classID, 'cred');
        let _classSize = studentsPromise.data.length;
        cardList.push(this.getCardButton(
          '/Student/MyClass', 'My Class', 'fa-address-book', (
            <Fragment>
              <p>View your class student list, assigned teachers</p>
              <p>Class: <b>{_class.name}</b></p>
              <p>Students: <b>{_classSize}</b></p>
            </Fragment>
          )
        ));
      }
      // VIEW RESULTS & VIEW STUDENTS
      cardList.push(this.getCardButton(
        '/Student', 'View Students', 'fa-users', (
          <Fragment>
            <p>Look up student information. Using filters to yield the best result</p>
          </Fragment>
        )
      ));
      cardList.push(this.getCardButton(
        '/Result/View', 'View Results', 'fa-graduation-cap', (
          <Fragment>
            <p>View student results in a year. View in a form of dynamic table</p>
          </Fragment>
        )
      ));
      // MANAGE RESULTS
      let teachingAssignmentsPromise = await Request.get('/TeachingAssignment/Get?teacherID='+this.context.teacher.teacherID, 'cred');
      let _teachingAssignments = teachingAssignmentsPromise.data;
      if (_teachingAssignments.length > 0) {
        const _assignedClasses = _teachingAssignments.map(tA => tA.class.name).filter((c, index, self) => self.indexOf(c) === index);
        const _assignedSubjects = _teachingAssignments.map(tA => tA.subject.name).filter((s, index, self) => self.indexOf(s) === index);
        cardList.push(this.getCardButton(
          '/Result/Manage', 'Manage Results', 'fa-laptop', (
            <Fragment>
              <p>View, add, edit marks for students of classes you’re teaching</p>
              <p>Subjects: <b>{_assignedSubjects.join(', ')}</b></p>
              <p>Classes: <b>{_assignedClasses.join(', ')}</b></p>
            </Fragment>
          )
        ));
      }
      // CREATE REPORTS
      if (Auth.isInRoles(this.context.user.role, ['Manager'])) {
        cardList.push(this.getCardButton(
          '/Report/Create', 'Create Reports', 'fa-chart-bar', (
            <Fragment>
              <p>Create new summary reports of students, classes and school</p>
            </Fragment>
          )
        ));
      }
    }
    // MANAGE ACCOUNTS
    if (Auth.isInRoles(this.context.user.role, ['Admin'])) {
      cardList.push(this.getCardButton(
        '/Admin/Account', 'Manage Accounts', 'fa-users-cog', (
          <Fragment>
            <p>View, add, edit accounts for teachers</p>
          </Fragment>
        )
      ));
    }
    // Finalize
    this.setState({cardList: cardList});
    this.setState({loading: false});
  }

  render() {
    return (
      <Fragment>
        {this.state.loading ? (
          <LoadScreen style={{position: 'fixed', top: '64px', left: '225px'}} />
        ) : (
        <div className={[styles.Home, styles.FadeWrapper].join(' ')}>
          <h1>Welcome back, {this.context.teacher.name}</h1>
          <p>High School Management System for <b>Sai Gon High</b></p>
          <div className={styles.CardContainer}>
            {this.state.cardList}
          </div>
        </div>
        )}
      </Fragment>
    );
  }
}

Home.contextType = AuthContext;
export default Home;
