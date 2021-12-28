import React, {Component} from 'react';
import {Input, Select, Table} from 'antd';
import styles from './StudentPicker.module.css';

import Fetch from '../../../common/commonFetch';
import Request from '../../../common/commonRequest';
import Params from '../../../common/commonParams';
import StudentPickerContext from '../../../context/studentpicker-context';
import Button from '../../UI/Button/Button';
import Modal from '../../UI/Modal/Modal';
import LoadScreen from '../../UI/LoadScreen/LoadScreen';

const {Option, OptGroup} = Select;

class StudentPicker extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,
    classes: [],
    students: [],
    years: [],
    grades: [],
    filters: {
      year: null,
      gradeID: null,
      classID: null,
    },
    chosenStudent: null,
  }

  tableColumns = [
    {title: 'Class', dataIndex: 'classLabel', width: 75},
    {title: 'Year', dataIndex: 'classYear', width: 75},
    {title: 'Last Name', dataIndex: 'lastName', width: 200, sorter: (a,b) => a.lastName.localeCompare(b.lastName), sortDirections: ['ascend', 'descend']},
    {title: 'First Name', dataIndex: 'firstName', width: 150, sorter: (a,b) => a.firstName.localeCompare(b.firstName), sortDirections: ['ascend', 'descend']},
    {title: 'Gender', dataIndex: 'gender', width: 100, sorter: (a,b) => a.gender.localeCompare(b.gender), sortDirections: ['ascend', 'descend']},
    {title: 'DOB', dataIndex: 'birthdayFormatted', width: 200, sorter: (a, b) => a.birthday.isAfter(b.birthday), sortDirections: ['descend']},
    {title: 'Address', dataIndex: 'address'},
  ];

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

  async fetchYears() {
    let newYears = [];
    await Request.get('/Student/Get', 'cred', response => {
      newYears = response.data.map(c => c.year);
      newYears = newYears.filter((y, index, self) => self.indexOf(y) === index);
      let newFilters = {...this.state.filters}
      newFilters.year = newYears[newYears.length-1];
      this.setState({years: newYears, filters: newFilters});
    });
  }

  filterOnChangeHandler = (event, key) => {
    const value = event ? (event.target ? event.target.value : event) : null;
    this.setState(prevState => {
      let _filters = {...prevState.filters};
      _filters[key] = value;
      if (_filters.gradeID !== this.state.filters.gradeID) {
        _filters.classID = null;
      }
      this.setState({filters: _filters});
      if (key !== 'name')
        this.setState({callUpdate: true, updating: true});
      });
  };

  async componentDidMount() {
    this.setState({chosenStudent: this.props.defaultStudent});
    await Promise.all([this.fetchYears(), Fetch.fetchGrades(this)]);
    await Fetch.fetchStudents(this);
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      await Promise.all([Fetch.fetchStudents(this), this.fetchClasses()]);
      this.setState({updating: false});
    }
  }

  render() {
    return (
      <StudentPickerContext.Consumer>
        {context => (
          !context.isPicking ? null :
            <Modal modalClosed={context.stopPicking}>
              {this.state.loading ? <LoadScreen /> :
                <div className={styles.WizardWrapper}>
                  <h1>Pick a Student</h1>
                  <hr />
                  <div style={{width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center'}}>
                    <span style={{margin: '0 8px 0 0'}}>Name: </span>
                    <Input
                      style={{margin: '0 32px 0 16px', width: '150px'}}
                      className={styles.FilterInput}
                      placeholder="Student name"
                      value={this.state.filters.name}
                      onChange={event => this.filterOnChangeHandler(event, 'name')}
                      onKeyPress={event => {if (event.key === 'Enter') {this.setState({callUpdate: true, updating: true})}}}
                    />
                    <span style={{margin: '0 8px 0 0'}}>Grade: </span>
                    <Select
                      style={{margin: '0 32px 0 16px', width: '150px'}}
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
                    <span style={{margin: '0 8px 0 0'}}>Class: </span>
                    <Select
                      style={{margin: '0 0 0 16px', width: '150px'}}
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
                  <div style={{width: '100%', marginTop: '16px'}}>
                    <div style={{
                      width: '100%',
                      height: 'calc(100vh - 401px)',
                      border: 'thin solid #e8e8e8',
                      borderRadius: '4px'
                    }}>
                      {this.state.updating ? <LoadScreen /> :
                        <div className={styles.FadeWrapper}>
                          <Table
                            dataSource={this.state.students}
                            columns={this.tableColumns}
                            rowSelection={{
                              columnWidth: 50,
                              type: 'radio',
                              selectedRowKeys: [this.state.chosenStudent],
                              onChange: (selectedRowKeys) => {this.setState({chosenStudent: selectedRowKeys[0]})}
                            }}
                            scroll={{x: 1300, y: 'calc(100vh - 441px)'}}
                            pagination={false}
                            size="small"
                            bordered
                          />
                        </div>
                      }
                    </div>
                  </div>
                  <div style={{width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center'}}>
                    <Button color="success" clicked={() => {
                      context.changeStudent(this.state.chosenStudent);
                      context.stopPicking();
                    }}
                  >
                    Confirm
                  </Button>
                  </div>
                </div>
              }
            </Modal>
        )}
      </StudentPickerContext.Consumer>
    );
  }
}

export default StudentPicker;
