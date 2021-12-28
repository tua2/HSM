import React from 'react';

const studentContext = React.createContext({
  isPicking: false,
  studentID: null,
  changeStudent: (studentID) => {},
});

export default studentContext;
