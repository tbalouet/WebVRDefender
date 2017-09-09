# WebVRDefender
A game project to show adaptive gameplay on multiple devices over WebVR


Getting started
------------------------------
 ```sh
git clone https://github.com/tbalouet/WebVRDefender.git  # Clone the repository.
cd WebVRDefender
npm install # Install dependencies.
npm run dev  # Start the local development server on http://localhost:3000
```

Javascript bundling
------------------------------
This project uses browserify. Once the server launched, it automatically bundles the files required from /client/js/main.js

The bundled file is /public/js/script.js

To add a file, you need to add ``require("/path/to/my/file.js");``
If you want to import a class, the class file will need to have ``module.exports = MyClassName`` at the end of it, then you can use 
```
var MyClass = require("/path/to/my/class.js");
var obj = new MyClass();
```

Folder Structure
----------------

 * `/ (root)`
   * Licenses and package information
   * server.js as the main server file
 * `/client/js`
   * Javascript files split up in classes
 * `/client/js/components`
   * AFrame-VR components developed for the project
 * `/public/`
   * static files
 * `/public/assets`
   * multimedia files
 * `/public/assets/icons`
   * web page icons
 * `/public/assets/images`
   * image folder
 * `/public/assets/models`
   * 3D models files
 * `/public/js`
   * javascript files used in the Web app. Contains script.js which is the compiled version of client/js/main.js
 * `/public/styles`
   * css files
 * `/views/`
   * ejs template files folder. Contains index.ejs, main file of the Web App

Attributions
----------------

3D models in winter theme by Aime
Sounds
  http://soundbible.com/1810-Wind.html
  http://soundbible.com/1771-Laser-Cannon.html
  http://soundbible.com/1033-Zombie-In-Pain.html

