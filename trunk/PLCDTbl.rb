# Decision Table Builder and Test Tool (for PLC code genertion).
# Version 2 - 6 Oct 2009 - djr.nzl@gmail.com
# Released to the public domain.

# This Ruby Camping App serves up a sample decision table page
# and will form the basis of the Tools back end.

Camping.goes :PLCDTbl

module PLCDTbl::Models

	class Table < Base ; end
	
	class CreateTheBasics < V 0.1
			
		def self.up
			create_table :PLCDTbl_tables, :force => true do |t|
				t.column :id ,	:integer , :null => false
				t.column :flag ,	:integer
				t.column :created_on, :datetime
				t.column :updated_on, :datetime
				t.column :version ,	:integer
				t.column :title ,	:text
				t.column :notes ,	:text
				t.column :inputs ,	:text
				t.column :input_rules ,	:text
				t.column :output_rules ,	:text
				t.column :outputs ,	:text
			end
		end
		
		def self.down
			drop_table :PLCDTbl_tables
		end
		
	end

end

module PLCDTbl::Controllers

	class Index < R '/' , '/index'
		def get
			render :index
		end
	end
	
	class TableServ < R '/table', '/table/(.+)'
		def get cmd = nil
		end
		def post cmd = nil
		end
	end
	
end
		
module PLCDTbl::Views
	
	def index
		html {
			head {
				title 'PLC Decision Table'
				link :rel => 'stylesheet', :type => 'text/css', :href => 'http://localhost:3301/Static/css/plc_dtbl.css', :media => 'all'
				script :type=>'text/javascript', 	:src=> 'http://localhost:3301/Static/js/jquery.js'
				script :type=>'text/javascript', 	:src=> 'http://localhost:3301/Static/js/plc_dtbl.js'
			}
			body {
			
				h2(:id=>'main_title'){'Decision Table (for PLC code generation)'}
				
				table(:id=> 'top_menu', :class=> 'menu'){
					tr{
						td{a('Select Table',:href=>'javascript:fix_it();')}
						td{a('Save Table',:href=>'javascript:fix_it();')}
						td{a('Stop Scan',:href=>'javascript:fix_it();')}
						td{a('Details',:href=>'', :OnClick=> 'JavaScript:Show_Details();return false;')}
						td{a('Generate Code',:href=>'javascript:fix_it();')}
					}
				}
				
				h3(:id=>'sub_title'){'Design and test - example'}
				
				div(:id=>'detail_div'){_details}
				
				table(:id=>'main_table', :class=> 'main_table'){
					tr{
						th(:colspan=>2){'Decision Table'}
						th(:colspan=>2){
							'Rules ' +
							a('Insert',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Add_Rule();return false;') +
							a('Remove!',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Remove_Rule();return false;') +
							a('Renumber!',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Renumber_Rules();return false;')
						}
					}
					tr{
						th(:colspan=>2){
							'Inputs ' +
							a('Insert',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Add_Input();return false;') +
							a('Remove!',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Remove_Input();return false;')
						}
						td{_rules}
					}
					tr{
						td{_input_list}
						td{_input_state}
						td{_input_rules}
					}
					tr{
						th(:colspan=>2){
							'Outputs ' +
							a('Insert',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Add_Output();return false;') +
							a('Remove!',:href=>'', :class=>'tbl_menu', :OnClick=>'javascript:Remove_Output();return false;')
						}
						td{_input_rules_state}
					}
					tr{
						td{_output_list}
						td{_output_state}
						td{_output_rules}
					}
				}
				p(:id=>'scan_count'){'Not scanning - trouble with JS'}
			}
		}
	end
	
	def _details
		h3{ 'Decision table details - ' + a('done' , :href=>'', :OnClick=> 'JavaScript:Hide_Details();return false;')}
		p{'Main title: ' + input(:id=> 'main_title_in', :type=> :text, :size=> 45, :value=>'')}
		p{'-Sub title: ' + input(:id=> 'sub_title_in', :type=> :text, :size=> 45, :value=>'')}
		p{'Notes: ' + br + textarea('Notes', :name => 'notes', :cols => 45, :rows => 10)}
	end
	
	def _rules
		table(:id=>'rule_id', :class=>'Fcell'){ tr{ td{'0'} } }
	end
	
	def _input_list
		table(:id=>'input_list', :class => 'Flist'){ tr{ td{'Automatic'} } }
	end

	def _input_state
	table(:id=>'input_state', :class=> 'Fcell'){ tr{ td{0} } }
	end
	
	def _input_rules
		table(:id=>'input_rules', :class=>'Fcell'){ tr{td{'1'}} }
	end
	
	def _input_rules_state
		table(:id=>'input_rules_state' , :class=> 'Fcell'){ tr{td{' '}} }
	end
	
	def _output_rules
		table(:id=> 'output_rules', :class=>'Fcell'){ tr{ td{'0'} } }
	end

	def _output_state
	table(:id=>'output_state',:class => 'Fcell'){ tr{ td(:class=> 'Fcell'){''} } }
	end
	
	def _output_list
		table(:id=>'output_list', :class => 'Flist'){ tr{ td{'Automatic'}} }
	end
	
end

module PLCDTbl::Helpers
	def css_main
	end
end

def PLCDTbl.create ; PLCDTbl::Models.create_schema ; puts '==> PLCDTbl (PLC Decision Table) loaded' ;end
