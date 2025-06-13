
$(function() {

    $('#upload-audio').on('click', function() {
        $('#audio-input').click()
    })

	$('#audio-input').on('change', function(e) {
        var file = e.target.files[0]

        const reader = new FileReader();
        reader.onload = async (e) => {
            console.log(e.target.result)
                
        };
        reader.readAsDataURL(file);
    })
})