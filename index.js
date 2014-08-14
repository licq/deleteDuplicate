var Db = require('mongodb').Db,
  MongoClient = require('mongodb').MongoClient,
  Server = require('mongodb').Server,
  _ = require('lodash'),
  async = require('async');

// Set up the connection to the local db
var mongoclient = new MongoClient(new Server("localhost", 27017), {native_parser: true});

// Open the connection to the server
mongoclient.open(function (err, mongoclient) {

  // Get the first db and do an update document on it
  var db = mongoclient.db("compass-dev");
  db.collection('resumes').find({}, {_id: 1, name: 1, mail: 1}).toArray(function (err, results) {
    db.collection('mails').find({}, {_id: 1, subject: 1}).toArray(function (err, resultsInMails) {
      console.log('resume length', results.length);
      console.log('mail length', resultsInMails.length);
      var toDelete = _.filter(results, function (r) {
        return _.every(resultsInMails, function (rr) {
          return r.mail && rr._id.toString() !== r.mail.toString();
        });
      });
      console.log(toDelete.length);
      async.eachSeries(toDelete, function (item, callback) {
        db.collection('resumes').remove({_id: item._id}, callback);
      }, function(errors){
        console.log('finished with',errors);
      });
    });
  });
});