var fs     = require('fs'),
    d3     = require('d3'),
    _      = require('underscore'),
    moment = require('moment');


var csv = fs.readFileSync('../join_result/bike_data_hexed.csv').toString(),
		json = d3.csv.parse(csv);


var cases = {};
json.forEach(function(d){
	cases[d['_case']] = d;
})

var lookup_json_string = JSON.stringify(cases)

fs.writeFileSync('case-lookup-table.json', lookup_json_string);
