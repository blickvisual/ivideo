Interactive Videos (iVideo)
==========

Lightweigt js-library to create interactive videos

Working example: http://www.blick.ch/8498934

## Requirements
* jQuery

## Documentation
html structur
```html
  <html>
    <head>
      <script type="text/javascript" src="app/interactivevideo.min.js"></script>
      <link type="text/css" rel="stylesheet" href="app/interactivevideo.min.css">
    </head>
    <body>
      <div id="ivideo_container"></div>
    </body>
  </html>
```

## Initialization
Create new `iVideo` object by: `var iVid = new iVideo(options)`
Example:
```javascript
  var iVid = new iVideo({
    "container": "#ivideo_container",
    "json": "app/data.json",
    "fadercolor": "#ffffff",
    "functions": [my_function],
    "ready": function(self) {
      //Callback, when ready
    }
```

### Options
* `container` References the DOM-Element (#ivideo_container)
* `json` Json object or path to json file
* `fadercolor` (optional). Color for fading. Default: #000000
* `functions` (optional) If you have defined some function in the json object, you have to tell iVideo the name of these functions
* `read` (optional) Callback, when iVideo is ready

## Start a chapter
```javascript
  iVid.play("main");
```

## Events
Register with `on`
```javascript
  iVid.on("play", function(e) {
    console.log("Video started", e);
  });
```

### Events
* `play`. Start of the video
* `function` When a function is called

## JSON Object
Example. This configuration contains a video played in loop. A click on the middle ball will lead you another video (`video_1`). A click on the right ball will call the function `my_function`, which will show an alert box and plays the first video again.
```js
{
  "chapters": [
    {
      "id": "hauptmenu",
      "src": "media/hauptmenu.mp4",
      "onfinished": "loop",
      "overlays": [
        {
          "position": ["0%", "0%"],
          "dimension": ["100%", "100%"],
          "href": "video_1",
          "hover": "overlay_1.png"
        },
        {
          "position": ["17%", "19%"],
          "dimension": ["24%", "80%"],
          "href": "video_2",
          "hover": "overlay_2.png"
        }
      ]
    },
    {
      "id": "video_1",
      "src": "video1.mp4",
      "onfinished": "goto",
      "goto": "hauptmenu"
    },
    {
      "id": "video_2",
      "function": "my_function"
    }
  ]
}
```
### Chapters
Each new element - video or function - id a `chapter`.
Each chapter needs the following property:
* `id` Unique id (or name). Referenced by `href` and `goto`

### Optional chapter properties
A chapter can have the following properties

* `src` path to video file
* `onfinished` What should happends after the video ends. Options: `loop`, `goto` oder empty
  * `loop` Play the video again (loop)
  * `goto` Jump to another chapter. The chapter is defined by property `goto`
* `goto` If `onfinish` set to `goto`, jump to this chapter
* `overlays` Array. Clickable area on video. See chapter "Overlays"
* `function` Calls this function. The function has to be defined on initialization. See `functions` at the beginning of this file.

### Overlays
An overlay is a clickable area
* `position` Array. top, left. Write in percent, otherwise the video will not be responsive!
* `dimension` Array. width, height. Write in percent, otherwise the video will not be responsive!
* `href` If a chapter should be called after click, add here the `id` of the `chapter`
* `hover` Image on mouse over. Needs the same dimension as the video