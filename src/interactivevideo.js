function iVideo(_options)
{
  this.options = _options;
  this.container = $(_options.container);
  this.video = null;
  this.events = [];

  var self = this;
  //Check if json is object or url
  if(typeof _options.json === 'object')
  {
    //Is Object
    self.data = _options.json;
    self.prepare();
    $("#ivideo_loader").hide();
    if(self.options.ready)
      self.options.ready(self);
  }
  else
  {
    //Is url
    $.getJSON(_options.json, function(data) {
      self.data = data;
      self.prepare();
      $("#ivideo_loader").hide();
      if(self.options.ready)
        self.options.ready(self);
    });
  }
}

iVideo.prototype.on = function(_event, _callback)
{
  this.events.push([_event, _callback]);
}

iVideo.prototype.hasProperty = function(_object, _property)
{
  return _object.hasOwnProperty(_property) && _object[_property].length > 0;
}

iVideo.prototype.play = function(_chapter)
{
  //Display Fader
  $("#ivideo_loader").show();
  
  //store variables
  var chapter = this.findChapterById(_chapter);

  //Cleanup
  this.video.attr("loop", false);
  this.clearOverlay()

  //Has function property
  if(this.hasProperty(chapter, "function"))
  {
    //Stop Video
    self.video[0].pause();

    var found = false;
    $("#ivideo_loader").hide();
    this.options.functions.forEach(function (e) {
      if(e.name == chapter.function)
      {
        //Call Callback asynchron
        setTimeout(function() {
          e(chapter);
        }, 0);    
        found = true;
        return;
      }
    });
    if(!found)
      throw "Function " + chapter.function + " not found";
  }

  //Add pointer event for pause click
  $("#ivideo_overlay").css("pointer-events", "none");

  //has Overlays
  if(this.hasProperty(chapter, "overlays"))
  {
    this.createOverlay(chapter);
  }

  //has Video (src)
  if(this.hasProperty(chapter, "src"))
  {
    this.replaceVideo(chapter);
    this.playCurrentVideo(_chapter);
  }
}

iVideo.prototype.replaceVideo = function(_chapter)
{
  $("video source", this.container).attr("src", _chapter.src);
  this.video.data("id", _chapter.id);

  //if onfinished = loop, add loop flag
  if(_chapter.onfinished == "loop")
  {
    this.video.attr("loop", true);
  }
}

iVideo.prototype.playCurrentVideo = function(_chapter)
{
  this.video[0].load();
  this.video[0].play();
  this.fadeIn();

  //Call callback
  if(this.findCallbackByName('play'))
    this.findCallbackByName('play')(_chapter);

}

iVideo.prototype.prepare = function()
{
  self = this;

  //Add Videoelement to html
  var html_template = $('<div id="ivideo_loader"></div>'
    + '<div id="ivideo_fader" class="ivideo_full_frame" style="display:none"></div>'
    + '<div id="ivideo_overlay" class="ivideo_full_frame"></div>'
    + '<video width="100%" height="100%" playsinline>'
    + '  <source src="" type="video/mp4">'
    + '</video>');
  this.container.append(html_template);

  //store variable
  this.video = $("video", this.container);

  //set fader color
  var color = this.options.fadercolor ? this.options.fadercolor : "#000000";
  $("#ivideo_fader").css("background-color", color);

  //register onend event
  this.video[0].onended = function() {
    self.fadeOut(function() {    
      var chapter = self.findChapterById(self.video.data("id"));
      
      //decide next action
      if(chapter.onfinished == "goto")
      {
        //Play next Video
        self.play(chapter.goto);
      }
    });
  }

  //register onstart event
  this.video[0].onplay = function() {
    $("#ivideo_loader").hide();
  }

  this.video.on("click", function() {
    if(self.video[0].paused)
      self.video[0].play()
    else
      self.video[0].pause();
  })
}

/*
  Fader ------------------------------------------------
  Fader ist Fake. Video wird nicht ausgeblendet, sondern Fläche darübergelegt
*/

iVideo.prototype.fadeOut = function(_callback)
{
  $("#ivideo_fader", this.container).fadeIn(200, _callback);
}

iVideo.prototype.fadeIn = function(_callback)
{
  $("#ivideo_fader", this.container).fadeOut(300, _callback);
}

  /*
    Overlay ------------------------------------------------
  */

 iVideo.prototype.clearOverlay = function()
{
  $("#ivideo_overlay").empty();
}

iVideo.prototype.createOverlay = function(_chapter)
{
  //Clear Overlay
  this.clearOverlay()

  //Remove Pointer event from child (need this, to detect click on video to pause video)
  $("#ivideo_overlay").css("pointer-events", "inherit");

  //Loop overlays
  _chapter.overlays.forEach(function (e) {
    //Create container div
    var layer = $("<div class='ivideo_layer'>");
    //Create Hover
    var hover = $("<div class='ivideo_hover ivideo_full_frame'></div>");
    hover.css("background-image", "url(" + e.hover + ")")
          .css("background-repeat", "no-repeat")
          .css("background-size", "cover");
    layer.append(hover);
    
    //Prepare linkbox
    var linkbox = $("<div class='ivideo_linkbox'></div>")
    linkbox.data("href", e.href);
    linkbox.css("top", e.position[0]).css("left", e.position[1]);
    linkbox.css("width", e.dimension[0]).css("height", e.dimension[1]);
    layer.append(linkbox)

    //Add Link box
    $("#ivideo_overlay", this.video).append(layer);
  });

  //Register events
  $(".ivideo_linkbox").off("click");
  var self = this;
  $(".ivideo_linkbox").on("click", function(e) {
    self.fadeOut(function() {
      var href = $(e.target).data("href");
      if(href)
        self.play(href);
    });
  });

  $(".ivideo_linkbox").off("mouseenter");
  $(".ivideo_linkbox").on("mouseenter", function(e) {
    var hover = $(".ivideo_hover", $(e.target).parent());
    if(hover)
      hover.show();
  });

  $(".ivideo_linkbox").off("mouseleave");
  $(".ivideo_linkbox").on("mouseleave", function(e) {
    var hover = $(".ivideo_hover", $(e.target).parent());
    if(hover)
      hover.hide();
  });
}

  /*
    Helpers ------------------------------------------------
  */

iVideo.prototype.findCallbackByName = function(_callback)
{
  var r = null;
  this.events.forEach(function(e) {
    if(e[0] == _callback)
      r = e[1];
      return
  });
  return r;
}

iVideo.prototype.findChapterById = function(_chapter)
{
  var r = null;
  this.data.chapters.forEach(function(e) {
    if(e.id == _chapter)
    {
      r = e;
      return;
    }
  });

  //no chapter found
  if(!r)
    throw _chapter + " not found";

  return r;
}