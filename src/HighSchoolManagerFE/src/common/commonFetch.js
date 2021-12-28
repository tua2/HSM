import React from 'react';
import moment from 'moment';
import Request from './commonRequest';
import Params from './commonParams';

class CommonFetch {
  static async fetchStudents(component, acceptedFilters) {
    let searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    if (parseInt(component.state.filters.gradeID) === 0)
      searchParams = Params.getSearchParamsFromObj(component.state.filters, ['name'])+"&classID=0";
    await Request.get('/Student/Get?'+searchParams, 'cred', response => {
      let newStudents = response.data.map(_student => {
        let newStudent = {};
        newStudent.key = _student.studentID;
        newStudent.classLabel = (_student.class) ? _student.class.name : <i>None</i>;
        newStudent.classYear = (_student.class) ? _student.class.year : <i>None</i>;
        newStudent.lastName = _student.lastName;
        newStudent.firstName = _student.firstName;
        newStudent.gender = _student.gender;
        newStudent.birthday = moment(_student.birthday, 'YYYY/MM/DD');
        newStudent.birthdayFormatted = newStudent.birthday.format('DD/MM/YYYY');
        newStudent.address = _student.address;
        newStudent.class = _student.class;
        return newStudent;
      });
      component.setState({students: newStudents});
    });
  }

  static async fetchClasses(component, acceptedFilters) {
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    let _classesPromise = await Request.get('/Class/Get?'+searchParams, 'cred');
    let _classes = _classesPromise.data;
    let _formattedClasses = _classesPromise.data.reduce((classesArr, cls) => {
      if (!classesArr[cls.year]) {
        classesArr[cls.year] = [];
      }
      classesArr[cls.year].push(cls);
      return classesArr;
    }, {});
    component.setState({classes: _classes, formattedClasses: _formattedClasses});
  }

  static async fetchGrades(component, acceptedFilters) {
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    await Request.get('/Grade/Get?'+searchParams, 'cred', response => {
      let _grades = response.data;
      component.setState({grades: _grades});
    });
  }

  static async fetchSubjects(component, acceptedFilters) {
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    let subjectsPromise = await Request.get('/Subject/Get?'+searchParams, 'cred');
    let _subjects = subjectsPromise.data;
    component.setState({subjects: _subjects});
  }

  static async fetchYears(component, acceptedFilters) {
    let newYears = [];
    //await Request.get('/Class/Get', 'cred', response => {
      //newYears = response.data.map(c => c.year);
      //newYears = newYears.filter((y, index, self) => self.indexOf(y) === index);
      //let newFilters = {...component.state.filters}
      //newFilters.year = newYears[newYears.length-1];
      //component.setState({years: newYears, filters: newFilters});
    //});
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    await Request.get('/Semester/Get?'+searchParams, 'cred', response => {
      newYears = response.data.map(s => s.year);
      newYears = newYears.filter((y, index, self) => self.indexOf(y) === index);
      let newFilters = {...component.state.filters}
      newFilters.year = newYears[newYears.length-1];
      component.setState({years: newYears, filters: newFilters});
    });
  }

  static async fetchSemesters(component, acceptedFilters) {
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    let semestersPromise = await Request.get('/Semester/Get?'+searchParams, 'cred');
    let _semesters = semestersPromise.data;
    component.setState({semesters: _semesters});
    //if (_semesters.length > 0)
      //this.setState({year: _semesters.reverse()[0].year});
  }

  static async fetchTeachers(component, acceptedFilters) {
    // Full teacher list
    let teachersPromise = await Request.get('/Teacher/Get', 'cred');
    // Teacher filtered by name
    let _teachers = teachersPromise.data;
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    let filteredTeachersPromise = await Request.get('/Teacher/Get?'+searchParams, 'cred');
    let _filteredTeachers = filteredTeachersPromise.data.map(t => t.teacherID);

    component.setState({teachers: _teachers, filteredTeachers: _filteredTeachers});
  }

  static async fetchTeachingAssignments(component, acceptedFilters) {
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    let teachingAssignmentPromise = await Request.get('/TeachingAssignment/Get?'+searchParams, 'cred');
    let _teachingAssignments = teachingAssignmentPromise.data.filter(tA => component.state.filteredTeachers.includes(tA.teacherID));
    _teachingAssignments = _teachingAssignments.map(tA => {
      let newTA = JSON.parse(JSON.stringify(tA));
      newTA.key = tA.teachingAssignmentID;
      return newTA;
    });
    component.setState({teachingAssignments: _teachingAssignments});
  }

  static async fetchMonthlyReport(component, acceptedFilters) {
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    let _reportPromise = await Request.get('/Report/MonthlyReport?'+searchParams, 'cred');
    let _report = _reportPromise.data;
    _report = _report.map(rRow => {return {...rRow, key: rRow.student.studentID}});
    component.setState({report: _report});
  }

  static async fetchSemesterReport(component, acceptedFilters) {
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    let _reportPromise = await Request.get('/Report/SemesterReport?'+searchParams, 'cred');
    let _report = _reportPromise.data;
    _report = _report.map(rRow => {return {...rRow, key: rRow.student.studentID}});
    component.setState({report: _report});
  }

  static async fetchPerformanceReport(component, acceptedFilters) {
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, acceptedFilters);
    let _reportPromise = await Request.get('/Report/PerformanceReport?'+searchParams, 'cred');
    let _report = _reportPromise.data;
    _report = _report.map(rRow => {return {...rRow, key: rRow.aClass.classID}});
    component.setState({report: _report});
  }

  static async fetchUsers(component, acceptedFilters) {
    const searchParams = Params.getSearchParamsFromObj(component.state.filters, Object.keys(acceptedFilters));
    let teachersPromise = await Request.get('/Teacher/Get?'+searchParams, 'cred');
    let _teacherIDs = teachersPromise.data.map(t => t.teacherID);

    let usersPromise = await Request.get('/Account/AllUsers', 'cred');
    let _users = usersPromise.data.filter(u => _teacherIDs.includes(u.teacher.teacherID)).map(u => {return {...u, key: u.userName}});

    component.setState({users: _users});
  }

  static async fetchRoles(component, acceptedFilters) {
    //filters
    let rolesPromise = await Request.get('/Administrator/GetRoles', 'cred');
    let _roles = rolesPromise.data.map(r => {return {...r, key: r.name}});
    component.setState({roles: _roles});
  }

}

export default CommonFetch;
