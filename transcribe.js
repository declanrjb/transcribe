
$(function() {

    $('#upload-audio').on('click', function() {
        $('#audio-input').click()
    })

	$('#audio-input').on('change', async function(e) {
        var file = e.target.files[0]

        var data = new FormData()
        data.append('file', file)
        data.append('user', 'hubot')

        console.log('sending')
        let response = await fetch('http://127.0.0.1:5000/transcribe', {
            method: 'POST',
            body: data
        })

        const r = await response.json();
        console.log(r);
/*
        const reader = new FileReader();
        reader.onload = async (e) => {
            console.log(e.target.result)
                
        };
        reader.readAsDataURL(file);
        */
    })
})