/**
* Funds.js
*
* @description :: this is the model to hold all fo the day aggregations.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
      groupId: {
        type: 'string',
        required: true
      },
      name: {
        type: 'string',
        required: true
      },
      description: {
        type: 'string',
        required: false
      },
      isWebEnabled: {
        type: 'boolean',
        required: true
      },
      isSearchable: {
        type: 'boolean',
        required: true
      }
    }
};
