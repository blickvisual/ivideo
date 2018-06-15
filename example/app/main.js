$(document).ready(function() {

  //Calculate iFrame height
  recalculateiFrameHeight();

  function open_map(e)
  {
    $("#modal_map").fadeIn();
  }

  //$(window).resize(recalculateiFrameHeight);

  var iVid = new iVideo({
    "container": "#ivideo_container",
    "json": "app/data.json",
    "functions": [open_map],
    "ready": function(self) {
      recalculateiFrameHeight();
      $(".loader").hide();
    }
  });

  iVid.on("play", function(e) {
    if(e == 'hauptmenu')
    {
      $(".button_return").hide()
    }
    else if(e == 'intro')
    {
      $("#button_return_forward").show();
    }
    else
    {
      $("#button_return_back").show();
    }
  });

  $(".button_return").on("click", function() {
    iVid.play("hauptmenu");
  });

  $(".close").on("click", function() {
    $("#modal_map").fadeOut();
    iVid.play("hauptmenu");
  });

  $(".poster").on("click", function() {
    $(".poster").hide()
    $("#ivideo_container").show();
    iVid.play("intro");
    //iVid.play("hauptmenu");
  });
});

function recalculateiFrameHeight()
{
  try
  {
    var path = window.location.pathname.replace(/[\\\/][^\\\/]*$/, '');
    var height = Math.round($(document).width() / 16 * 9);
    $("iframe[src*='" + path + "']" , parent.document).css("height", height);
    $("iframe[src*='" + path + "']", parent.document).attr("height", height);
  }
  catch(e)
  {
    console.log(e);
  }
}