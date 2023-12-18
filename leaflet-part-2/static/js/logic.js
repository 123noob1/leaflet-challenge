// PART 1: Create the Earthquake Visualization
// -------------------------------------------
// Visualize an earthquake dataset using a dataset of your own choice from USGS (http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)
// Tile layer options can be viewed here at leaflet-extras (https://leaflet-extras.github.io/leaflet-providers/preview/)

// Store the queryURL and plate data
const queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
const plateUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json'

// Perform a GET request to the query URL then send the data.Features to createFeatures() function
d3.json(queryUrl).then( earthquakesData => 
    d3.json(plateUrl).then( plateData => 
        createFeatures(earthquakesData.features, plateData.features)
    )
);

// Define the createFeatures function
function createFeatures(earthquakeData, plateData) {

    // Define a function to run once for each feature in the features in the features array.
    // Give each feature a popup that describes the place, time, magnitude, and depth for the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
                        <table>
                            <tr>
                                <td><b>Time</b></td>
                                <td>${new Date(feature.properties.time)}</td>
                            </tr>
                            <tr>
                                <td><b>Magnitude</b></td>
                                <td>${feature.properties.mag}</td>
                            </tr>
                            <tr>
                                <td><b>Depth</b></td>
                                <td>${feature.geometry.coordinates[2]}</td>
                            <tr>
                        </table>`);
    };

    // Define a function to create a circular marker with size depending on magnitude and color based on depth
    function createMarker(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: feature.properties.mag * 4,
            color: 'black',
            fillColor: setMarkerColor(feature.geometry.coordinates[2]),
            weight: 0.25,
            opactiy: 0.5,
            fillOpacity: 0.8
        });
    };

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createMarker
    });

    // Set up the GeoJSON layer for plate data from the PB2002_plates.jsonf ile
    let plates = L.geoJSON(plateData, {
        style: function() {
            return {
                color: 'red',
                weight: 2,
                opacity: 0.8
            }
        }
    });

    // Send the layer to createMap function
    createMap(earthquakes, plates);
};

// Define the createMap function
function createMap(earthquakes, plates) {
    
    // Create the base layers
    let positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 8
    });

    let cartoDarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 8
    });

    let street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 8,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps/tiles object.
    let baseMaps = {
        'Street Map': street,
        'Positron Map': positron,
        'Carto Map': cartoDarkMatter
    };

    // Create overlay object to hold our overlay (earthquakes and tectonic)
    let overlayMaps = {
        'Tectonic Plates': plates,
        Earthquakes: earthquakes
    }

    // Create the map with the center coordinate being USA
    let map = L.map('map', {
        center: [ 37.09, -95.71 ],
        zoom: 5,
        layers: [ street, plates, earthquakes ]
    });

    // Create a legend to display information bout our map
    let info = L.control({ position: 'bottomright' });

    // When the layer legend is added, insert a div with the class of 'legend'
    info.onAdd = function() {
        let div = L.DomUtil.create('div', 'legend'),
            grades = [ -10, 10, 30, 50, 70, 90 ],
            legendInfo = '<h3>Magnitude</h3><hr>';
        
        div.innerHTML = legendInfo;
        
        grades.forEach((item, index) => {
            return div.innerHTML +=
                    '<i style="background: ' + setMarkerColor(item + 1) + ';"></i>' +
                    item + (grades[index + 1] ? '&nbsp;&ndash;&nbsp;' + grades[index + 1] + '<br>' : '+')
        });

        return div;
    };

    // Add the layer controls to the map (baseMaps and overlayMaps)
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(map);

    // Add the info legend to the map
    info.addTo(map);
};

// Function to set the marker colors based on the depth of the earthquake
// Shade of colors used here are from red base which came from https://htmlcolorcodes.com/colors/shades-of-red/
function setMarkerColor(depth) {
    return depth > 90 ? '#581845' :
            depth > 70 ? '#900C3F' :
            depth > 50 ? '#C70039' :
            depth > 30 ? '#FF5733' :
            depth > 10 ? '#FFC300' :
                         '#DAF7A6' ;
};