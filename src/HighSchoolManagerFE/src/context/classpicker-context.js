import React from 'react';

const classContext = React.createContext({
  isPicking: false,
  classID: null,
  changeClass: (classID) => {},
});

export default classContext;
