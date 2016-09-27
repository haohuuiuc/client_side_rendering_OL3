/**************************************************************
 * Copyright (c) 2010-2016 CyberInfrastructure and Geospatial *
 * Information Laboratory (CIGI), University of Illinois at   *
 * Urbana-Champaign, All Rights Reserved.                     *
 **************************************************************
 @author Hao Hu <haohu3@illinois.edu>
 */

var imagery = new ol.source.TileArcGISRest({
    url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
    crossOrigin: 'anonymous'
});

/**
 * Use HAND XYZ tiled map as the input data for the raster source.
 */
var hand = new ol.source.XYZ({
    projection: "EPSG:4326",
    url: "http://141.142.170.170/data/hand/TMS/010100/{z}/{x}/{-y}.png",
    crossOrigin: 'anonymous' // this is required
});
var threshold = 40; // default threshold for HAND, display everything under 40

// HAND blue legend, get from ROGER /projects/nfie/nfie-floodmap/test/HAND-blues.clr
var classes = {
    "-0.0001":[8,48,107,0],
    "0": [8,48,107,255], 
    "1.01695":[8,53,115,255],
    "2.0339":[8,59,123,255],
    "3.05085":[8,64,131,255],
    "4.0678":[8,70,140,255],
    "5.08475":[8,75,148,255],
    "6.1017":[8,81,156,255],
    "7.11864":[11,85,159,255],
    "8.13559":[15,90,163,255],
    "9.15254":[18,95,166,255],
    "10.1695":[22,99,170,255],
    "11.1864":[26,104,174,255],
    "12.2034":[29,108,177,255],
    "13.2203":[33,113,181,255],
    "14.2373":[37,117,183,255],
    "15.2542":[41,121,185,255],
    "16.2712":[45,125,187,255],
    "17.2881":[50,130,189,255],
    "18.3051":[54,134,192,255],
    "19.322":[58,138,194,255],
    "20.339":[63,143,196,255],
    "21.3559":[67,147,198,255],
    "22.3729":[73,150,200,255],
    "23.3898":[78,154,202,255],
    "24.4068":[83,158,204,255],
    "25.4237":[89,161,207,255],
    "26.4407":[94,165,209,255],
    "27.4576":[99,169,211,255],
    "28.4746":[105,172,213,255],
    "29.4915":[111,176,214,255],
    "30.5085":[118,180,216,255],
    "31.5254":[124,183,217,255],
    "32.5424":[131,187,219,255],
    "33.5593":[138,191,220,255],
    "34.5763":[144,194,222,255],
    "35.5932":[151,198,223,255],
    "36.6102":[158,202,225,255],
    "37.6271":[163,204,226,255],
    "38.6441":[168,206,228,255],
    "39.661":[173,208,230,255]
}
/**
 * Create a raster source where pixels with VGI values above a threshold will
 * be hidden
 */
var raster = new ol.source.Raster({
  sources: [hand],
  /**
   * Run calculations on pixel data.
   * @param {Array} pixels List of pixels (one per source).
   * @param {Object} data User data object.
   * @return {Array} The output pixel.
   */
  operation: function(pixels, data) {
    
    var r = data.r;
    var g = data.g;
    var b = data.b;

    var pixel = pixels[0];
    if (pixel[0]>r && pixel[1]>g && pixel[2]>b){ // this is not a general rule
        return [0,0,0,0]
    } else{
        return pixel;
    }
    
    
  },
  lib: {
    // to access global variables and functions outside this scope, pass params here
  }
});

raster.on('beforeoperations', function(event) {
    var data = event.data;
    var elev = Object.keys(classes);
    var r,g,b;
    for (var i = 0; i < elev.length-1; i++){
        if (Number(elev[i]) < threshold && Number(elev[i+1]) > threshold) {
            r = classes[elev[i]][0];
            g = classes[elev[i]][1];
            b = classes[elev[i]][2];
            break;
        }
    }
    data['r'] = r;
    data['g'] = g;
    data['b'] = b;
});


var map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: imagery
        }),
        new ol.layer.Image({
            source: raster,
            extent:ol.proj.transformExtent([-70.432214223, 45.7019823905, -66.6027496654, 48.0997078201],
                                         'EPSG:4326', 'EPSG:3857')
        })
    ],
    target: 'map',
    view: new ol.View({
        center: ol.proj.transform([-68.3, 46.8], 'EPSG:4326', 'EPSG:3857'),
        zoom: 8,
        minZoom: 5,
        maxZoom: 10
    })
});

var control = document.getElementById("hand");
var output = document.getElementById('handOut');
control.addEventListener('input', function() {
  output.innerText = control.value;
  threshold = control.value;
  raster.changed();
});
output.innerText = control.value;

