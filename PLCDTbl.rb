# Decision Table Builder and Test Tool (for PLC code genertion).
# Version 2 - 6 Oct 2009 - djr.nzl@gmail.com
# Version 4 - 14 Nov 2009 - djr.nzl@gmail.com
# Released to the public domain.

# This Ruby Camping App serves up a sample decision table page
# and will form the basis of the Tools back end.

Camping.goes :PLCDTbl

module PLCDTbl::Models

	class Dtable < Base ; end
	
	class CreateTheBasics < V 0.1
			
		def self.up
			create_table :PLCDTbl_dtables, :force => true do |t|
				t.column :id ,						:integer , :null => false
				t.column :flag ,					:integer
				t.column :created_on, 		:datetime
				t.column :updated_on, 		:datetime
				t.column :version ,				:integer
				t.column :title ,					:text
				t.column :notes ,					:text
				t.column :input_list ,		:text
				t.column :input_state ,		:text
				t.column :rule_list ,		:text
				t.column :input_rules ,		:text
				t.column :output_rules ,	:text
				t.column :output_list ,		:text
			end
		end
		
		def self.down
			drop_table :PLCDTbl_dtables
		end
		
	end

end

module PLCDTbl::Controllers

	class Index < R '/' , '/index'
		def get
			@tables =Dtable.find( :all )
			render :index
		end
	end
	
	class TableServ < R '/table', '/table/(.+)'
		
		def get id = nil
			if ! id.nil? and ! Dtable.find(id).nil?
				@table = Dtable.find( id )
			else
				@table = Dtable.new
				@table.id = 0
				@table.version = 0
				@table.title = 'New decision table'
				@table.notes = 'No notes yet'
				@table.input_list = 'Automatic'
				@table.input_state = '0'
				@table.rule_list = '0'
				@table.input_rules = '1'
				@table.output_rules = '0'
				@table.output_list = 'Automatic'
			end
			render :decision_table
		end
		
		def post id = 0
			if id.to_i == 0
				id = Dtable.create(
					:flag=> 0,
					:version=> 1,
					:title=> input.title,
					:notes=> input.notes,
					:input_list=> input.input_list,
					:input_state=> input.input_state,
					:rule_list=> input.rule_list,
					:input_rules=> input.input_rules,
					:output_rules=> input.output_rules,
					:output_list=> input.output_list
				).id
				ver = 0
				else
				Dtable.find(id.to_i).update_attributes(
					:flag=> 0,
					:version=> Dtable.find(id.to_i).version + 1,
					:title=> input.title,
					:notes=> input.notes,
					:input_list=> input.input_list,
					:input_state=> input.input_state,
					:rule_list=> input.rule_list,
					:input_rules=> input.input_rules,
					:output_rules=> input.output_rules,
					:output_list=> input.output_list
				)
				ver = Dtable.find(id.to_i).version
			end
			p id.to_i
			p ver
			return "#{id.to_i},#{ver}"
		end
	end

end
		
module PLCDTbl::Views
	
	def layout
		html {
			head {
				title 'PLC Decision Table'
				link :rel => 'stylesheet', :type => 'text/css', :href => 'http://localhost:3301/Static/css/plc_dtbl.css', :media => 'all'
				script :type=>'text/javascript', 	:src=> 'http://localhost:3301/Static/js/jquery.js'
				script :type=>'text/javascript', 	:src=> 'http://localhost:3301/Static/js/plc_dtbl.js'
			}
			body { self << yield }
		}
	end
	
	def index
		h2{'PLC Decision Table Builder'}
		table(:class=>'size9'){
			tr{ th(:colspan=> 2){'Options'}}
			tr{ td(:colspan=> 2){ 
				a( 'Create a new decision table', :href=> R( TableServ )) + 
				' or open an existing one...'
			}}
			tr{ th{'ID'} + th{'Title'}}
			@tables.each{ |tbl|
				tr{
					td{ tbl.id}
					td{ a( tbl.title, :href=> R( TableServ, tbl.id ))}
				}
			}
		}
	end
	
	def decision_table
		div(:id=>'menus'){ _menu + hr }
		div( :id=>'details', :style=>'display:none;'){ _detail( @table.notes)}
		div( :id=>'tables'){ _table( @table)}
		p( :id=>'notify', :style=> 'display:none;'){ 'Table Saved'}
	end
	
	def _menu
		table{
			tr{
				td{ a('Select Table', :href=> R( Index ))}
				td{ a('Save Table',:href=>'', :onclick=>'javascript:SaveTable(); return false;')}
				td{ a('Save as New Table',:href=>'', :onclick=>'javascript:SaveAsNewTable(); return false;')}
				td{ a('Details',:href=>'', :OnClick=> 'JavaScript:Detail_Show();return false;')}
				td{ a('Stop Scan',:href=>'javascript:fix_it();') + label{'['} + label( :id=>'scan_count' ){"0"} + label{']'}}
			}
		}
	end
	def _detail( tbl_notes)
		csk = 4
		table(:class=> 'less_bold'){
			tr{ td(:colspan=> csk, :style=>'font-size: 2.0em; font-style: bold;'){'Table Details: ' + a('Done' , :href=>'', :OnClick=> 'JavaScript:Detail_Hide();return false;', :style=>'font-size: 0.65em;')}}
			tr{ td(:colspan=> csk){ 'Title: ' + input(:id=> 'edit_title', :type=> :text, :size=> 80, :value=>'')}}
			tr{ td(:colspan=> csk){ 'Notes:' + br + textarea(tbl_notes, :name=> 'tbl_notes', :cols => 65, :rows => 10)}}
			
			tr{ td(:colspan=> csk, :style=>'font-size: 2.0em; font-style: bold;'){'Logic Details: ' + a('Generate Logic' , :href=>'', :OnClick=> 'JavaScript:Generate_PLC_RLL();return false;', :style=>'font-size: 0.65em;')}}
			tr{ td{ 'Input Add:'} + td{ 'Rules Add:'} + td{ 'Enable Add:'} + td{ 'Output Add:'} }
			tr{
				td{ input(:id=> 'code_i_prefix', :type=> :text, :size=> 5, :value=>'N10:0')}
				td{ input(:id=> 'code_r_prefix', :type=> :text, :size=> 5, :value=>'N10:1')}
				td{ input(:id=> 'code_e_prefix', :type=> :text, :size=> 5, :value=>'N10:2')}
				td{ input(:id=> 'code_o_prefix', :type=> :text, :size=> 5, :value=>'N10:3')}
			}
			tr{ td(:colspan=> csk, :style=>'background: white;'){''}}
			tr{ td(:colspan=> csk){'First the input mapping logic, some assembly will be required'}}
			tr{ td(:colspan=> csk, :id=>'logic1', :style=>'background: white;'){''}}
			tr{ td(:colspan=> csk){'Then the rule decoding logic'}}
			tr{ td(:colspan=> csk, :id=>'logic2', :style=>'background: white;'){''}}
			tr{ td(:colspan=> csk){'And finally the output mapping logic, some assembly may be required'}}
			tr{ td(:colspan=> csk, :id=>'logic3', :style=>'background: white;'){''}}
			tr{ td(:colspan=> csk){'Or grab the last 2 rungs together (rules and outputs)'}}
			tr{ td(:colspan=> csk, :id=>'logic4', :style=>'background: white;'){''}}
			tr{ td(:colspan=> csk){'Or all 3 rungs together (inputs, rules, outputs)'}}
			tr{ td(:colspan=> csk, :id=>'logic5', :style=>'background: white;'){''}}
			tr{ td(:colspan=> csk){'And last but not least the PLC Comments'}}
			tr{ td(:colspan=> csk, :id=>'logic6', :style=>'background: white;'){''}}
		}
	end
	
	def _table(decision_table_record)
		dt = decision_table_record
		rule_cnt = dt.rule_list.split(',').length
		input_cnt = dt.input_list.split(',').length
		output_cnt = dt.output_list.split(',').length
		table( :id=>'main_table', :class=> 'main_table' ){
			tr{ th(:id=>'table_title', :colspan=> 3){dt.title}}
			tr{
				th(:class=>'less_bold', :colspan=>2){
					label{'ID: '} +
					label(:id=>'table_id'){dt.id} +
					label{', Version: '} +
					label(:id=>'table_version'){dt.version}
				}
				th{
					'Rules ' +
					a('Insert',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Add_Rule();return false;') +
					a('Remove!',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Remove_Rule();return false;') +
					a('Renumber!',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Renumber_Rules();return false;')
				}
			}
			tr{
				th( :colspan=>2 ){
					'Inputs ' +
					a('Insert',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Add_Input();return false;') +
					a('Remove!',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Remove_Input();return false;')
				}
				td{ table(:id=> 'rule_id', :class=> 'Fcell'){ tr{ _rule_list( dt.rule_list )}}}
			}
			tr{
				td{ table(:id=>'input_list', :class => 'Flist'){ _input_list( dt.input_list )}}
				td{ table(:id=>'input_state', :class=> 'Fcell'){ _input_state( dt.input_state) }}
				td{ table(:id=>'input_rules', :class=>'Fcell'){ _input_rules( dt.input_rules, input_cnt, rule_cnt ) }}
			}
			tr{
				th( :colspan=>2 ){
					'Outputs ' +
					a('Insert',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Add_Output();return false;') +
					a('Remove!',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Remove_Output();return false;')
				}
				td{ table( :id=> 'input_rules_state' , :class=> 'Fcell' ){ tr{ _input_rules_state( rule_cnt ) }}}
			}
			tr{
				td{ table(:id=>'output_list', :class => 'Flist'){ _output_list( dt.output_list )}}
				td{ table(:id=>'output_state',:class => 'Fcell'){ _output_state( output_cnt)}}
				td{ table(:id=> 'output_rules', :class=>'Fcell'){ _output_rules( dt.output_rules, output_cnt, rule_cnt )}}
			}
		}
	end
	def _input_list(list)
		list.split(',').each{ |r| tr{ td{r}}}
	end
	def _input_state(str)
		(0..str.length-1).each{|e| tr{td{str[e].chr}}}
	end
	def _rule_list(list)
		list.split(',').each{ |r| td{r} }
	end
	def _input_rules(rules_str, row_cnt, col_cnt)
		(0..row_cnt-1).each{|row_idx|
			tr{
				(0..col_cnt-1).each{|col_idx|
					val = rules_str[col_idx + (row_idx * col_cnt)]
					val = 32 if val.nil?
					td{val.chr}
				}
			}
		}
	end
	def _input_rules_state(cnt)
		cnt.times{ td{' '} }
	end
	def _output_rules(rules_str, row_cnt, col_cnt)
		(0..row_cnt-1).each{|row_idx|
			tr{
				(0..col_cnt-1).each{|col_idx|
					val = rules_str[col_idx + (row_idx * col_cnt)]
					val = 32 if val.nil?
					td{val.chr}
				}
			}
		}
	end
	def _output_state(len)
		(0..len-1).each{|e| tr{td{'0'}}}
	end
	def _output_list(list)
		list.split(',').each{ |r| tr{ td{r}}}
	end
	
end

def PLCDTbl.create ; PLCDTbl::Models.create_schema ; puts '==> PLCDTbl (PLC Decision Table) loaded' ;end
