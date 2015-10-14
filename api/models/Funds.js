/**
* Funds.js
*
* @description :: this is the model to hold all fo the day aggregations.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
      // e.g., "Polly"
      date: {
        type: 'string',
        required: true
      },

      // e.g., 3.26
      amount: {
        type: 'float',
        required: true
      }
    }
};
