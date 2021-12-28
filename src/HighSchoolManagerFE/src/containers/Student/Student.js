import React, {Component, Fragment} from 'react';
import {Link, Route} from 'react-router-dom';
import {Input, Select, Table} from 'antd';
import styles from './Student.module.css';

import AuthContext from '../../context/auth-context';
import Fetch from '../../common/commonFetch';
import Request from '../../common/commonRequest';
import Params from '../../common/commonParams';
import Auth from '../../common/commonAuth';
import LoadScreen from '../../components/UI/LoadScreen/LoadScreen';
import Card from '../../components/UI/Card/Card';
import EditStudentModal from '../../components/Partial/EditStudent/EditStudent';

const {Option, OptGroup} = Select;

class Student extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,
    students: [],
    grades: [],
    classes: [],
    filters: {
      name: '',
      gradeID: null,
      classID: null,
    },
    tableColumns: [
      {title: 'Class', dataIndex: 'classLabel', width: 75},
      {title: 'Year', dataIndex: 'classYear', width: 75},
      {title: 'Last Name', dataIndex: 'lastName', width: 200, sorter: (a,b) => a.lastName.localeCompare(b.lastName), sortDirections: ['ascend', 'descend']},
      {title: 'First Name', dataIndex: 'firstName', width: 150, sorter: (a,b) => a.firstName.localeCompare(b.firstName), sortDirections: ['ascend', 'descend']},
      {title: 'Gender', dataIndex: 'gender', width: 100, sorter: (a,b) => a.gender.localeCompare(b.gender), sortDirections: ['ascend', 'descend']},
      {title: 'DOB', dataIndex: 'birthdayFormatted', width: 200, sorter: (a, b) => a.birthday.isAfter(b.birthday), sortDirections: ['descend']},
      {title: 'Address', dataIndex: 'address'},
      {title: 'Actions', width: 80, fixed: 'right', render: (text, record, index) => {
        return (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Link to={`/Student/Edit/${record.key}`}><b>Edit</b></Link>
          </div>
        );
      }},
    ],
  };

  async componentDidMount() {
    await Promise.all([Fetch.fetchStudents(this), Fetch.fetchGrades(this), this.fetchClasses()]);
    this.setState({loading: false});
    if (Auth.isInRoles(this.context.user.role, ["Manager"]) === false)
      this.setState(prevState => {return {tableColumns: prevState.tableColumns.filter(tC => tC.title !== "Actions")}});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      await Promise.all([Fetch.fetchStudents(this), this.fetchClasses()]);
      this.setState({updating: false});
    }
  }

  async fetchClasses() {
    const searchParams = Params.getSearchParamsFromObj(this.state.filters, ['gradeID']);
    await Request.get('/Class/Get?'+searchParams, 'cred', response => {
      let _classes = response.data.reduce((classesArr, cls) => {
        if (!classesArr[cls.year]) {
          classesArr[cls.year] = [];
        }
        classesArr[cls.year].push(cls);
        return classesArr;
      }, {});
      this.setState({classes: _classes});
    });
  }

  filterOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    let _filters = {...this.state.filters};
    _filters[key] = value;
    if (_filters.gradeID !== this.state.filters.gradeID) {
      _filters.classID = null;
    }
    this.setState({filters: _filters});
    if (key !== 'name')
      this.setState({callUpdate: true, updating: true});
  };

  finishEditing = () => {
    this.props.history.push('/Student');
    this.setState({callUpdate: true, updating: true});
  }

  render() {
    return (
      <Fragment>
        <Route path="/Student/Edit/:id" render={(props) => (
          <EditStudentModal studentID={parseInt(props.match.params.id)} finish={this.finishEditing} history={{...this.props.history}} />
        )} />
        {this.state.loading ? (
          <LoadScreen style={{position: 'fixed', top: '64px', left: '225px'}} />
        ) : (
          <div className={[styles.Student, styles.FadeWrapper].join(' ')}>
            {Auth.isInRoles(this.context.user.role, ['Manager']) ? (
              <Fragment>
                <h1>Manage Students</h1>
                <p>Look up and edit students information</p>
              </Fragment>
            ) : (
              <Fragment>
                <h1>Students</h1>
                <p>Look up students information</p>
              </Fragment>
            )}
            <Card style={{height: 'calc(100vh - 232px)', flexDirection: 'column'}} >
              <div className={styles.FilterWrapper}>
                <div>
                  <span>Name: </span>
                  <Input
                    className={styles.FilterInput}
                    placeholder="Student name"
                    value={this.state.filters.name}
                    onChange={event => this.filterOnChangeHandler(event, 'name')}
                    onKeyPress={event => {if (event.key === 'Enter') {this.setState({callUpdate: true, updating: true})}}}
                  />
                </div>
                <div>
                  <span>Grade: </span>
                  <Select
                    className={styles.FilterSelect}
                    placeholder="Select grade..."
                    value={this.state.filters.gradeID}
                    onChange={event => this.filterOnChangeHandler(event, 'gradeID')}
                  >
                    <Option value={null}>All</Option>
                    <Option value="0">None</Option>
                    {this.state.grades.map(e => {
                      return (
                        <Option key={e.gradeID} value={e.gradeID}>
                          {e.name}
                        </Option>
                      );
                    })}
                  </Select>
                </div>
                <div>
                  <span>Class: </span>
                  <Select
                    className={styles.FilterSelect}
                    placeholder="Select class..."
                    value={this.state.filters.classID}
                    onChange={event => this.filterOnChangeHandler(event, 'classID')}
                    disabled={!this.state.filters.gradeID || parseInt(this.state.filters.gradeID) === 0}
                  >
                    <Option value={null}>All</Option>
                    {Object.keys(this.state.classes).reverse().map(year => (
                      <OptGroup key={year} value={"disabled"+year} title={year} disabled>
                        {this.state.classes[year].map(c => (
                          <Option key={c.classID} value={c.classID}>
                            {c.name}
                          </Option>
                        ))}
                      </OptGroup>
                    ))}
                  </Select>
                </div>
              </div>
              <div className={styles.TableWrapper}>
                <div style={{
                  height: 'calc(100vh - 360px)',
                  border: 'thin solid #e8e8e8',
                  borderRadius: '4px'
                }}>
                  {this.state.updating ? <LoadScreen /> :
                    <div className={styles.FadeWrapper}>
                      <Table columns={this.state.tableColumns} dataSource={this.state.students} scroll={{x: 1300, y: 'calc(100vh - 417px)'}} pagination={false} bordered />
                    </div>
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

Student.contextType = AuthContext;
export default Student;
