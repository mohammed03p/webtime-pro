 WebTime Pro

**WebTime Pro** is a Chrome extension designed to help users maximise their productivity on the internet. It offers tools to track time spent on websites, categorise them as productive or unproductive, block distracting sites, and set personal goals.

## Features

-  Automatically tracks visited websites
-  Categorise websites as productive or unproductive
-  Block distracting websites manually or based on category
-  Analytics with graphs for productivity tracking
-  Goal setting and progress tracking with charts

##  Tech Stack

- JavaScript
- Vue.js (Options API)
- Bootstrap
- Chart.js
- Chrome Extensions API

##  Setup Instructions

1. Clone the repository:
   
   git clone https://github.com/mohammed03p/webtime-pro.git
   cd webtime-pro
   
Install dependencies:
npm install

Build the extension:
npm run build

Load it into Chrome:
Go to chrome://extensions
Enable Developer Mode
Click Load unpacked
Select the dist folder

Project Structure
src/
├── App.vue
├── AnalyticsTab.vue
├── GoalsTab.vue
├── main.js
└── ...
public/
manifest.json
dist/


Notes
Changes made in the source files must be rebuilt with npm run build before loading into Chrome.

Made by Mohammed Patel
