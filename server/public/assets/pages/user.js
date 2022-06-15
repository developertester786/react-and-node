Dropzone.autoDiscover = false;
var myDropzone = new Dropzone(".dropzone", {
    url: '/upload-avatar',
   autoProcessQueue: false,
   uploadMultiple: false,
   maxFiles:2,
   maxFilesize: 2,
   createImageThumbnails:false,
   hiddenInputContainer: "img.rounded-circle",
   init: function(file) {
        var prevFile = null;
        this.on("addedfile", function(file) {
            var $this = this;
            setTimeout(function () {
                //console.log('file',file);
                if(file.status == "error"){
                    //console.log('error',file.previewTemplate.innerText);
                    alert(file.previewTemplate.innerText);
                } else {
                    //console.log($this.getQueuedFiles());
                    //console.log('prev file',prevFile);
                    if(prevFile){
                        $this.removeFile($this.files[0])
                    }
                    prevFile = file;
                    
                    //console.log('filename',file.name);
                    $("#ws_user_avatar").attr('data-imgname', file.name);
                    previewImage($this);
                    //console.log('here');
                    //console.log('new array',$this.getQueuedFiles());
                }
            }, 10);
            
            //file.previewElement.innerHTML = "";
        });
        // this.on("queuecomplete", function(file) {
        //     //$("#add_new_user").submit();
        // });

        // this.on('complete', function(file, responseText) {
        //     console.log('file',file);
        //     if(file.status == "error"){
        //         console.log('error',file.previewTemplate.innerText);
        //         alert(file.previewTemplate.innerText);
        //     }
        // });
    }
});

function previewImage(input){
    let fileReference = input.files && input.files[0];
    if(fileReference){
        var reader = new FileReader();
        reader.onload = (event) => {
            //console.log('event.target.result',event.target.result);
            document.getElementById('ws_user_avatar').src = event.target.result;
        }
        reader.readAsDataURL(fileReference); 
    }
}

$(document).on('click','#remove_img', function(){
    myDropzone.removeFile(prevFile);
    $("#ws_user_avatar").attr('src', $("#ws_user_avatar").data('thumb'));
    $("#ws_user_avatar").data('imgname','');
});

// $('#uploadfiles').click(function(){
//    myDropzone.processQueue();
// });

$(document).on('click','#btn_submit', function(e){
    var valid = 1;
    e.preventDefault();
    $('#add_new_user input[type="text"], #add_new_user input[type="password"], #add_new_user input[type="email"], #add_new_user select').each(function(){
        var inputval = $(this).val().trim();
        if(inputval == ""){
            valid = 0;
            var datakey = $(this).data('key');
            $(this).addClass('parsley-error');
            $(this).after('<span class="error">'+datakey+' is required</span>');
        } else {
            var match = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if($(this).attr('type') == "email" && !match.test(inputval)){
                valid = 0;
                $(this).addClass('parsley-error');
                $(this).after('<span class="error">Please provide a valid email address.</span>');
            } else {
                $(this).removeClass('parsley-error');
                $(this).closest('div').find('span.error').remove();
            }
        }
    });

    if(valid == 1){
        $.ajax({
            type : "POST",
            url : "/validate-user-form",
            dataType: 'json',
            data : {
                action: 'user_form_validate',
                username: $('#username').val().trim(),
                phone: $('#phone').val().trim(),
                email: $('#email').val().trim()
            },
            success: function(response) {
                var dosubmit=1;
                if(response.email != "success"){
                    dosubmit=0;
                    $('#email').addClass('parsley-error');
                    $('#email').after('<span class="error">'+response.email+'</span>');
                } else {
                    $('#email').removeClass('parsley-error');
                    $('#email').closest('div').find('span.error').remove();
                }
                if(response.user != "success"){
                    dosubmit=0;
                    $('#username').addClass('parsley-error');
                    $('#username').after('<span class="error">'+response.user+'</span>');
                } else {
                    $('#username').removeClass('parsley-error');
                    $('#username').closest('div').find('span.error').remove();
                }
                if(response.phone != "success"){
                    dosubmit=0;
                    $('#phone').addClass('parsley-error');
                    $('#phone').after('<span class="error">'+response.phone+'</span>');
                } else {
                    $('#phone').removeClass('parsley-error');
                    $('#phone').closest('div').find('span.error').remove();
                }
                if(dosubmit == 1){
                    console.log('here',myDropzone.getQueuedFiles());
                    if(myDropzone.getQueuedFiles().length > 0){
                        console.log('processing',myDropzone.getQueuedFiles());
                        myDropzone.processQueue();
                    } else {
                        $("#add_new_user").submit();
                    }
                }
            }
        });
    }
});