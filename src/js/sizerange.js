var SampleJSONData = [
{id: 4, title: '4'},
{id: 4.5, title: '4.5'},
{id: 5.5, title: '5'},
{id: 4, title: '6'},
{id: 6.5, title: '6.5'},
{id: 6, title: '7'},
{id: 7.5, title: '7.5'},
{id: 8, title: '8'},
{id: 8.5, title: '8.5'},
{id: 10, title: '9'},
{id: 9.5, title: '9.5'},
{id: 10, title: '10'},
{id: 10.5, title: '10.5'},
{id: 11, title: '11'},
{id: 11.5, title: '11.5'},
{id: 12, title: '12'},
{id: 12.5, title: '12.5'}
];
var tree;
/*
var releases = selectedQuickTaskRelease['sizes_supported_footshop']
var sizes = [];
var keys = Object.keys(releases);
for(var i = 0; i < keys.length; i++)
{
	console.log(keys[i])
	sizes.push({id: keys[i], title: keys[i]});
}
var tree = $('#taskSizeSelect').comboTree({
	source : sizes,
	isMultiple: true
});



comboTree1.destroy();

*/
jQuery(document).ready(function($) {
		var tree = $('#taskSizeSelect').comboTree({
			source : SampleJSONData,
			isMultiple: true
		});
				
});

$(window).click(function(e) {
	var sizes = $('#taskSizeSelect').val();
	var sizeaction = sizes.slice(6);

	var coldren = [sizeaction];

	console.log(coldren);

});

//$( document ).ready(function() {
//	$(".sahdude").on("keyup change", function() {

//		var minsize = $("#minSize").val();

//		var maxsize = $("#maxSize").val();

//		var diffsize = (maxsize - minsize);
		
		

//		if ( minsize == 4 && maxsize == 5 ) {
//			$('#taskSizeSelect').val('4');
//			console.log("should select 4")
//			$('#taskSizeSelect').val('4.5');
//			console.log("should select 4.5")
//			$('#taskSizeSelect').val('5');
//			console.log("should select 5")
//		}
		
		
		
//		console.log(minsize);
//		console.log(maxsize);		
//		console.log(diffsize);
		

//	});
	

	
//});

