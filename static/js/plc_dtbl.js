// JavaScript Helper for my Ruby, Camping, PLC Decision Table Design and Test Tool.
// Version 2 - 10 Sep 08.
// djr.nzl@gmail.com
// Released to the public domain.

/*1
Notes: on Revision 2

Version 2 is a conversion of the concepts of the 1st version, a Excel spreadsheet to a web
 app that (will) allow the saving and retrival of named table designs.

Enhanced in the interactivity of the testing.
And the standardization a web interface provides over Excel.

This was a trial to together to see if using a 

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
And that the main reason for this tool - it gives one the ability to test (the decision table) as one designs.
It will then (when I do that bit) generate the table logic, a inputs template (hand assembly will be required)
and the required outputs logic, as (in the first instance) RLL (relay ladder logic). Some assembly is required.

Anyway - have fun with it.
raygun

*/

PLC_On 		= '#0F0'	;
PLC_Off 	= '#AAA'	;
PLC_Clr 	= '#DDF'	;
Rule_On 	= '#CFC'	;
Rule_Off 	= PLC_Off	;
Rule_Clr 	= PLC_Clr	;
Scan_Cnt	= 0				;


$(document).ready(function () { Start_Scanner(); });

function Start_Scanner(){

	Setup_Toggle_2Bit('.dt_input');
	Setup_Toggle_3Bit('#input_rules');
	Setup_Toggle_3Bit('#output_rules');
	Color_IO('.dt_input');
	Start_List_Click_Edit('#input_list');
	Start_List_Click_Edit('#output_list');
	setInterval('Scanner();',1000);
}

// Reminders
function do_it(){
	alert('Sorry, some of these buttons are "to do" (server comms etc).\nTry the Insert and Remove links.\nTry toggling the valves in inputs or rules tables.');
}1

// Dynamics - logic solver, improve solver!

function Scanner(){
		Scan_Cnt ++; $('#scan_count').text('Scan count: ' + Scan_Cnt);
		Solve_Rules();
}

function Solve_Rules(){
	inputs_state 		= Get_Inputs_State()
	in_rules_state	= Solve_Input_Rules( inputs_state )
	out_rules_state	= Solve_Output_Rules( in_rules_state )
	Update_Input_Rules_State( in_rules_state )
	Update_Outputs_State( out_rules_state )
	Feedback_To_Inputs( out_rules_state )
}

// Rule solver helpers (each does a section of the loop from inputs, to input rules to
// the input rules outputs to the outputs rule to the outputs then feed back to any
// inputs that are also outputs.

function Get_Inputs_State(){
	input = [] ;
	$('.dt_input').each(function (i){
		bit_val = $(this).text();
		if ( bit_val != '0' && bit_val != '1'){ $(this).text('0') ; $(this).css({backgroundColor: PLC_Off}) }
		input[i] = $(this).text()
	}) ;
	return input ;
}

function Solve_Input_Rules(input){
	// Add a class to the columns to ease selecting by column
	last_rule_idx = Add_Rule_Class('input_rules');

	// ITERATE over the just added class columns using a index to derive the class name to select.
	output = [];
	for(idx = 0; idx <= last_rule_idx; idx++){
		// New column - reset!
		rule_true = true ;
		rule_empty = true ;
		rule_bit = false ;
		this_bit = '';
		// iterate across columns (rules) solving vertically
		$('.IR'+idx).each(function(i){
			this_bit = $(this).text();
			rule_bit = (this_bit == input[i] || this_bit == ' ' );
			if (this_bit != ' ' && this_bit != '0' && this_bit != '1'){
				$(this).text(' ');
			}
			$(this).css({backgroundColor: (rule_bit ? Rule_On : Rule_Off)});
			rule_true = rule_true && rule_bit;
			if (this_bit == '0' || this_bit == '1'){rule_empty = false }
		});
		// make a column of rule points highlighted if rule true
		if (rule_true){$('.IR'+idx).css({backgroundColor: PLC_On});}
		// make a column of rules blank if no points are set to 1 or 0
		if (rule_empty){$('.IR'+idx).css({backgroundColor: Rule_Clr})}
		// update the output array - this is carried over to use for solving the output rules
		output[idx] = (rule_true ? '1' : '0');
		if (rule_empty){output[idx] = ' ';}
	}
	return output;
}

function Update_Input_Rules_State(output){
	$('#input_rules_state').find('tr').find('td').each( function(i){
		$(this).text(output[i]);
		$(this).css({backgroundColor: (output[i] == '1') ? PLC_On : PLC_Off });
		if (output[i] == ' '){$(this).css({backgroundColor: Rule_Clr});}
	});
}

function Solve_Output_Rules(inputs_arr){
	output = [];
	// ITERATE over each row
	$('#output_rules').find('tr').each( function(yi){	
		rule_true = false ;
		rule_empty = true ;
		 // ITERATE over that rows columns
		$(this).find('td').each(function(xi){
			ref_bit = inputs_arr[xi];
			this_bit = $(this).text();
			if ( ref_bit == '0' || ref_bit == '1' ) { // Has a corresponding input rule?
				if (this_bit == '0' || this_bit == '1'){ // Is a valid point itself?
					rule_empty = false ; // It's a point (its 0 or 1) its got a valid input rule and so this rule is now valid
					if (this_bit == ref_bit) {
						$(this).css({backgroundColor: PLC_On}) ;
						rule_true = true ; // And not only that - its true
					}
					else { // Point is valid  and false
						$(this).css({backgroundColor: Rule_Off}) ;
					}
				}
				else { // Point is not valid - no rule set - Clr it
					$(this).css({backgroundColor: Rule_Clr});
				}
			}
			else { // Point is not valid - no input rule - Clr it
				$(this).css({backgroundColor: Rule_Clr});
			}
		}); // Next column
		
		// Update result array
		if ( ! rule_empty){
			if (rule_true){
				output[yi] = '1'
			} else {
				output[yi] = '0'
			}
		} else {
				output[yi] = ' '
		}
	}); // Next row

return output;
}

function Update_Outputs_State(state_arr){
	$('.dt_output').each(function(i){
		ov = state_arr[i];
		$(this).css({backgroundColor: ov == '1' ? PLC_On : PLC_Off });
		if (ov == ' '){$(this).css({backgroundColor: PLC_Clr})}
		$(this).text(ov);
	});
}

function Feedback_To_Inputs(state_arr){
	inputs = [];
	outputs = [];
	$('#input_list').find('td').each(function(i){inputs[i] = $(this).text()});
	$('#output_list').find('td').each(function(i){outputs[i] = $(this).text()});
	for (ox = 0 ; ox <= outputs.length ; ox ++){
		for (ix = 0 ; ix <= inputs.length ; ix ++){
			if (outputs[ox] == inputs[ix]){
				ip = $('#input_state').find('td:eq('+ix+')')
				ip.text(state_arr[ox])
				Color_IO(ip);
			}
		}
	}
}

// Clickie numbers

function Add_Rule_Class(table_id){
	last_idx = $('#'+table_id).find('tr:first').find('td').length;
	for (idx = 0 ; idx <= last_idx ; idx ++){
		$('#'+table_id).find('tr').find( 'td:eq(' + idx + ')' ).removeClass().addClass('IR'+ idx)
	}
	return last_idx;
}

function Setup_Toggle_2Bit(elm_to_bind){
	$(elm_to_bind).bind('click',function(e){ $(this).text( ($(this).text() != 1) ? 1 : 0 );Color_2Bit(this);});
}

function Setup_Toggle_3Bit(elm_to_bind){
	$(elm_to_bind).find('td').bind("click", function(e){
		v = $(this).text();
		if (v == '' || v ==' ') {v = '1' }
		else if (v == '0') {v = ' ' }
		else { v = '0' }
		$(this).text(v);
	});
}
	
function Color_IO(elm_to_color){
	$(elm_to_color).each(function(i){ Color_2Bit(this) }); 
}

function Color_2Bit(elm_to_color){
	e = $(elm_to_color);
	e.css({ backgroundColor: (e.text() == 1) ? PLC_On : PLC_Off });
}

// Clickie text

function Start_List_Click_Edit(elm_to_bind){
	$(elm_to_bind).find('td').each(function (i){
		$(this).bind('click',function(e){
		rv = prompt( "Change text" , $(this).text());
		if (rv != 'null'){$(this).text(rv)}
		});
	});
}

// Append and Remove  Rows and Columns

function Insert_Input(idx){
	Append_Row('input_list',0);
	Append_Row('input_state',0);
	Append_Row('input_rules',0);
}

function Remove_Input(idx){
	Remove_Row('input_list',0);
	Remove_Row('input_state',0);
	Remove_Row('input_rules',0);
}

function Insert_Output(idx){
	Append_Row('output_list',0);
	Append_Row('output_state',0);
	Append_Row('output_rules',0);
}

function Remove_Output(idx){
	Remove_Row('output_list',0);
	Remove_Row('output_state',0);
	Remove_Row('output_rules',0);
}

function Insert_Rule(idx){
	Append_Column('rule_id',0);
	Append_Column('input_rules',0);
	Append_Column('input_rules_state',0);
	Append_Column('output_rules',0);
}

function Remove_Rule(idx){
	Remove_Column('rule_id',0);
	Remove_Column('input_rules',0);
	Remove_Column('input_rules_state',0);
	Remove_Column('output_rules',0);
}

// Append and Remove Generics

function Append_Row(table_id, after_idx){
	$('#'+table_id).find('tbody').append($('#'+table_id).find('tr:last').clone(true));
	$('#'+table_id).find('tbody').find('tr:last').find('td').text(' ');
}

function Remove_Row(table_id,idx){
	if ($('#'+table_id).find('tr').length > 1){
		$('#'+table_id).find('tr:last').remove();
	}
}

function Append_Column(table_id,idx){
	$('#'+table_id).find('tr').each(function(i){
		$(this).append($(this).find('td:last').clone(true));
	});
	
	$('#'+table_id).find('tr').find('td:last').text(' ');
	
	Renumber_Rules();
}

function Remove_Column(table_id,idx){
	if ($('#'+table_id).find('tr:first').find('td').length > 1){
		$('#'+table_id).find('tr').each(function(i){
			$(this).find('td:last').remove();
		});
		Renumber_Rules();
	}
}

function Renumber_Rules(){
	$('#rule_id').find('tr').find('td').each(function (i){
		$(this).text(i);
	});
}

// Details

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