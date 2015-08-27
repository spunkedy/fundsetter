/**
 * ProgressController
 *
 * @description :: Server-side logic for managing progresses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getProgress: function(req,res){
		res.json({value: 33999});
	}
};
