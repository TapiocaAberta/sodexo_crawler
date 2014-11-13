// Copyleft 2014 Paulo Luan <https://github.com/transparenciasjc>
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// db.entities.ensureIndex( { "idEstabelecimentoBusca": 1 }, { unique: true , dropDups: true} )

var mongoProcessing = require('mongo-cursor-processing')
var fs = require('fs');

var database;
var databaseName = "sodexo";
var collection_name = "entities";

//--------------------------------------------
//    Common functions
//--------------------------------------------
exports.initialize_db = function(callback) {
      var MongoClient = require("mongodb").MongoClient;
      var databaseFullName = "mongodb://localhost:27017/" + databaseName;      

      MongoClient.connect(databaseFullName, function (err, db) {
            if (err) {
                  return console.dir(err);
            }

            database = db

            callback();
      });    
}

function save_to_db(json, collection_name) {
      if(json) 
      {
            // Connect to the db
            var collection = database.collection(collection_name);
            collection.insert(json, function (err, inserted) {
                  if (err) {
                        //console.log(err);
                  } else {
                        console.log("salvo com sucesso!")
                        json = null;
                  }

                  collection = null;
            });
      }
}

exports.delete_from_db = function (json, collection_name) {
      var collection = database.collection(collection_name);

      collection.remove(json, function (error, inserted) {
            if (error) {
                  console.log(error);
            } else {
                  console.log("removido: ", json);      
            }
      });
}



//--------------------------------------------
//    Specific functions
//--------------------------------------------
exports.save_entity = function (entity) {
      save_to_db(entity, "entities");
}

exports.save_city = function (city) {
      save_to_db(city, "cities");
}

exports.removeCity = function (city) {
      this.delete_from_db(city, "cities");
}

exports.get_all_cities = function(callback) {
      var collection = database.collection('cities');

      collection.find({}, function(err, result_cursor) {
            result_cursor.toArray(function(cursor_err, all_cities) {            
                  callback(all_cities);   
            });
      });
}



//============================================================
//    CSV functions
//============================================================
exports.exportToCSV = function() {
      var processItem = function(entity_doc, done){
            var convertedCsv = convertToCSV([entity_doc]); 
            appendTextToCsv(convertedCsv, entity_doc, done)
      }

      var entities_collection = database.collection('entities');

      entities_collection.find({}, function(err, result_cursor) {
            mongoProcessing(result_cursor, processItem, 1, function (err) {
                  if (err) {
                        console.error('on noes, an error', err)
                        process.exit(1)
                  }
            })
      });

}

function convertToCSV(objArray) {
      var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
      var str = '';

      for (var i = 0; i < array.length; i++) {
          var line = '';
          str += '\r\n';

          for (var index in array[i]) {
              if (line != '') line += '|'

              line += array[i][index];
          }

          str += line;
      }

      return str;
}

function appendTextToCsv(text, entity_doc, done) {
      if(entity_doc.uf)
      {
            var csv_path = 'output/' + entity_doc.uf + '.txt';

            fs.exists(csv_path, function (exists) {
                  if(!exists) 
                  {
                        createColumnNames(csv_path, entity_doc, function(){
                              appendText(csv_path, text, done)
                        });
                  } 
                  else 
                  {
                        appendText(csv_path, text, done)
                  }
            });
      } 
      else 
      {
            done();
      }
}

var appendText = function(csv_path, text, done)
{
      fs.appendFile(csv_path, text, function (err) {
            if(err) {
                  console.log(err)
            }

            console.log(csv_path)

            done();
      });            
}

function createColumnNames(csvPath, entity_doc, callback) {
      var entity_keys = Object.keys(entity_doc)
      var text = entity_keys
      return appendText(csvPath, text, callback);
}

