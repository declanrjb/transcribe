var audio_file = 'kate-rich.m4a'
var generated_transcript = 'kate-sample_transcript.json'
var global_records = {
    'notes': [],
    'speakers': {},
    'transcript': {}
}

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

function highlightSpans(spans) {
    var htmlForm = ''
    for (var i=0; i<spans.length; i++) {
        htmlForm += spans[i].outerHTML
    }

    var sum = 0;
    $(spans).each(function() {
        sum += parseFloat($(this).attr('id').replace('word-', ''))
    })
    var newId = 'highlight-' + sum

    document.querySelector('.transcript').innerHTML = document.querySelector('.transcript').innerHTML.replace(htmlForm, '<a class="highlight" id="' + newId + '">' + htmlForm + '</a>')
    return(newId)
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

function loadFromRecords(records) {
    $('.transcript').slideUp(0)
    $('.central-panel').css('opacity', 1)
    console.log(records)
    $('.transcript').html('')
    console.log('inside load from records')
    console.log(records)
    var comments = document.querySelector('.comments');
    var transcript = document.querySelector('.transcript');
    data = records['transcript']['segments']
    console.log(data)
    var block;

    block = addChildClassed(transcript, 'text-block' + ' ' + 'speaker-' + currentSpeaker, tag='p');
    var currentSpeaker = data[0]['speaker_id']
    var prevSpeaker = null;
    for (var i=0; i<data.length; i++) {
        var segment = data[i];
        currentSpeaker = segment['speaker_id'];
        if (currentSpeaker != prevSpeaker) {
            var speakerHeading = addChildClassed(transcript, 'speaker-label ' + currentSpeaker, div='input')
            speakerHeading.textContent = currentSpeaker
            $(speakerHeading).attr('type', 'text')
            $(speakerHeading).attr('value', currentSpeaker)
            $(speakerHeading).attr('id', currentSpeaker)
            block = addChildClassed(transcript, 'text-block' + ' ' + 'speaker-' + currentSpeaker, tag='p');
        }

        var newAnchor = addChildClassed(block,'segment', tag='p')
        var words = segment['words']
        for (var j=0; j<words.length; j++) {
            var word = words[j]
            var newWord = addChildClassed(newAnchor, 'word', tag='span')
            newWord.textContent = word['text']
            newWord.setAttribute('start', word['start'])
            newWord.setAttribute('end', word['end'])
            newWord.setAttribute('id', 'word-' + ((i+1) * (j+1) * 7))
        }

        prevSpeaker = currentSpeaker;
    }

    $('.speaker-label').on('click', function() {
        console.log('speaker label clicked')
    })

    $('.speaker-label').on('change', function(e) {
        var idChanged = $(e.currentTarget).attr('id')
        var newName = e.currentTarget.value
        $('.' + idChanged).attr('value', newName)
        records['speakers'][idChanged] = newName
    })
    if ('notes' in records) {
        var notes = records['notes']
        for (var i = 0; i<notes.length; i++) {
            var note = notes[i];
            document.querySelector('.transcript').innerHTML = document.querySelector('.transcript').innerHTML.replace(note['highlightContents'], note['highlightAnchor'])

            newComment = addChildClassed(comments, 'comment');
            $(newComment).css('border-color', 'black');
            var highlightTop = $('#' + note['highlightId']).position().top;
            $(newComment).css('top', highlightTop + 'px')
            newComment.textContent = note['note']
        }
    }
    if ('speakers' in records) {
        for (const [key, value] of Object.entries(records['speakers'])) {
            $('.' + key).attr('value', value)    
        }
    }

    $( '.word' ).on( "dblclick", function(e) {
        console.log(e)
        var audioElement = document.getElementById('audio-host')
        audioElement.currentTime = e.currentTarget.getAttribute('start')
        audioElement.play()
        $('#play').css('display', 'none')
        $('#pause').css('display', 'inline')
    });

    $('.transcript').slideDown(1000)
    return(records)
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
}

function disappear(selector) {
    $(selector).css('margin-top', '5%').css('opacity', 0)
    setTimeout(function() {
        $(selector).css('display', 'none')
      }, 1500);
}

function disappearRight(selector) {
    $(selector).css('right', '-10px').css('opacity', 0)
    setTimeout(function() {
        $(selector).css('display', 'none')
      }, 1500);
}



$(function() {
    
    var comments = document.querySelector('.comments');
    var audioElement = document.getElementById('audio-host')
    
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

    audioElement.addEventListener("timeupdate",function(){
        var currentTime = audioElement.currentTime;
        var seconds = Math.round(currentTime);
        $("#currentTime").text(toMinutes(seconds));
    });





    $('#upload-records').on('click', function() {
        $('#session-records-input').click()
    })

    $('#session-records-input').on('change', function(e) {

        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(e.target.files[0]);

        function onReaderLoad(event){
            console.log(event.target.result);
            var data = JSON.parse(event.target.result);
            console.log(data);
            global_records['transcript']['segments'] = data['transcript']['segments']
            loadFromRecords(data)
        }
    })

    $('#upload-audio').on('click', function() {
        $('#audio-input').click()
    })

	$('#audio-input').on('change', async function(e) {
        $('#upload-audio>.fa-solid').attr('class', 'fa-solid fa-spinner')
        var file = e.target.files[0]

        $('#audio-host').attr('src', URL.createObjectURL(file))
        var data = new FormData()
        data.append('file', file)
        data.append('user', 'hubot')

        console.log('sending')
        let response = await fetch('https://transcribe-qn6o.onrender.com/transcribe', {
            method: 'POST',
            body: data
        })



        const r = await response.json();
        $('#upload-audio>.fa-solid').attr('class', 'fa-solid fa-file-audio')
        global_records['transcript']['segments'] = r['transcript']['segments']
        loadFromRecords(r)
    })

    var textEnterActive = false;
    var newNote;
    var newComment;
    $(document).on('keypress',function(e) {
        if (e.which == 13) {

            if (textEnterActive) {
                textEnterActive = false;
                $(newComment).css('border-color', 'black');
                global_records['notes'].push(newNote);
                var spans = $(window.getSelection().anchorNode.parentElement.previousSibling).nextUntil('#' + window.getSelection().extentNode.parentElement.nextSibling.id)
                var highlightId = highlightSpans(spans)
                newNote['highlightId'] = highlightId
                newNote['highlightAnchor'] = document.querySelector('#' + highlightId).outerHTML
                newNote['highlightContents'] = document.querySelector('#' + highlightId).innerHTML
                
            } else {
                textEnterActive = true;
                newNote = {
                    'selected': showSelected(),
                    'note': '',
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
        console.log(global_records)
        $("<a />", {
            "download": 'transcript.json'.replace('.json', '_annotated.json'),
            "href" : "data:application/json," + encodeURIComponent(JSON.stringify(global_records))
          }).appendTo("body")
          .click(function() {
             $(this).remove()
          })[0].click()
    }) 

    $('#intro-upload-button').on('click', function() {
        disappear('.intro-panel')
        setTimeout(function() {
            $('#audio-input').click()
          }, 200);
        
    })

    $('#intro-resume-button').on('click', function() {
        disappear('.intro-panel')
        setTimeout(function() {
            $('#session-records-input').click()
          }, 200);
        
    })

    


})