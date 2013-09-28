(function(){

	var SYMPH = {
			map: null,
			start_lat: 37.774,
			start_lng: -122.419,
			start_zoom : 13
	}


  var CONFIG = {
    mark_number: 1,
    marker_width: 175,
    animation_speed: 100
  }

  var els = {
  	$map_canvas: $('#map-canvas')
  }

  function drawVectors(vectors){
    var polygon_base_style = {
      weight: 1,
      opacity: 1,
      fillOpacity: .95,
      clickable: false
    };

    var polygon_styles = [
      {
        color: "#00ccff",
        fillOpacity: .45,
        fillColor: "#00ccff",
      },
      {
        color: "#ffcc00",
        fillOpacity: .45,
        fillColor: "#ffcc00",
      },
      {
        color: "#ff00cc",
        fillOpacity: .45,
        fillColor: "#ff00cc",
      },
    ];

    console.log(vectors)

    // clearVectors();
    // SYMPH.polygon_layers = [];
    _.each(vectors, function(vector){
	    var polygon_layer = new L.GeoJSON(vector, {
	      style: function(){
	        return _.extend(polygon_base_style, polygon_styles[0]);
	      },
	      onEachFeature: function(featureData, layer1){
          (function(layer1, properties){
  	      	layer1.on('click', function(d){
              console.log('d')
            })

          })(layer1, featureData.properties)
	      }
	    });
	    SYMPH.map.addLayer(polygon_layer);
    // AJMINT.polygon_layers.push(polygon_layer);
    });

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

	function startTheShow(){
		drawBaseMap();
		drawVectors(vectors);
	}

	var n = 0
	$(document).keyup(function(e) {
	  if (e.keyCode == 27) { //esc
	  	addMarker(CONFIG.mark_number)
	  	CONFIG.mark_number++
	  } 
	});

	startTheShow();



}).call(this);