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

var Mongo = require('./mongo.js');

var request = require('request');
var fs = require('fs');

var citiesUrl = "http://www.sodexoclub.com.br/estabelecimentos/busca/busca_localizacaocidade"
var detailsUrl = "http://www.sodexoclub.com.br/estabelecimentos/busca/search_location";

//var estados_original = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"]
var estados = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "TO"]


function makeRequest(url, params, callback) 
{
    var headerParams = {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        url: url,
        body: params
    };

    var responseFunction = function(error, response, body) 
    {
        callback(body);
    };

    request.post(headerParams, responseFunction);
}

function getCities(uf)
{
	var citiesCallback = function(cities)
	{
		var parsedCities = JSON.parse(cities);
		iterateCities(parsedCities, uf);
	}

	makeRequest(citiesUrl, "produto=CARTÃO REFEICAO|9&uf=" + uf, citiesCallback)
}

function iterateCities(cities, uf)
{
	for (var i = 0; i < cities.length; i++) {		
		var city = cities[i].cidade;
		var baseParams = "produto=CARTÃO REFEICAO|9&uf=" + uf + "&cidade=" + city + "&bairro=";
		getDataFromCity(baseParams, city);
	};
}

var getDataFromCity = function(baseParams, city)
{
	var cityName = city;
	
	var saveResult = function(result, city) 
	{
		var parsedResult = JSON.parse(result);
		Mongo.save_entity(parsedResult);
		//saveResultJson(parsedResult, cityName + ".json");
	};

	makeRequest(detailsUrl, baseParams, saveResult);
}

function saveResultJson(json, fileName) 
{
	fs.writeFile("./result/" + fileName, JSON.stringify(json, null, 4), function (err) {
		console.log('Arquivo: ', fileName, ' salvo com sucesso');
	});
}

function getAll()
{
	for (var i = 0; i < estados.length; i++) {
		getCities(estados[i])
	};
}


function initialize() 
{
      var callback = function () {
      		//getCities("SP")
      		getAll();
      }

      Mongo.initialize_db(callback)
}

initialize();