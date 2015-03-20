### Decision tables are useful for implementing some industrial process controls. ###

This tool is to assist in the designing, testing and code generation for simple decision tables implemented in RLL for PLC's (Programmable Logic Controllers).

See [Wikipedia](http://en.wikipedia.org/wiki/Decision_table) for more information about decision tables.


---

### Version 4.1 ###

Nov 20 2008

Fixes javascript problems esp for IE.
This app (the javascript) will only run on Internet Explorer 6 or better.
Runs on Firefox 3 and Chrome.


---

### Version 4 ###

Nov 17 2008

_Have worked this up to the point of being usable, for my current needs anyway. I had a job that looked like a candidate for some decision tables. Using this tool I have worked them up, pasted the generated RLL into a PLC and tested it and will put it in the production PLC shortly. I have also (to my local workstation) imported 4 previous version that were developed in the original spreadsheet version. All good._

_There are still some bugs that I am working on. And more to add. I hope to use this tool more often in my work, because its easy to design and test some controls and then to send the design to others for testing, all they need is a browser._

**There is a major bug (I had better fix that now) - it does not run in IE.**

I think this problem is related to the timerInterval() JS command or whatever it is, and that IE does not support it, its all very odd, there is a timer event that IE does - I will try that. I developed, tested and used Google Chrome, and checked it in FireFox, it sizes a little differently but worked ok. This is the biggest JS app I have done so am learning new things.

**What's new in Version 4**

  * Added code generation, for AB PLC5 SLC500 only.
  * Generate PLC comments based on Input and Output text.
  * Got a camping server up and running that serves up the decision table pages and accepts post's for saving, the posts are sent by ajax.
  * Tidied up the structure of the html, js and ruby.
  * Added to the downloads a saved version of a new decision table as served by the camping server.

raygun

---

### Version 3 ###

Added drag and drop to the inputs, rules and outputs, this makes it easier to arrange the tables parts in some sort of order.

Changed the way I solved the table in plcdt.js and generally tidied that up.
Changed the camping app to that it serves up a generic blank table.

These change motivated by the need to use this tool to provide a solution to a problem at work. So expect to see some more updates soon.

Next to do - add to the camping app so I can post to it, I am just thinking what to post, I think maybe the $().text() from each of the tables.

Then one last thing and that the code generator.

**NOTE:** The download is the initial page server by the camping app as seen in Google Chrome, and saved as... To get the full application (camping app, js and css) goto the Source tab and browse the repository (here [trunk](http://code.google.com/p/plc-decision-table-builder/source/browse/#svn/trunk)).


---

### Version 2 Alpha Bravo Release ###

This tool is usable. But lacks the RLL code generation and server back end.
It's one redeeming feature is the visual way in which the decision table are tested.

Snapshot of Version 2.

![http://plc-decision-table-builder.googlecode.com/svn/wiki/static/2008-10-10_130922.jpg](http://plc-decision-table-builder.googlecode.com/svn/wiki/static/2008-10-10_130922.jpg)

  * Changed from a spreadsheet based tool to a web app based tool.
  * Most of the work is done in javascript, client side.
  * The server just serves up the initial index page and via ajax the data for each page or decision table.
  * Way easier to use (than spreadsheet model).
  * _Lost DDE/OPC connectivity to live data to drive the inputs directly, which is great for looking at a decision table in real time._

See README.txt in the package for more info.
Further code (RLL generator next) updates pending.

Enjoy.
Raygun.

---

### Deprecated - Version 1 [Revision 2](https://code.google.com/p/plc-decision-table-builder/source/detail?r=2) ###

This simple spreadsheet, a template, and it's associated VBA helpers make it easier to design a simple decision table (16 inputs, 16 rules, 16 outputs) and to test it in a visual way by simulating various inputs and observing the outputs.

Once the design is ready - a VBA function creates the PLC logic (RLL) to implement the decision table (some assembly required).

The novel part is the ability to interactively test the design while building it.

  * See the project wiki for more information.
  * View the only help (a short (10 min) desktop video).
  * Modify the design and VBA to suit your uses.
  * Suggest changes and improvements.

Enjoy.
Raygun

---
