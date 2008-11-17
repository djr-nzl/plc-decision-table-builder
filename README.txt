PLC Decision Table Design and Test Tool.

h3. Version 4 - Nov 17 2008

Have worked this up to the point of being usable, for my current needs anyway.
I had a job that looked like a candidate for some decision tables.
Using this tool I have worked them up, pasted the generated RLL into a PLC and tested it and will put it in the production PLC shortly.
I have also (to my local workstation) imported 4 previous version that were developed in the original spreadsheet version. All good.

There are still some bugs that I am working on.
And more to add. I hope to use this tool more often in my work, because its easy to design and test some controls and then to send the design to others for testing, all they need is a browser.

There is a major bug (I had better fix that now) - it does not run in IE.

I think this problem is related to the timerInterval() JS command or whatever it is, and that IE does not support it, its all very odd, there is a timer event that IE does - I will try that. I developed, tested and used Google Chrome, and checked it in FireFox?, it sizes a little differently but worked ok. This is the biggest JS app I have done so am learning new things.

What's new in Version 4

* Added code generation, for AB PLC5 SLC500 only.
* Generate PLC comments based on Input and Output text.
* Got a camping server up and running that serves up the decision table pages and accepts post's for saving, the posts are sent by ajax.
* Tidied up the structure of the html, js and ruby.
* Added to the downloads a saved version of a new decision table as served by the camping server.

h3. Version 3 - 6 November 2008

# Added drag and drop
# Tidied the JS

h3. Version 2 - 6 October 2008

Alpha Centrus release.

Usable as a toy - no code generation.

**To do**
# Code generator.
# Drag and drop for rearranging inputs, outputs and rules.
# Server back end with ajax save and load - using camping app.
# Rule description popup.
# Turn Scanner on and off and change scan time.
# Other stuff.

See http://code.google.com/p/plc-decision-table-builder/ for more information.

This app uses jQuery.
See http://docs.jquery.com/ for more information.

The file PLCDTbl.rb is a Camping App, camping is a micro frame work by _why the lucky stiff in Ruby.
See http://camping.rubyforge.org/ for more information.

A camping app needs Ruby and everone has Ruby installed, right?
See http://www.ruby-lang.org/en/

For Windows there is a 1 click installer.
Once its installed break open a command line thing, a command shell.
And type in something like gem install camping
You may need to install a few other gems - I will update this list soon.

More to follow.

The 3 files making up this app are free, they are yours already.
# PLCDTbl.rb
# plc_dtbl.css
# plc_dtbl.js

a 4th file, a dependency, jquery.js has its own licensce - please read it - its in the file.

Raygun
djr.nzl@gmail.com
