/**
 * ProgressController
 *
 * @description :: Server-side logic for managing progresses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  fillGroupTypes: function(req,res){
		try{
			f1api.getGroupTypes(function(data){
				if(data.groupTypes){
					GroupType.destroy({});
					console.log("creating data,", data.groupTypes);
					data.groupTypes.groupType.forEach(function(groupItem){
						console.log("creating / searching for, ", groupItem);

						var toCreate = {};
						toCreate.groupId = groupItem["@id"];
						toCreate.name = groupItem.name;
						toCreate.description = groupItem.description;
						toCreate.isWebEnabled = groupItem.isWebEnabled;
						toCreate.isSearchable = groupItem.isSearchable;

						GroupType.create(toCreate).exec(function createCB(err,item){
							console.log("created, " , item);
								if(err){
									console.log(err);
								}
						});
					});
				}
				res.json({status:"filling"});
			});

		} catch (e) {
			res.json({error: "Parse error", errorObj:e});
		}
  }
};
