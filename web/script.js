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
        $("#length").text("Duration:" + audioElement.duration + " seconds");
        $("#source").text("Source:" + audioElement.src);
        $("#status").text("Status: Ready to play").css("color","green");
    });
    
    $('#play').click(function() {
        audioElement.play();
        $("#status").text("Status: Playing");
    });
    
    $('#pause').click(function() {
        audioElement.pause();
        $("#status").text("Status: Paused");
    });
    
    $('#restart').click(function() {
        audioElement.currentTime = 0;
    });

    d3.json('../transcript.json')
    .then(data => { 
        data = data['segments']
        var block = addChildClassed(transcript, 'text-block', tag='p');
        for (var i=0; i<data.length; i++) {
            var segment = data[i];
    
            var newAnchor = addChildClassed(block,'segment', tag='a')
            newAnchor.textContent = segment['text'];
            newAnchor.setAttribute('id', 'segment-' + segment['id']);
        }

        audioElement.addEventListener("timeupdate",function(){
            var currentTime = audioElement.currentTime;
            var seconds = Math.round(currentTime);
            $("#currentTime").text(Math.floor(seconds / 60) + ':' + seconds % 60);
            for (var i=0; i<data.length; i++) {
                var segment = data[i];
        
                if (currentTime > segment['start'] && currentTime < segment['end']) {
                    $('#segment-' + (segment['id']-1)).removeClass('segment-highlighted')
                    $('#segment-' + segment['id']).addClass('segment-highlighted')
                }        
            }
        });
        
    })

    $('#showSelected').on('click', function(){

        
    
        alert(text);       
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
            if (e.which == 32) {
                e.preventDefault()
                newNote['note'] += ' '
            }
            var letter = e.originalEvent.key;
            newNote['note'] += letter;
            newComment.textContent = newNote['note']
        }
    });


})