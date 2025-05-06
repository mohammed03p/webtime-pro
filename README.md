 WebTime Pro

**WebTime Pro** is a Chrome extension designed to help users maximise their productivity on the internet. It offers tools to track time spent on websites, categorise them as productive or unproductive, block distracting sites, display grpahs of users time spent on unproductive and productive websites and set personal goals.

## Features

-  Automatically tracks visited websites
-  Categorise websites as productive or unproductive
-  Block distracting websites manually or based on category
-  Analytics with graphs for productivity tracking
-  Goal setting and progress tracking with charts
-  Sends alerts when spending too much time in one go on an unproductive site.

##  Tech Stack

- JavaScript
- Vue.js
- Chart.js
- Chrome Extensions API

##  Setup Instructions

 IMPORTANT NOTE: Users must have Git and Node.js installed before testing the extension

1. Clone the repository:
   
   git clone https://github.com/mohammed03p/webtime-pro.git
 
2. Change in to the webtime-pro directory:

   cd webtime-pro
   
4. Install dependencies:

   npm install

6. Build the extension:

   npm run build

8. Load it into Chrome:

   Go to chrome://extensions,
   Enable Developer Mode,
   Click Load unpacked,
   Select the Webtime Pro folder


**If extension fails to load:**

   Upon running npm run build in your terminal you will see two files have been generated:

   they will look something like this: main-XXXXXX.js and main-XXXXX.css.

   please check in your webtime pro folder, in the dist folder if they are the same

   if they are different, then open up popup.html in your code editor

   and replace the main-XXXXX.js file from ur terminal with the main-XXXX.js file that is shown in the popup.html file

   and repeat the same for the main-XXXX.css files.



   This issue only occured once duirng user testing, 9 users had no problems with this only 1 did. This was the the way to fix.






    
Notes
Changes made in the source files must be rebuilt with npm run build before loading into Chrome.

Made by Mohammed Patel
