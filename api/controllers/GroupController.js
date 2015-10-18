/**
 * ProgressController
 *
 * @description :: Server-side logic for managing progresses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	fillData: function(req,res){
		res.json({});
	},
	search: function(req,res){
    var retData = [];
    var searches = [];
    searches.push({ name: { 'contains': req.param("searchFor") }});
    searches.push({ description : {'contains': req.param("searchFor")}});

    async.each(searches, function(item, callback) {
        Group.find(item).exec(function findCB(err, found){
          //console.log("found Items");
          retData = retData.concat(found);
          //console.log(found);
          callback();
    		});
      }, function(){
          //dedupe data
          var deduped = _.uniq(retData, function(x){
              return x.name;
          });
          res.json(deduped);
    });
	},
  fillGroups: function(req,res){
		try{
      GroupType.find({isSearchable: true,isWebEnabled: true}).exec( function ( err, items){
        //console.log(items);
        Group.destroy({});
        items.forEach(function(item){
            f1api.getGroup(item.groupId,function(groupItem){
              //console.log(groupItem);
              if(groupItem.groups){
                groupItem.groups.group.forEach(function(singleGroup){
                  //console.log(singleGroup);
                  var toCreate = {};
                  toCreate.name = singleGroup.name;
                  toCreate.description = singleGroup.description;
                  toCreate.link = "https://cbcsattx.infellowship.com/GroupSearch/ShowGroup/" + singleGroup["@id"];

                  Group.create(toCreate).exec(function createCB(err,item){
                    console.log("created, " , item);
                      if(err){
                        console.log(err);
                      }
                  });
                });
              }

            });
        });
        res.json({status: "filling"});
      });
		} catch (e) {
			res.json({error: "Parse error", errorObj:e});
		}
  }
};


// f1api.getGroupTypes(function(data){
//
//   if(data.groupTypes){
//     GroupType.destroy({});
//     //console.log("creating data,", data.groupTypes);
//     data.groupTypes.groupType.forEach(function(groupItem){
//       //console.log("creating / searching for, ", groupItem);
//
//       var toCreate = {};
//       toCreate.name = groupItem.name;
//       toCreate.description = groupItem.description;
//       toCreate.isWebEnabled = groupItem.isWebEnabled;
//       toCreate.isSearchable = groupItem.isSearchable;
//
//       GroupType.create(toCreate).exec(function createCB(err,item){
//         console.log("created, " , item);
//           if(err){
//             console.log(err);
//           }
//       });
//     });
//   }
//   GroupType.find().exec(function(err,items){
//     res.json(items);
//   });
// });
