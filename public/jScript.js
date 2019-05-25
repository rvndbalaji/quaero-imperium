$(document).ready(function(){

    $(".dropdown-item").click(function(){
        var button = $(this).parents(".btn-group").find('.btn')
        button.html($(this).text());
        button.val($(this).data('value')); 
      });    
});

function performConnect()
    {        
        var req_data = {username:$('[name=username]').val(), password : $('[name=password]').val(), server : $('[name=server]').val(), db : $('[name=db]').val()};

        $.ajax({
            url: '/connectSQL',
            data : req_data,
            type: 'POST',
            beforeSend : function(xhr){
                $('#get_wf').text("Connecting...");    
            },           
            success: function (response) 
            {
                $('#get_wf').text(response);
            }
            });
    }
