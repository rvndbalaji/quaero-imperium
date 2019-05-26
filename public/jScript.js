$(document).ready(function(){

    $(".dropdown-item").click(function(){
        var button = $(this).parents(".btn-group").find('.btn')
        button.html($(this).text());
        button.val($(this).data('value')); 
      });    

      //setup before functions
        var typingTimer;                //timer identifier
        var doneTypingInterval = 1000;  //time in ms, 5 second for example
        var $input = $('#srch_box');

        //on keyup, start the countdown
        $input.on('keyup', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(performSearch, doneTypingInterval);
        });

        //on keydown, clear the countdown 
        $input.on('keydown', function () {
        clearTimeout(typingTimer);
        });

        performConnect();
      
});

function performConnect()
    {           
        server_name = $('#server_name').html().trim();
        db_name = $('#db_name').html().trim();
        
        req_data = {username:'balajia',password:'Rvndqr04',server : server_name, db:db_name + "_metastore"};        
        console.log(req_data);
        $.ajax({
            url: '/connectSQL',
            data : req_data,
            type: 'GET',
            beforeSend : function(xhr){
                $('#notif_bar').show();
                $('#notif_bar').text("Connecting to sever...");    
                $('#notif_bar').css('background-color','#2196F3');
            },           
            success: function (response) 
            {                
                if(response.err==1)
                {
                    $('#notif_bar').text(response.data.info);
                    $('#notif_bar').css('background-color','#F44336');
                }
                else{
                    $('#notif_bar').css('background-color','#4CAF50');
                    $('#notif_bar').text("Connected");
                    setTimeout(function(){
                        $('#notif_bar').hide();
                     }, 1000);

                     //Run once
                     updateWorkflowCount("failed");
                     updateWorkflowCount("running");

                     //Set timer to refresh all data every 1 min
                     setInterval(function(){
                        updateWorkflowCount("failed");
                        updateWorkflowCount("running");
                     }, 2 * 60 * 1000);
                     
                }
                    
            },
            fail : function(xhr,textStatus,error)
            {
                $('#notif_bar').css('background-color','#F44336');
                $('#notif_bar').text(error);                
            }
            });
    }

function updateWorkflowCount(wf_type)
{
    prev_value = $('#' + wf_type + '_wf').text();    
    req_data = {type : wf_type};
    
    $.ajax({
        url: '/wf/count',
        data : req_data,
        type: 'GET',
        beforeSend : function(xhr){            
            $('#' + wf_type + '_wf').text(prev_value + " (updating)");            
        },           
        success: function (response) 
        {   
            if(response.err==1)
            {
                $('#' + wf_type + '_wf').text(prev_value);                
            }
            else{                
                $('#' + wf_type + '_wf').text(response.data.count);
            }
        },
         fail : function(xhr,textStatus,error)
        {            
            $('#' + wf_type + '_wf').text(prev_value);
        }
        });
}

prev_searchterm = "";
function performSearch()
{
    //Search string
    srch_val = $('#srch_box').val().trim();
    //Search col
    srch_col = $('#srch_col').html().trim();
    //Order by
    order_col = $('#order_col').html().trim();    
    //Order asc/desc
    order_ad = $('#order_type').html().trim();
    
    if(srch_val=='')    
    {
        $('#srch_result').text("Search for workflows and filter them from above");
        prev_searchterm= "";
        return;
    }
    if(prev_searchterm==srch_val)            
            return;        
    prev_searchterm = srch_val;     

    req_data = {where_key : srch_col, where_val : srch_val, order_by: order_col, order_type: order_ad};    
    $.ajax({
        url: '/search/wf',
        data : req_data,
        type: 'GET',
        beforeSend : function(xhr){            
            $('#notif_bar').text("Fetching workflows...");    
            $('#notif_bar').show();            
            $('#notif_bar').css('background-color','#2196F3');            
        },           
        success: function (response) 
        {
           $('#notif_bar').hide();
            if(response.err==1)
            {
                $('#srch_result').text("Something went wrong : " + response.data.info);
            }
            else{                
                result  = response.data.info;
                if(!Object.keys(result).length){

                    $('#srch_result').text("No workflows found where '" + srch_col + "' = " + srch_val);
                }
                else{
                    $('#srch_result').text(JSON.stringify(response.data.info));
                }               
            }
        },
            fail : function(xhr,textStatus,error)
        {            
            $('#notif_bar').hide();
            $('#srch_result').text(error);
        }
        });    
}

