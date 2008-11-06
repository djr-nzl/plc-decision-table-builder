// JavaScript Helper for my Ruby, Camping, PLC Decision Table Design and Test Tool.
// Version 2 - 10 Sep 08 - iinitial release - needs lots to finish.
// Version 3 - 30 Oct 08 - added drag and drop and tidied and reworked most the js.
// djr.nzl@gmail.com
// This code is free - it's yours already.

/*
Notes: on Revision 2

Version 2 is a conversion of the concepts of the 1st version, a Excel spreadsheet to a web
 app that (will) allow the saving and retrival of named table designs.

Enhanced in the interactivity of the testing.
And the standardization a web interface provides over Excel.

The idx thing does not work yet for row or column append or remove.
They all work on the last column or last row as the case may be.
The Scanner runs once a second all the time (PLC in run mode).
The original html file for this was served by a web server, ( I will use this 
for the database backend (naming, stroring and retriving decision tables)),
and I then saved the file.

The result (a html file), along with its folder of helpers (.js and .css) 
are then zipped - and its that zip that u most likely found this file in.

It's cool I think, when saving the new structure of the table is saved.
So one could keep a folder of these files for each decision table rather
than use a server and database and all.

It is easy enough just to include the js and css in the html file, but is not
where I wanted to go.

I still have a couple of things to fix.
# The idx thing for Append and Remove
# Code generation
# Server saving (POST) and retrival (GET)
# The solver needs to do the feedback of any outputs that are used as inputs - cool when it goes.

Remember:
It's a tool to design, test and build simple decision tables for PLC's
It does not analyze the DT to determine if all case are accouned for or do rule reduction, and the like.

What it does do is to allow one to play with the inputs and rules and watch them being solved.
And thats the main reason for this tool - it gives one the ability to test (the decision table) as one designs.
It will then (when I do that bit) generate the table logic, a inputs template (hand assembly will be required)
and the required outputs logic, as (in the first instance) RLL (relay ladder logic). Some assembly is required.

Anyway - have fun with it.
raygun

*/

var Scan_Cnt	= 0	;
var BT = '1'; // Boolean True
var BF = '0'; // Boolean False
var BN = ' '; // Boolan Null (for don't care)
var LR = 0; // The last rule - used to auto allocate rule numbers

$(document).ready(function () {
 App_Initialize();
});

function App_Initialize(){
	App_Reset();
	setInterval('Scanner();',1000);
	LR = $('#rule_id').find('td').length - 1;
}

// removes all events and then sets them up again
// used once on loading
// used after appending or removing a column or row
function App_Reset(){

	// i want to remove all events - so i can added them all again.
	// i assume that adding them and adding them will consume memory.
	$('*').unbind();

	// now make various tables content toggable (2 state for inputs and 3 state for rules).
	// these click events are added to each <td> that is clickable which is most of them.
	Initialize_Toggle_2Bit('#input_state');
	Initialize_Toggle_3Bit('#input_rules');
	Initialize_Toggle_3Bit('#output_rules');
	Initialize_List_Click_Edit('#input_list');
	Initialize_List_Click_Edit('#output_list');
	
	// Color in the inputs
	Color_In( $('#input_state').find('td') );
	
	// this lot makes the table rows and colums dragable
	
	table_drag_column('#rule_id','#rule_id, #input_rules, #input_rules_state, #output_rules');
	table_drag_row('#input_list','#input_list, #input_state, #input_rules', true);
	table_drag_row('#output_list','#output_list, #output_state, #output_rules', true);
	
}

// My reminders
function fix_it(){
	alert('Sorry, some of these buttons are "to do" (server comms etc).\nTry the Insert and Remove links.\nTry toggling the valves in inputs or rules tables.');
}

// Dynamics - logic solver.
// Use the inputs table column to solve the input rules.
// Then the result of the inputs rules to solve the output rules
// Feed back any outputs that are also inputs.
// Then apply the colouring (to rules and outputs using css classes)

function Scanner(){
	Scan_Cnt ++; $('#scan_count').text('Scan count: ' + Scan_Cnt);
	Scanner_Solve_Table();
}

function Scanner_Solve_Table(){
	// get all the data from the tables
	// this data is a string of 1's, 0's and spaces ' ' 
	var input_str = $('#input_state').text();
	var irules_cnt = $('#rule_id').find('td').length;
	var irules_str = $('#input_rules').text();
	var orules_str = $('#output_rules').text();
	
	// solve the input rules using that data (no touching the DOM yet)
	var irules_tmp_arr = Scanner_Solve_Input_Rules(input_str, irules_cnt, irules_str);
	var irules_state_str = irules_tmp_arr[0];
	var irules_format_str = irules_tmp_arr[1];
	
	// solve the output rules using that data (no touching the DOM yet)
	var orules_tmp_arr	= Scanner_Solve_Output_Rules( irules_state_str, irules_cnt, orules_str);
	var orules_state_str	= orules_tmp_arr[0];
	var orules_format_str	= orules_tmp_arr[1];
	
	// write solved states to the DOM
	Scanner_Update_IRules(irules_state_str);
	Scanner_Update_ORules(orules_state_str);
	Scanner_Feedback_Inputs(orules_state_str);
	
	// Color in the inputs - they can be changed by function Scanner_Feedback_Inputs()
	// changes the classes of the various table <td> elements
	Color_In( $('#input_state').find('td') );
	
	// Color in the inputs rules table next - using the format string returned when that part was solved
	Color_In_Using_Format_Str( '#input_rules' , irules_format_str );
	Color_In_Using_Format_Str( '#output_rules' , orules_format_str );
	Color_In( $('#input_rules_state, #output_state').find('td') );
}

function Scanner_Solve_Input_Rules(input_str, rules_cnt, rules_str){
	var output = [];
	var format = [];
	var last_input = input_str.length;
	var rule_pt;
	for (var col_pt = 0; col_pt < rules_cnt; col_pt++ ) {
		var carry = BN;
		for (var row_pt = 0; row_pt < last_input; row_pt++ ) {
			rule_pt = col_pt + (row_pt * rules_cnt);
			if( rules_str[rule_pt] != BN ){
				if( rules_str[rule_pt] == input_str[row_pt] && carry != BF ){ carry = BT }
				else{ carry = BF }
			}
			format[rule_pt] = carry;
		}
		output[col_pt] = carry;
	}
	return [output.join(''),format.join('')];
}

function Scanner_Solve_Output_Rules( input_str, input_len, rules_str ){
	var output = [];
	var format = [];
	var output_len = rules_str.length / input_len;
	var carry;
	var rules_str_pt;
	for( var output_pt = 0; output_pt < output_len; output_pt ++ ){
		carry = BN;
		for( var input_pt = 0; input_pt < input_len ; input_pt ++ ){
			rules_str_pt = output_pt * input_len + input_pt;
			format[rules_str_pt] = BN;
			if( input_str[input_pt] != BN && rules_str[rules_str_pt] != BN ){
				if( rules_str[rules_str_pt] == input_str[input_pt] || carry == BT ){
					carry = BT;
				}else{
					carry = BF;
				}
				if( rules_str[rules_str_pt] == input_str[input_pt] ){
					format[rules_str_pt] = BT;
				}else{
					format[rules_str_pt] = BF;
				}
			}
		}
		output[output_pt] = carry;
	}
	return [output.join(''), format.join('')];
}

function Scanner_Feedback_Inputs(outputs_str){
	inputs = [];
	outputs = [];
	$('#input_list').find('td').each(function(i){inputs[i] = $(this).text()});
	$('#output_list').find('td').each(function(i){outputs[i] = $(this).text()});
	for (ox = 0 ; ox <= outputs.length ; ox ++){
		for (ix = 0 ; ix <= inputs.length ; ix ++){
			if ( outputs[ox] != BN && inputs[ix] != BN && outputs[ox] == inputs[ix] ){
				ip = $('#input_state').find('td:eq('+ix+')');
				ip.text(outputs_str[ox]);
			}
		}
	}
}

function Scanner_Update_IRules(state_str){
	$('#input_rules_state').find('td').each(function(idx){
		$(this).text(state_str[idx]);
	});
}

function Scanner_Update_ORules(state_str){
	$('#output_state').find('td').each(function(idx){
		$(this).text(state_str[idx]);
	});
}

// Clickie things

function Initialize_Toggle_2Bit(query){
	var jQ = $(query).find('td')
	jQ.addClass('cursorP');
	jQ.click(function(event){
		elm = $(this);
		if(elm.text() != BT){
			elm.text(BT);
		}else{
			elm.text(BF);
		}
		Color_In(jQ);
	});
	return false;
}

function Initialize_Toggle_3Bit(query){
	var jQ = $(query).find('td')
	jQ.addClass('cursorP');
	jQ.click(function(event){
		var this_val = $(this).text();
		var new_val = this_val;
		if (this_val == '' || this_val == BN) {new_val = BT }
		else if (this_val == '0') { new_val = BN }
		else { new_val = BF }
		$(this).text(new_val);
		return false;
	});
}

function Initialize_List_Click_Edit(query){
	var jQ = $(query).find('td')
	jQ.addClass('cursorP');
	jQ.click(function(event){
		rv = prompt( "Text description:" , $(this).text());
		if (rv != 'null'){$(this).text(rv)}
	});
	return false;
}


// Colouring in (a paint by numbers variation)
// when called with an array of elements
// iterates through them coloring then according to their text value.
function Color_In(query_str){
	$(query_str).each(function(idx){
			var T = $(this);
			if(T.text() == BT){
				T.addClass('FPLC_On');
				T.removeClass('FPLC_Off');
				T.removeClass('FPLC_Clr');
			}else if(T.text() == BF){
				T.addClass('FPLC_Off');
				T.removeClass('FPLC_On');
				T.removeClass('FPLC_Clr');
			}else{
				T.addClass('FPLC_Clr');
				T.removeClass('FPLC_On');
				T.removeClass('FPLC_Off');
			}
	});
}

// Use this to color in the inputs
// because sometimes 0 is to be indicated as true (green background) to help visually sole the rules.
// this formatiing can be changed to suit different ways of looking at the rules.
// for now I use the carry from the rule solver to determine color.
function Color_In_Using_Format_Str( query , format_str ){
	$(query).find('td').each(function(idx){
			var T = $(this);
			fmt = format_str[idx];
			if(fmt == BT){
				T.addClass('FPLC_On');
				T.removeClass('FPLC_Off');
				T.removeClass('FPLC_Clr');
			}else if(fmt == BF){
				T.addClass('FPLC_Off');
				T.removeClass('FPLC_On');
				T.removeClass('FPLC_Clr');
			}else{
				T.addClass('FPLC_Clr');
				T.removeClass('FPLC_On');
				T.removeClass('FPLC_Off');
			}
	});
}


function Renumber_Rules(){
	$('#rule_id').find('td').each(function(idx){
		$(this).text(''+idx);
	});
	LR = $('#rule_id').find('td').length;
}

function Auto_Rule_Number(){
	LR ++;
	$('#rule_id').find('td:last').text(''+LR);
}

// Append and Remove  Rows and Columns

function Add_Input(){
	Append_Row('#input_list');
	Append_Row('#input_state');
	Append_Row('#input_rules');
	App_Reset();
}

function Remove_Input(){
	Remove_Row('#input_list');
	Remove_Row('#input_state');
	Remove_Row('#input_rules');
	App_Reset();
}

function Add_Output(){
	Append_Row('#output_list');
	Append_Row('#output_state');
	Append_Row('#output_rules');
	App_Reset();	
}

function Remove_Output(idx){
	Remove_Row('#output_list');
	Remove_Row('#output_state');
	Remove_Row('#output_rules');
	App_Reset();
}

function Add_Rule(idx){
	Append_Column('#rule_id');
	Append_Column('#input_rules');
	Append_Column('#input_rules_state');
	Append_Column('#output_rules');
	Auto_Rule_Number();
	App_Reset();
}

function Remove_Rule(idx){
	Remove_Column('#rule_id');
	Remove_Column('#input_rules');
	Remove_Column('#input_rules_state');
	Remove_Column('#output_rules');
	App_Reset();
}

// Append and Remove Row and Column Generics

function Append_Row(table_id){
	$(table_id).find('tbody').append($(table_id).find('tr:last').clone());
	$(table_id).find('tbody').find('tr:last').find('td').text( BN );
}

function Remove_Row(table_id){
	if ($(table_id).find('tr').length > 1){
		$(table_id).find('tr:last').remove();
	}
}

function Append_Column(table_id){
	$(table_id).find('tr').each(function( idx ){
		$(this).append($(this).find('td:last').clone());
	});
	$(table_id).find('tr').find('td:last').text( BN );
}

function Remove_Column(table_id){
	if ($(table_id).find('tr:first').find('td').length > 1){
		$(table_id).find('tr').each(function(i){
			$(this).find('td:last').remove();
		});
	}
}


// Handle the details div

function  Show_Details(){
	$('#main_title_in').attr({value: $('#main_title').text()});
	$('#sub_title_in').attr({value: $('#sub_title').text()});
	$('#top_menu').hide('slow')
	$('#sub_title').hide('slow')
	$('#detail_div').show('slow')
}

function  Hide_Details(){
	$('#detail_div').hide('slow');
	$('#top_menu').show('slow')
	$('#sub_title').show('slow')
	$('#main_title').text($('#main_title_in').attr('value'));
	$('#sub_title').text($('#sub_title_in').attr('value'));
}


/*	=== Stupid table row and column drag and dropper using jQuery ===
		Generic functions .
		Drags across mulipy tables (not from one to the other, common rows or columns).
		DJR - 30 Oct 2008 - Version 1.
		This is free code - its yours already. 
*/

function table_drag_row(dragable_elements, movable_elements, incl_first_row){
	var D, M, F;
	var Reset =	function(){	// reset function
						D = $(dragable_elements).find('tr');
						M = $(movable_elements);
						table_dragdrop(D, C, true);
					}
	var C =	function( event , T ){ // callback function
						var ID = D.index(T);
						if((ID > 0 && !incl_first_row) || incl_first_row){
							switch(event.type){
								case 'mousedown':
									if(ID==0 && !incl_first_row){break}
									F = ID;
									M.find('tr:eq(' + ID + ')').addClass('table_dd_drag');
								break;
								case 'mouseover':
									if(ID==0 && !incl_first_row){break}
									M.find('tr:eq(' + ID + ')').addClass('table_dd_drop');
								break;
								case 'mouseout':
									M.find('tr:eq(' + ID + ')').removeClass('table_dd_drop');
								break;
								case 'mouseup':
									M.find('*').removeClass('table_dd_drag');
									M.find('*').removeClass('table_dd_drop');
									if(F != ID){ table_move_row(M, F, ID); Reset()}
								break;
								default:
								alert('function table_drag_column error');
							}
						}
					}
	Reset();
}

function table_move_row(movable_elements, from_idx, to_idx){
	movable_elements.each(function(i){
		fsel = 'tr:eq('+from_idx+')';
		tsel = 'tr:eq('+to_idx+')';
		if( from_idx < to_idx ){
			$(this).find(tsel).after($(this).find(fsel));
		}else{
			$(this).find(tsel).before($(this).find(fsel));
		}
	});
}

function table_drag_column(dragable_elements, moveable_elements){
	var D, M, F;
	var Reset =	function(){	// reset function
						D = $(dragable_elements).find('th, td');
						M = $(moveable_elements).find('*').find('tr');
						table_dragdrop(D,C);
					}
	var C =	function( event , T ){ // callback function
						var ID = D.index(T);
						switch(event.type){
							case 'mousedown':
								F = ID;
								M.each(function(i){ $(this).find('th:eq('+ID+'), td:eq('+ID+')').addClass('table_dd_drag') });
							break;
							case 'mouseover':
								M.each(function(i){ $(this).find('th:eq('+ID+'), td:eq('+ID+')').addClass('table_dd_drop') });
							break;
							case 'mouseout':
								M.each(function(i){ $(this).find('th:eq('+ID+'), td:eq('+ID+')').removeClass('table_dd_drop') });
							break;
							case 'mouseup':
								M.find('*').removeClass('table_dd_drag');
								M.find('*').removeClass('table_dd_drop');
								if(F != ID){ table_move_column(M, F, ID); Reset()}
							break;
							default:
							alert('function table_drag_column error');
						}
					}
	Reset();
}

function table_move_column(movable_elements, from_idx, to_idx){
	movable_elements.each(function(i){
		fsel = 'th:eq('+from_idx+'), td:eq('+from_idx+')';
		tsel = 'th:eq('+to_idx+'), td:eq('+to_idx+')';
		if( from_idx < to_idx ){
			$(this).find(tsel).after($(this).find(fsel));
		}else{
			$(this).find(tsel).before($(this).find(fsel));
		}
	});
}

function table_dragdrop(dragable_elements, event_handler_fun, dragging_rows ){
	var D = dragable_elements;
	var E = event_handler_fun;
	var cursor = dragging_rows ? 'table_dd_rows' : 'table_dd_cols';
	D.unbind('mousedown');
	D.addClass('table_dd_point');
	D.mousedown(function(event){
		event.preventDefault();
		D.addClass(cursor);
		E(event, this);
		D.mouseover(function(event){E(event, this)});
		D.mouseout(function(event){E(event, this)});
		D.mouseup(function(event){
			E(event, this);
			D.removeClass(cursor);
			D.unbind('mouseover');
			D.unbind('mouseout');
			D.unbind('mouseup');
		});	
	});
}


//=======================================================
// get the index
// var index = $("div").index(this);
/* Stuff that may be handy

// $('td').bind("mouseenter mouseleave", function(e){ $(this).toggleClass("IC"); });


 $('.toggle_3bit').hover(function () {
		// $(this).css({ backgroundColor:"yellow", fontWeight:"bolder" });
	// }, function () {
		// var cssObj = {
			// backgroundColor: "#ddd",
			// fontWeight: "",
			// color: "rgb(0,40,244)"
		// }
		// $(this).css(cssObj);
// });

// ajax
function LoadPage( id ){ 	// -> '/PServ/page/'
		$.get('/PServ/page/' + id , MapToPage ) ;
		$('#files').hide('slow') ;
}

function SavePage(){ 			// -> '/PServ/page/'
		var id = $('#page_id').text() ;
		var post_data = {
			page_id: id,
			page_title: $('#page_title').attr('value'),
			page_tags: $('#page_tags').attr('value'),
			page_text: ContentIs()
		}
		$.post(	'/PServ/page/' + id ,
								post_data,
								function(){ ToggleMenuBar(); }
		) ;
}

function GetPageList(){  	// -> '/PServ/fck_list'
	$('#page_list_div').load('/PServ/fck_list');
}

function UpDateList(){ 		// -> '/PServ/jlist'
	$.getJSON( '/PServ/jlist' ,
		function(data){
			alert(data);
		}
	);
}

// mapping
function MapToPage(data){
		var d = data.split('***') ;
		$('#page_id').text( d[0] ) ;
		$('#page_ver').text( d[1] ) ;
		$('#page_title').attr( {value: d[2]} ) ;
		$('#page_tags').attr( {value: d[3]} ) ;
		ContentSet(d[4]) ;
		$("title").text('FCK: ' + d[2]) ;
}

*/