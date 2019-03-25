(function(e){function t(t){for(var i,o,s=t[0],u=t[1],c=t[2],l=0,d=[];l<s.length;l++)o=s[l],a[o]&&d.push(a[o][0]),a[o]=0;for(i in u)Object.prototype.hasOwnProperty.call(u,i)&&(e[i]=u[i]);p&&p(t);while(d.length)d.shift()();return r.push.apply(r,c||[]),n()}function n(){for(var e,t=0;t<r.length;t++){for(var n=r[t],i=!0,s=1;s<n.length;s++){var u=n[s];0!==a[u]&&(i=!1)}i&&(r.splice(t--,1),e=o(o.s=n[0]))}return e}var i={},a={app:0},r=[];function o(t){if(i[t])return i[t].exports;var n=i[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.m=e,o.c=i,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)o.d(n,i,function(t){return e[t]}.bind(null,i));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="/panorama-visualization/";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],u=s.push.bind(s);s.push=t,s=s.slice();for(var c=0;c<s.length;c++)t(s[c]);var p=u;r.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"034f":function(e,t,n){"use strict";var i=n("64a9"),a=n.n(i);a.a},"56d7":function(e,t,n){"use strict";n.r(t);n("cadf"),n("551c"),n("f751"),n("097d");var i=n("2b0e"),a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("div",{ref:"map",attrs:{id:"map"}}),n("div",{attrs:{id:"list"}},[n("ol",e._l(e.sequences,function(t){return n("li",{key:t.id,on:{mouseover:function(n){return e.listOver(t)},mouseout:function(n){return e.listOut(t)},click:function(n){return e.listClick(t)}}},[e._v("\n        "+e._s(t.id)+"\n      ")])}),0),e.thumbnail?n("img",{staticClass:"thumbnail",attrs:{src:"https://api.data.amsterdam.nl/panorama/thumbnail/"+e.thumbnail.id+"/?width=250&heading="+e.thumbnail.heading}}):e._e()])])},r=[],o=n("0a0d"),s=n.n(o),u=(n("6762"),n("2fdb"),n("3b2b"),n("a481"),n("bc3a")),c=n.n(u),p=n("aa1a"),l=n.n(p);function d(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return{type:"FeatureCollection",features:[{type:"Feature",properties:t,geometry:{type:"Point",coordinates:e}}]}}var f={name:"app",data:function(){return{sequences:[],frames:[],sequence:void 0,selectedSurface:void 0,speed:150,thumbnail:void 0,previousPoint:void 0}},methods:{listClick:function(e){var t=this,n="https://amsterdam.github.io/panorama-visualization-data/sequences",i=e.capturedAt.slice(0,10).replace(new RegExp("-","g"),"/"),a="".concat(n,"/").concat(i,"/").concat(e.id,".geojson");c.a.get(a).then(function(e){return e.data}).then(function(e){t.sequence=e;var n=new Date(e.properties.coordinateProperties.capturedAt[0][0]),i=[];e.geometry.coordinates.forEach(function(t,a){var r=new Date(e.properties.coordinateProperties.capturedAt[a][0]),o=0;if(a>0){var s=e.properties.coordinateProperties.capturedAt[a-1];o=r-new Date(s[s.length-1])}t.forEach(function(t,r){var s=new Date(e.properties.coordinateProperties.capturedAt[a][r]);i.push({index:[a,r],timestamp:s-n-o})})}),t.selectedSurface=t.sequence.properties.tags.includes("surface-land")?"land":"water",t.frames=i,t.startAnimation()})},listOver:function(e){var t=["==","id",e.id];this.map.setFilter("sequences",t)},listOut:function(){this.map.setFilter("sequences",null)},startAnimation:function(){var e=s()();this.animate(e)},stopAnimation:function(){},animate:function(e){var t,n=this,i=s()(),a=i-e;for(t=0;t<this.frames.length;t+=1){var r=this.frames[t].timestamp;if(a<r/this.speed)break}var o=this.frames[t].index,u=d(this.sequence.geometry.coordinates[o[0]][o[1]],{type:this.selectedSurface}),c=this.sequence.properties.coordinateProperties.imageId[o[0]][o[1]];if(!this.thumbnail||i>this.thumbnail.timestamp+750){var p=0;this.previousPoint&&(p=l()(this.previousPoint.features[0],u.features[0])),this.thumbnail={id:c,heading:p,timestamp:i}}this.previousPoint=u,this.map.getSource("point").setData(u),e+this.frames[this.frames.length-1].timestamp/this.speed>i&&window.requestAnimationFrame(function(){n.animate(e)})}},watch:{sequence:function(){}},mounted:function(){var e=this,t=new mapboxgl.Map({container:this.$refs.map,hash:!0,style:{version:8,sources:{},layers:[]},center:[4.922,52.369],maxBounds:[[4.5,52],[5.54,52.7]],zoom:10,minZoom:8,maxZoom:19,scrollZoom:!1});t.on("load",function(){var n=new mapboxgl.NavigationControl;t.addControl(n,"top-left"),t.addLayer({id:"sequences",type:"line",source:{type:"vector",tiles:["https://amsterdam.github.io/panorama-visualization-data/tiles/{z}/{x}/{y}.pbf"],maxzoom:14},"source-layer":"sequences",layout:{"line-cap":"round","line-join":"round"},paint:{"line-opacity":.6,"line-color":["case",["==",["get","surface"],"water"],"#f25030","#ffd400"],"line-width":{stops:[[8,.1],[17,3]]}}}),t.addSource("point",{type:"geojson",data:d([52.367,4.915])}),t.addLayer({id:"point",source:"point",type:"circle",paint:{"circle-radius":5,"circle-color":"#00ffe1"}}),e.map=t,c.a.get("https://amsterdam.github.io/panorama-visualization-data/stats.json").then(function(e){return e.data}).then(function(t){e.sequences=t.sequences})})}},m=f,h=(n("034f"),n("2877")),v=Object(h["a"])(m,a,r,!1,null,null,null),b=v.exports;i["a"].config.productionTip=!1,new i["a"]({render:function(e){return e(b)}}).$mount("#app")},"64a9":function(e,t,n){}});
//# sourceMappingURL=app.aa51fc78.js.map