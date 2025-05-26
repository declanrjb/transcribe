function addChildClassed(parent,newClass,tag='div') {
    var newDiv = document.createElement(tag);

    var classes = newClass.split(' ')
    for (var i=0; i<classes.length; i++) {
        newDiv.classList.add(classes[i]);
    }

    parent.appendChild(newDiv);
    return newDiv;
}

$(function() {

    const transcript = document.querySelector('.transcript');

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
        console.log(data)
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
            $("#currentTime").text("Current second:" + currentTime);
            for (var i=0; i<data.length; i++) {
                var segment = data[i];
        
                if (currentTime > segment['start'] && currentTime < segment['end']) {
                    $('#segment-' + (segment['id']-1)).removeClass('segment-highlighted')
                    $('#segment-' + segment['id']).addClass('segment-highlighted')
                }        
            }
        });
        
    })


})