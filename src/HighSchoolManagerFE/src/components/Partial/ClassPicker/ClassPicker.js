import React, {Component} from 'react';
import {Select, Table} from 'antd';
import styles from './ClassPicker.module.css';

import Fetch from '../../../common/commonFetch';
import Request from '../../../common/commonRequest';
import Params from '../../../common/commonParams';
import ClassPickerContext from '../../../context/classpicker-context';
import Button from '../../UI/Button/Button';
import Modal from '../../UI/Modal/Modal';
import LoadScreen from '../../UI/LoadScreen/LoadScreen';

const {Option} = Select;

class ClassPicker extends Component {
  state = {
    loading: true,
    callUpdate: false,
    updating: false,
    classes: [],
    years: [],
    grades: [],
    filters: {
      year: null,
      gradeID: null,
    },
    chosenClass: null,
  }

  tableColumns = [
    {title: 'Name', dataIndex: 'name', width: 150, sorter: (a,b) => a.name.localeCompare(b.name), sortDirections: ['ascend', 'descend']},
    {
      title: 'Year', render: (text, record, index) => (record.year)+"-"+(record.year-1+2),
      width: 150, sorter: (a,b) => a.year - b.year, sortDirections: ['ascend', 'descend']},
    {
      title: 'Grade', render: (text, record, index) => record.grade.name,
      width: 150, sorter: (a,b) => a.grade.name.localeCompare(b.grade.name), sortDirections: ['ascend', 'descend']},
    {title: 'Size', dataIndex: 'classSize', width: 75, sorter: (a,b) => a.classSize - b.classSize, sortDirections: ['ascend', 'descend']},
    {
      title: 'Head Teacher',
      render: (text, record, index) => record.headTeacher ? record.headTeacher.name : <i>None</i>,
      width: 250,
    },
  ];

  async fetchClasses() {
    this.setState({classes: []});
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    let newClasses = [
      {
        classID: 0,
        name: "No class",
        year: currentYear,
        gradeID: 0,
        grade: {"gradeID": 0, "name": "None"},
        headTeacherID: null,
        headTeacher: null,
      },
    ];
    const searchParams = Params.getSearchParamsFromObj(this.state.filters, ['year', 'gradeID']);
    let classesPromise = await Request.get('/Class/Get?'+searchParams, 'cred');
    newClasses = [...newClasses, ...classesPromise.data];
    for (let c of newClasses) {
      c.key = c.classID;
      await Request.get('/Student/Get?classid='+c.classID, 'cred', response => {
        c.classSize = response.data.length;
      });
    };
    this.setState({classes: newClasses, updating: false});
  }

  async fetchYears() {
    let newYears = [];
    await Request.get('/Class/Get', 'cred', response => {
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
      if (_filters.year !== prevState.filters.year) {
        _filters.gradeID = null;
      }
      return {filters: _filters, callUpdate: true, updating: true};
    });
  };

  async componentDidMount() {
    this.setState({chosenClass: this.props.defaultClass});
    await Promise.all([this.fetchYears(), Fetch.fetchGrades(this)]);
    await this.fetchClasses();
    this.setState({loading: false});
  }

  async componentDidUpdate() {
    if (this.state.callUpdate) {
      this.setState({callUpdate: false});
      await this.fetchClasses();
    }
  }

  render() {
    return (
      <ClassPickerContext.Consumer>
        {context => (
          !context.isPicking ? null :
            <Modal modalClosed={context.stopPicking}>
              {this.state.loading ? <LoadScreen /> :
                <div className={styles.WizardWrapper}>
                  <h1>Pick a Class</h1>
                  <hr />
                  <div style={{width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center'}}>
                    <span style={{margin: '0 8px 0 0'}}>Year:</span>
                    <Select
                      style={{margin: '0 32px 0 16px', width: '150px'}}
                      value={this.state.filters.year}
                      onChange={e => this.filterOnChangeHandler(e, 'year')}
                    >
                      <Option value={null}>All</Option>
                      {this.state.years.map(y => (
                        <Option key={y} value={y}>{y+"-"+(y-1+2)}</Option>
                      ))}
                    </Select>
                    <span style={{margin: '0 8px 0 0'}}>Grade:</span>
                    <Select
                      style={{margin: '0 0 0 16px', width: '150px'}}
                      value={this.state.filters.gradeID}
                      onChange={e => this.filterOnChangeHandler(e, 'gradeID')}
                    >
                      <Option value={null}>All</Option>
                      {this.state.grades.map(g => (
                        <Option key={g.gradeID} value={g.gradeID}>{g.name}</Option>
                      ))}
                      {/*this.state.grades.map(g => {
                        return <Option key={g.gradeID} value={g.gradeID}>{g.name}</Option>
                      })*/}
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
                        <div className={styles.WizardWrapper}>
                          <Table
                            dataSource={this.state.classes}
                            columns={this.tableColumns}
                            rowSelection={{
                              columnWidth: 50,
                              type: 'radio',
                              selectedRowKeys: [this.state.chosenClass],
                              onChange: (selectedRowKeys) => {this.setState({chosenClass: selectedRowKeys[0]})}
                            }}
                            scroll={{y: 'calc(100vh - 441px)'}}
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
                      context.changeClass(this.state.chosenClass);
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
      </ClassPickerContext.Consumer>
    );
  }
}

export default ClassPicker;
