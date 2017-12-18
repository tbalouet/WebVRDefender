# WebVRDefender
A game project to show adaptive gameplay on multiple devices over WebVR


Getting started
------------------------------
 ```sh
git clone https://github.com/tbalouet/WebVRDefender.git  # Clone the repository.
cd WebVRDefender
npm install # Install dependencies.
npm run start  # Start the server on http://localhost:3000
```

How was it build?
------------------------------
See the medium post [Making the WebVR Game at MozFest](https://medium.com/mozilla-festival/making-the-webvr-game-at-mozfest-70fea3f06e66).
![preview](https://cdn-images-1.medium.com/max/2000/1*t2S40Eurw_llOEHKZyXL3Q.png)

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

* 3D models
  * winter theme by Aime Tribolet
* Sounds from soundbible (see respective author)
  * http://soundbible.com/1810-Wind.html
  * http://soundbible.com/1771-Laser-Cannon.html
  * http://soundbible.com/1033-Zombie-In-Pain.html
  * http://soundbible.com/2127-Dragon-Fire-Breath-and-Roar.html
