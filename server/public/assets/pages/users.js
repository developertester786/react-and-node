$('#delete_user').click(function () {
    var $this = $(this);
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger m-l-10',
        confirmButtonText: 'Yes, delete it!'
    }).then(function (isConfirm) {
        if (isConfirm) {
            var uid = $this.data('uid');
            $.ajax({
                type : "POST",
                url : "/delete-user",
                dataType: 'json',
                data : {
                    action: 'delete_user',
                    uid:uid
                },
                success: function(response) {
                    var msgtype = response.status == "success" ? "Done" : "Error";
                    swal({
                        title: msgtype,
                        type: response.status,
                        text: response.msg,
                        showCancelButton: false,
                    }).then(function(){
                        if(msgtype == "Done")
                        {
                            window.location.reload();
                        }
                    });
                }
            });
        }
    }).catch(swal.noop);
});

$('#change_status').click(function () {
    var $this = $(this);
    var status = $this.attr('title');
    swal({
        title: 'Are you sure?',
        text: "You want to "+status+" this user!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger m-l-10',
        confirmButtonText: 'Yes, '+status+' it!'
    }).then(function (isConfirm) {
        if (isConfirm) {
            var uid = $this.data('uid');
            var code = $this.data('status');
            $.ajax({
                type : "POST",
                url : "/change-status",
                dataType: 'json',
                data : {
                    action: 'change_user_status',
                    uid:uid,
                    code:code
                },
                success: function(response) {
                    var msgtype = response.status == "success" ? "Done" : "Error";
                    swal({
                        title: msgtype,
                        type: response.status,
                        text: response.msg,
                        showCancelButton: false,
                    }).then(function(){
                        if(msgtype == "Done")
                        {
                            window.location.reload();
                        }
                    });
                }
            });
        }
    }).catch(swal.noop);
});