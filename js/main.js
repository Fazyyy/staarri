$(function() {

  // initial streams to display
  var streamers = [ "staarri" ];

  // retrieves json data from the twitch.tv api and builds a stream object which is then inserted into the DOM
  function getTwitchInfo(channelName) {

    // default stream values
    var stream = {
      name: channelName,
      status: "",
      logo: "https://jpk-image-hosting.s3.amazonaws.com/twitch-app/no-image-available.jpg",
      link: "#",
      viewers: ""
    }

    // assemble the twitch.tv api url
    function buildUrl(type, name) {
      return "https://api.twitch.tv/kraken/" + type + "/" + name + "?client_id=yp5cwnv8pm3m08yzvhmrp1r8b68rmi&callback=?";
    }

    // make ajax call to twitch.tv api
    $.getJSON(buildUrl("streams", channelName), function(streamData) {
      // if the streamer is not online, the data must be obtained from the channel
      if (streamData.stream === null) {
        $.getJSON(buildUrl("channels", channelName), function(channelData) {
          stream.name = channelData.display_name;
          stream.status = "offline";
          stream.logo = channelData.logo || "https://jpk-image-hosting.s3.amazonaws.com/twitch-app/no-image-available.jpg";
          stream.link = channelData.url;
          // insert this stream into the DOM
          insertStream(stream);
        });
      // if no account exists, keep the default stream values except the status
      } else if (streamData.stream === undefined) {
        stream.status = "no account found";
        // insert this stream into the DOM
        insertStream(stream);
      // if the stream is online, get the stream values from the returned json
      } else {
        stream.name = streamData.stream.channel.display_name;
        stream.status = "<span>currently streaming: </span>" + streamData.stream.channel.status;
        stream.logo = streamData.stream.channel.logo || "https://jpk-image-hosting.s3.amazonaws.com/twitch-app/no-image-available.jpg";
        stream.link = streamData.stream.channel.url;
        stream.viewers = "<span>viewers: </span>" + streamData.stream.viewers.toString();
        // insert this stream into the DOM
        insertStream(stream);
      }
    }).fail(error);

    function error() {
      alert("Error connecting to Twitch!");
    }
  } // /getTwitchInfo

  // builds html string from the stream data and inserts it on the page
  function insertStream(stream) {
    var status_class = "";
    var html_to_insert;

    if (stream.status == "offline") status_class = "offline";
    else if (stream.status == "no account found") status_class = "no-account";
    else status_class = "online";

    html_to_insert = "<div class='col stream'><a href='" + stream.link + "' target='_blank'><div class='well " + status_class + "'><div class='overlay'></div><div class='row'><div class='col-xs-12 col-sm-3'><img class='img img-responsive center-block' src='" + stream.logo + "' alt='" + stream.name + "'></div><div class='col-xs-12 col-sm-9'><h2>" + stream.name + "</h2><h3>" + stream.status + "</h3><p>" + stream.viewers + "</p></div></div></div></a></div>";

    if ( status_class == "online" ) {
      $(html_to_insert).prependTo('.js-streams').fadeIn(800);
    } else {
      $(html_to_insert).appendTo('.js-streams').fadeIn(800);
    }
    // set the boxes to equal height after insertion
    eqHeight();
  }  // /insertStream

  // sets all the boxes to the height of the tallest box
  // compensates for bootstrap float and ensures proper layout
  function eqHeight() {
    var winWidth = window.innerWidth;
    var divs = $('.well .row');
    var new_height = 0;
    divs.css("height", "auto");
    if ( winWidth > 768) {
      divs.each(function() {
        if ( $(this).height() > new_height ) {
          new_height = $(this).height();
        }
      });
      divs.css("height", new_height + "px");
    }
  }

  // get the stream info for the initial array of streamers
  streamers.forEach(function(stream) {
    getTwitchInfo(stream);
  });

  // ensure equal height boxes on window resize
  $(window).on("resize", function() {
    eqHeight();
  });

  // form submit retreives and displays a new stream from the twitch.tv api
  $(document).on("submit", "form", function(e) {
    e.preventDefault();
    getTwitchInfo($("input").val());
    $("input").val("");
  });

});
