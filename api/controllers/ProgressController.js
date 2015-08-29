/**
 * ProgressController
 *
 * @description :: Server-side logic for managing progresses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getProgress: function(req,res){
		F1service.findOrCreate({name:'paidinfull'}).exec(function createCB(err, created){
			res.json(created);
		});
	},
	setProgress: function(req,res){
		F1service.findOrCreate({name:'paidinfull'}).exec(function createCB(err, created){
		  created.value = req.param("value");
			created.save(function(error){
				console.log(created);
				res.json(created);
			});
		});
	},
	testService: function(req,res){
		f1api.sayHello(function(data){
			res.json(data);
		});
	}
};
