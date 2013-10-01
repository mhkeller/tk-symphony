(function(){

	window.SYMPH = {
			map: null,
      svg: null,
      g: null,
			start_lat: 37.78285825179077,
			start_lng: -122.39052772521971,
			start_zoom : 13,
      data: null,
      timer: null,
      current_date: '2005-01-01',
      data_max_count: null,
      count_scale: null,
      lookup: null
	}

  var CONFIG = {
    mark_number: 1,
    marker_width: 175,
    animation_speed: 100
  }

  var starting_time;
  var els = {
  	$map_canvas: $('#map-canvas')
  }

  function flashHexes(hexes_counts_cases){
    _.each(hexes_counts_cases, function(day_event, hex_id, list){
      flashHex(day_event);
    })
  }

  function mergeFaults(fault){
    if (fault == 'BICYCLIST'){
      return '#FC8D62'
    }else if (fault == 'NO_FAULT' || fault == 'SOLO_ACCIDENT'){
      return '#fff'
    }else if (fault == 'AUTO' || fault == 'PARKED_AUTO'){
      return '#8DA0CB'
    }else{
      return '#fff'
    }
  }

  function mergeClass(at_fault_hex){
    if (at_fault_hex == '#8DA0CB'){
      return 'auto-fault'
    }else if (at_fault_hex == '#FC8D62'){
      return 'bike-fault'
    }else{
      return 'none-fault'
    }
  }

  function flashHex(day_event){
    var request_time = new Date().getTime() - starting_time;

    // console.log(SYMPH.current_date, request_time)
    var fault = SYMPH.lookup[day_event.case_id].p1;
    var at_fault_hex   = mergeFaults(fault);
    var at_fault_class = mergeClass(at_fault_hex);
    $('#' + day_event.hex).attr('class',"hex svg-flash").attr('class', 'hex svg-flash ' + at_fault_class);
  }

  function removeFlash(hex_id){
    // _.delay()
    _.delay(delayRemove, 50000, hex_id);
  }
  function delayRemove(hex_id){
    $('#' + hex_id).attr('class',"hex");
    
  }

  function sanitizeHexId(d){
    return d.properties.HEX_ID.replace('.','');
  }

  function sanitizeHexIdAutre(d){
    return d.hex_id.replace('.','')
  }


  function setOpacities(hexes_counts){
    _.each(hexes_counts, function(obj, hex_id, list){
      var count_as_opacity = SYMPH.count_scale(obj.count);
      $('#' + hex_id).attr('fill-opacity', count_as_opacity).attr('fill-color','#0cf');
    });
  }

  function drawVectors(){
   SYMPH.svg = d3.select(SYMPH.map.getPanes().overlayPane).append("svg");
   SYMPH.g   = SYMPH.svg.append("g").attr("class", "leaflet-zoom-hide");

    d3.json("ca_hex_2000_ided_bounded.geojson", function(collection) {
      var bounds = d3.geo.bounds(collection),
          path   = d3.geo.path().projection(projectVectors);

      var feature = SYMPH.g.selectAll("path")
          .data(collection.features)
          .enter()
          .append("path")
            .attr('class', 'hex')
            .attr('fill-opacity', 0)
            .attr('id', function(d) { return sanitizeHexId(d); })
            .on('transitionend', function(d){ removeFlash(sanitizeHexId(d)) } )
            .on('mouseover', function(d) { flashHex(sanitizeHexId(d)) })

      SYMPH.map.on("viewreset", resetVectors);
      resetVectors();

      // Reposition the SVG to cover the features.
      function resetVectors(){
        var bottomLeft = projectVectors(bounds[0]),
            topRight   = projectVectors(bounds[1]);

        SYMPH.svg .attr("width", topRight[0] - bottomLeft[0])
            .attr("height", bottomLeft[1] - topRight[1])
            .style("margin-left", bottomLeft[0] + "px")
            .style("margin-top", topRight[1] + "px");

        SYMPH.g   .attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

        feature.attr("d", path);
      }

      // Use Leaflet to implement a D3 geographic projection.
      function projectVectors(x) {
        var point = SYMPH.map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
        return [point.x, point.y];
      }
    })
  }


  // This makes it explode using CSS transitions
  // You have to give it the delay otherwise it doesn't know that it's transitioning to anything
  var popMarker = function(marker_number){
  	console.log('pop')
    $('.marker-' + marker_number).addClass('expand-marker');
    CONFIG.mark_number++;
  }

  var addMarker = function(marker_number){
    console.log('running')
    var marker_class = L.divIcon({className: 'marker marker-' + marker_number});

		L.marker([37.774, -122.419], {icon: marker_class}).addTo(SYMPH.map);
		$('.marker-' + marker_number).css('background-color', '#'+Math.floor(Math.random()*16777215).toString(16));
   
    $('.marker-' + marker_number).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
      $(this).remove();
    });

    _.delay(popMarker, 0, marker_number);
  }

	function drawBaseMap(){
		SYMPH.map = L.map('map-canvas').setView([SYMPH.start_lat, SYMPH.start_lng], SYMPH.start_zoom);

		L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/82102/256/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	    maxZoom: 17
		}).addTo(SYMPH.map);
		
	}

  function incrementDate(){
    SYMPH.current_date = moment(SYMPH.current_date, 'YYYY-MM-DD');
    SYMPH.current_date = SYMPH.current_date.hour(24).format('YYYY-MM-DD');
  }

  function extractHexesFromDay(day_events){
    var hexes_counts = {}
    if (day_events != undefined){
      _.each(day_events, function(day_event){
        var obj = {
          hex: sanitizeHexIdAutre(day_event),
          count: day_event.count,
          case_id: day_event.case_id
        }
        hexes_counts[sanitizeHexIdAutre(day_event)] = obj;
      })
    }
    return hexes_counts;
  }

  function handleDate(date){
    if (SYMPH.data[date] != undefined){
      var day_events = SYMPH.data[date];
      var hexes_counts_cases = extractHexesFromDay(day_events);
      flashHexes(hexes_counts_cases);
      setOpacities(hexes_counts_cases);
    }

  }

  function onTickle(){
    $('.hex').attr('class','hex');
    handleDate(SYMPH.current_date)
    incrementDate();
  }

  function stopTimer(){
    clearTimeout(SYMPH.timer);
  }

  function wereOkayToGo(){
    // console.log(document.querySelector('audio').duration)
    // document.getElementById('noise').play();
    SYMPH.timer = setInterval( onTickle, 150.03 );
  }

  function showSeleniumReady(){
    $('body').append('<div id="is-available"></div>');
  }
  function hideSeleniumReady(){
    $("#is-available").remove();
  }

  function parseHash(){
    $('.hex').attr('class','hex');
    hideSeleniumReady();
    var date = window.location.hash.replace('#','');
    handleDate(date);
    $("#date-show").html(date);
    showSeleniumReady();
  }


  function loadData(){
    d3.json('case-lookup-table.min.json', function(lookup){
      SYMPH.lookup = lookup;

      d3.json('hex_running_totals.min.json', function(data){
        SYMPH.data = data;
        parseHash();
        var counts = [];
        _.each(data, function(arr, key, list){
          _.each(arr, function(obj){
            counts.push(obj.count)
          })
        })
        var max = d3.max(counts);
        SYMPH.data_max_count = max;
        SYMPH.count_scale = d3.scale.linear()
                      .domain([0, max])
                      .range([0, 1]);
        wereOkayToGo();
      })

    })

  }

	function startTheShow(){
		drawBaseMap();
		drawVectors();
    loadData();
    $(window).bind('hashchange', function(e) {
      parseHash();
    });
	}

	var n = 0
	$(document).keyup(function(e) {
	  if (e.keyCode == 27) { //esc
	  	// addMarker(CONFIG.mark_number)
	  	// CONFIG.mark_number++
      clearTimeout(SYMPH.timer);
      // starting_time = new Date().getTime();
      // wereOkayToGo();
	  } 
    if (e.keyCode == 17) { //esc
      clearTimeout(SYMPH.timer);
      $.each($('audio'), function () {
          this.stop();
      });
    }
	});

	startTheShow();



}).call(this);