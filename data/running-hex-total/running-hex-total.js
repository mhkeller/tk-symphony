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

var good_hexes = ["h0.0349548335042181","h0.0224901618695707","h0.0252014380594545","h0.0109968004466268","h0.0331403774910411","h0.0195512561197767","h0.025022853679661","h0.0288063819615331","h0.0428298358271987","h0.0675226686234212","h0.0549802983544804","h0.0558019008708885","h0.0600670326470933","h0.0407930319333856","h0.0394133805010673","h0.0429656981397971","h0.0503614786260796","h0.0240412682786918","h0.0258650635820757","h0.0336107653718937","h0.0130789568641807","h0.00877088110971174","h0.0168652154359615","h0.0279039739450118","h0","h0.00320510971202026","h0.0174042920678374","h0.0316007462729289","h0.00826939265482036","h0.0036739477995339","h0.0126838372207505","h0.025594452462692","h0.0181898611959787","h0.0205399606617383","h0.0529481154951235","h0.0623118940201368","h0.0654268900741321","h0.053022085048363","h0.0586050212020496","h0.0545969251937618","h0.0577513985114002","h0.054964514513888","h0.0466717721382083","h0.0488757752704289","h0.0383523161262003","h0.0298325785193754"]
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
	console.log(row)
	if (isAGoodHexVal){
		var current_hex_hit_val = incrementHexId(row.hex_id),
			  time_key            = row.time_key
			  obj									= createTimeObj(row.hex_id, row['___case']);

		createTimeArray(time_key);
		times[time_key].push(obj);
		
	}

});

// console.log(times)

var times_json = JSON.stringify(times);

fs.writeFileSync('hex_running_totals.min.json', times_json)