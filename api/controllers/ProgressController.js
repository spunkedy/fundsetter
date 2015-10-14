/**
 * ProgressController
 *
 * @description :: Server-side logic for managing progresses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getProgress: function(req,res){
		f1api.getTotalPaidInFull(18000000,function(data){
			res.json(data);
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
	getDays: function(req,res){
		console.log(Funds.count());
		Funds.find({}).exec(function findCB(err, found){
		  res.json(found);
		});
	},
	pushDay: function(req,res){
		Funds.create({date: "12/12/2015", amount: 333.33}).exec(function createCB(err, created){
		  console.log('Created user with date ' + created.date);

			res.json(created);
		});

	}

};
