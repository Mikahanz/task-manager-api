const { Promise } = require('mongoose');

module.exports = {
  setApiKey() {},
  send() {
    return new Promise((resolve, reject) => {
      //reject();
      resolve();
    });
  },
};
