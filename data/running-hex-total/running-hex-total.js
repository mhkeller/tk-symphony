var fs     = require('fs'),
    dsv    = require('dsv'),
    _      = require('underscore'),
    moment = require('moment');


var csv = fs.readFileSync('../join_result/bike_data_hexed.csv').toString(),
		json = dsv.csv.parse(csv);

// Create a dictionary whose keys are hex_ids
// And create a dictionary of times, which will be:
/*

	'YYYY-MM-DD': [
		{
			hex_id: <hex_id>,
			count: <numb>
		},
		{
			hex_id: <hex_id>,
			count: <numb>
		}
	]

*/

var good_hexes = ["h0.038","h0.049","h0.038","h0.029","h0.026","h0.029","h0.036","h0.023","h0.012","h0.012","h0.023","h0.028","h0.014","h0.005","h0.015","h0.040","h0.029","h0.021","h0.021","h0.029","h0.036","h0.032","h0.033","h0.062","h0.044","h0.072","h0.076","h0.038","h0.036","h0.028","h0.038","h0.037","h0.071","h0.066","h0.070","h0.068","h0.058","h0.057","h0.058","h0.063","h0.042","h0.042","h0.046","h0.052","h0.054","h0.046"]
var hex_hits = {},
		times    = {};


function isAGoodHex(hex_id){

	// if (hex_id != ''){
	// 	return true
	// }else{
	// 	return false
	// }
	if (_.indexOf(good_hexes, hex_id) != -1){
		console.log('good')
		return true
	}else{
		// console.log('bad')
		return false
	}

}

function incrementHexId(hex_id){
	// If it has encountered this hex already, increment its hit counter by one
	// If it hasn't encountered this hex yet, create it and start if off at one
	if (hex_hits[hex_id] != undefined){
		hex_hits[hex_id]++;
	}else{
		hex_hits[hex_id] = 1;
	}
	return hex_hits[hex_id];
}

function formatDate(YYYYMMDD, hour, minute){
	var moment_time = moment(YYYYMMDD + '-' + hour + '-' + minute, 'YYYYMMDD-h-m')
			time_key    = moment_time.format('YYYY-MM-DD');
			// time_key    = moment_time.format('X');
			// time_key    = moment_time.format('YYYY-MM-DD_HH-mm');

	return time_key
}

function createTimeArray(time_key){
	// If it has encountered this time already, do nothing
	// If it hasn't encountered this time yet, create an empty array
	if (times[time_key] == undefined){
		times[time_key] = [];
	}

}

function createTimeObj(hex_id, case_id){
	var obj = {
		hex_id: hex_id,
		count: hex_hits[hex_id],
		case_id: case_id
	};
	return obj;
}

// Create a time key column and then sort by that
json.forEach(function(row){
	var time_key = formatDate(row.simpledate, row.hour, row.minute)
	row.time_key = time_key;
})

_.sortBy(json, function(d){ return d.time_key });

// Iterate through the points
json.forEach(function(row){
	// Not all of them were properly geocoded and so not all have a hex_id
	var isAGoodHexVal = isAGoodHex(row.hex_id);

	if (isAGoodHexVal){
		var current_hex_hit_val = incrementHexId(row.hex_id),
			  time_key            = row.time_key
			  obj									= createTimeObj(row.hex_id, row['_case']);

		createTimeArray(time_key);

		times[time_key].push(obj);
		
	}

});

// console.log(times)

var times_json = JSON.stringify(times);

fs.writeFileSync('hex_running_totals.min.json', times_json)