SODEXO web scraper
================

You have to use nodejs version 0.10.x

Download the dependencies:
	
	npm install

Install MongoDB: 

	sudo apt-get install mongodb

# How to debug:
	
	node-inspector
	node --debug-brk crawler.js

Then, go to http://localhost:8080/debug?port=5858

# How to run:
	
	node crawler.js

# How to export

## To CSV: 

	cd output
	mongoexport --db sodexo --collection entities --csv --fieldFile entities_fields.txt --out entities.csv

## To Database dump:

to generate the dump:

	mongodump -d sodexo -o output

to restore:
	
	mongorestore sodexo

## Usefull Mongodb commands:

	show dbs
	use entities // 	switch between databases.
	show collections
	
	db.entities.findOne() // 	shows the first document saved on database
	db.entities.find().limit(10) // 	limits the query results
	db.entities.find({}, {idEstabelecimentoBusca : 1}).limit(10) // 	shows only the specified fields
	db.entities.find({"uf": "SP"}).count() // count all entities from uf = sp
	
	db.entities.distinct("idEstabelecimentoBusca") 
	
	Object.keys(db.entities.findOne()) // shows the fields of a document.