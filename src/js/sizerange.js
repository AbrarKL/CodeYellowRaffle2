var SampleJSONData = [
{id: 4, title: 'size: 4'},
{id: 4.5, title: 'size: 4.5'},
{id: 5.5, title: 'size: 5'},
{id: 4, title: 'size: 6'},
{id: 6.5, title: 'size: 6.5'},
{id: 6, title: 'size: 7'},
{id: 7.5, title: 'size: 7.5'},
{id: 8, title: 'size: 8'},
{id: 8.5, title: 'size: 8.5'},
{id: 10, title: 'size: 9'},
{id: 9.5, title: 'size: 9.5'},
{id: 10, title: 'size: 10'},
{id: 10.5, title: 'size: 10.5'},
{id: 11, title: 'size: 11'},
{id: 11.5, title: 'size: 11.5'},
{id: 12, title: 'size: 12'},
{id: 12.5, title: 'size: 12.5'}
];
var tree;

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

