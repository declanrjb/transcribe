function addChildClassed(parent,newClass,tag='div') {
    var newDiv = document.createElement(tag);

    var classes = newClass.split(' ')
    for (var i=0; i<classes.length; i++) {
        newDiv.classList.add(classes[i]);
    }

    parent.appendChild(newDiv);
    return newDiv;
}

function showSelected() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function toMinutes(duration) {
    duration = Math.round(duration);
    var seconds = duration % 60;
    seconds = seconds.toString();
    if (seconds.length < 2) {
        seconds = '0' + seconds
    }

    var minutes = Math.floor(duration / 60);
    return minutes + ':' + seconds
}

$(function() {

    var records = {
        'notes': []
    }

    const transcript = document.querySelector('.transcript');
    var comments = document.querySelector('.comments');

    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', '../data/audio_sample.m4a');
    
    audioElement.addEventListener('ended', function() {
        this.play();
    }, false);
    
    audioElement.addEventListener("canplay",function(){
        $("#length").text(" / " + toMinutes(audioElement.duration));
        $("#source").text("Source:" + audioElement.src);
        $("#status").text("Status: Ready to play").css("color","green");
    });
    
    $('#play').click(function() {
        audioElement.play();
        $("#status").text("Status: Playing");
        $('#pause').css('display', 'inline');
        $(this).css('display', 'none');
    });
    
    $('#pause').click(function() {
        audioElement.pause();
        $("#status").text("Status: Paused");
        $('#play').css('display', 'inline');
        $(this).css('display', 'none');
    });
    
    $('#restart').click(function() {
        audioElement.currentTime = 0;
    });

    d3.json('../transcript.json')
    .then(data => { 
        data = data['segments']
        var block;

        block = addChildClassed(transcript, 'text-block' + ' ' + 'speaker-' + currentSpeaker, tag='p');
        var currentSpeaker = data[0]['speaker']
        var prevSpeaker = null;
        for (var i=0; i<data.length; i++) {
            var segment = data[i];
            currentSpeaker = segment['speaker'];
            if (currentSpeaker != prevSpeaker) {
                var speakerHeading = addChildClassed(transcript, 'speaker-label ' + currentSpeaker, div='input')
                speakerHeading.textContent = currentSpeaker
                $(speakerHeading).attr('type', 'text')
                $(speakerHeading).attr('value', currentSpeaker)
                $(speakerHeading).attr('id', currentSpeaker)
                block = addChildClassed(transcript, 'text-block' + ' ' + 'speaker-' + currentSpeaker, tag='p');
            }
    
            var newAnchor = addChildClassed(block,'segment', tag='a')
            newAnchor.textContent = segment['text'];
            newAnchor.setAttribute('id', 'segment-' + segment['id']);
            newAnchor.setAttribute('segmentNum', segment['id']);
            newAnchor.setAttribute('segmentStart', segment['start']);
            prevSpeaker = currentSpeaker;
        }

        audioElement.addEventListener("timeupdate",function(){
            var currentTime = audioElement.currentTime;
            var seconds = Math.round(currentTime);
            $("#currentTime").text(toMinutes(seconds));
            for (var i=0; i<data.length; i++) {
                var segment = data[i];
        
                if (currentTime > segment['start'] && currentTime < segment['end']) {
                    $('.segment').removeClass('segment-highlighted')
                    $('#segment-' + segment['id']).addClass('segment-highlighted')
                }        
            }
        });

        $('.speaker-label').on('click', function() {
            console.log('speaker label clicked')
        })

        $('.speaker-label').on('change', function(e) {
            var idChanged = $(e.currentTarget).attr('id')
            var newName = e.currentTarget.value
            $('.' + idChanged).attr('value', newName)
        })
        
    })
    
    $( '.transcript' ).on( "dblclick", function() {
        audioElement.currentTime = window.getSelection().anchorNode.parentElement.getAttribute('segmentStart')
    });

    var textEnterActive = false;
    var newNote;
    var newComment;
    $(document).on('keypress',function(e) {
        if (e.which == 13) {

            if (textEnterActive) {
                textEnterActive = false;
                $(newComment).css('border-color', 'black');
                records['notes'].push(newNote);
                console.log(records)
            } else {
                textEnterActive = true;
                newNote = {
                    'selected': showSelected(),
                    'note': ''
                }
                
                newComment = addChildClassed(comments, 'comment');
                $(newComment).css('border-color', 'grey');
                var highlightTop = $(window.getSelection().anchorNode.parentElement).position().top;
                $(newComment).css('top', highlightTop + 'px')
            }            
        } else {
            if (textEnterActive) {
                if (e.which == 32) {
                    e.preventDefault()
                    newNote['note'] += ' '
                }
                var letter = e.originalEvent.key;
                newNote['note'] += letter;
                newComment.textContent = newNote['note']
            } else {
                if (e.keyCode == 106) {
                    audioElement.currentTime = window.getSelection().anchorNode.parentElement.getAttribute('segmentStart')
                }
            }
            
        }
    });

    $('#download-records').on('click', function() {
        console.log('downloading')
        $("<a />", {
            "download": "data.json",
            "href" : "data:application/json," + encodeURIComponent(JSON.stringify(records))
          }).appendTo("body")
          .click(function() {
             $(this).remove()
          })[0].click()
    }) 


})