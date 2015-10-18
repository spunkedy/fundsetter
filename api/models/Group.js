/**
* Funds.js
*
* @description :: this is the model to hold all fo the day aggregations.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
      name: {
        type: 'string',
        required: true
      },
      description: {
        type: 'string',
        required: false
      },
      link:{
        type:'string',
        required: true
      }
    }
};
