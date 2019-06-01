$(document).ready(function(){    
    performConnect();          
});

var current_div;

function performConnect()
    {           
        server_name = $('#server_name').html().trim();
        db_name = $('#db_name').html().trim();
        
        req_data = {username:'balajia',password:'Rvndqr06',server : server_name, db:db_name + "_metastore"};                        
        $.ajax({
            url: '/connectSQL',
            data : req_data,
            type: 'POST',
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
                    //Do other stuff after immediately connecting
                    showSearch();

                    }, 1000);                                        
                }
                    
            },
            fail : function(xhr,textStatus,error)
            {
                $('#notif_bar').css('background-color','#F44336');
                $('#notif_bar').text(error);                
            }
            });
    }

function updateDashboardStats(wf_type)
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
var cur_request;
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
    //Ignore if search term is the same
    if(prev_searchterm==srch_val)            
            return;        
    //check for existing ajax request    

    if(cur_request)        
    {
            cur_request.abort();                    
    }
    if(srch_val=='')    
    {
        $('#srch_result_div').html("<br><br>Search for workflows and filter them from above");
        prev_searchterm= "";
        return;
    }

    prev_searchterm = srch_val;     

    req_data = {where_key : srch_col, where_val : srch_val, order_by: order_col, order_type: order_ad};        
    cur_request =  $.ajax({
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
                $('#srch_result_div').text("Something went wrong : " + response);
            }
            else{                
                result  = response.data.info;
                if(!Object.keys(result).length){

                    $('#srch_result_div').html("<br><br>No workflows found where '" + srch_col + "' = " + srch_val);
                }
                else{
                    prettifyAndDisplayResult(result);                    
                }               
            }
        },
            fail : function(xhr,textStatus,error)
        {            
            $('#notif_bar').hide();
            $('#srch_result_div').text(error);
        }
        });    
}

function prettifyAndDisplayResult(result)
{
    var bodyStyles = window.getComputedStyle(document.body);
    var p_light = bodyStyles.getPropertyValue('--primary_light');
    var d_light = bodyStyles.getPropertyValue('--danger_light');
    var s_light = bodyStyles.getPropertyValue('--success_light');
    
    var p_dark = bodyStyles.getPropertyValue('--primary_dark');
    var d_dark = bodyStyles.getPropertyValue('--danger_dark');
    var s_dark = bodyStyles.getPropertyValue('--success_dark');

    //$('#srch_result_div').text(JSON.stringify(result));    
    var new_content = "";    
    for (i = 0; i < result.length; i++) {         

        sel_light = p_light;
        sel_dark = p_dark;
        if(['FAILED','FAILED-CLEANUPFAILED'].indexOf(result[i].WORKFLOW_INSTANCE_STATUS) >=0)        
        {
            sel_light = d_light;
            sel_dark = d_dark;
        }
        else if(['COMPLETE','COMPLETE-CLEANUPFAILED','COMPLETE-PENDINGCLEANUP'].indexOf(result[i].WORKFLOW_INSTANCE_STATUS) >=0)
         {
            sel_light = s_light;
            sel_dark = s_dark;
         }
        
        new_content +=`
        <div class='container-fluid res_item' id='res_item_` + i +`' style='background-color:` + sel_light +`;border-left:`+ sel_dark +` solid 4px'>
            <div class='row'>
                <div class='col-lg-auto col-md-auto'>`
                 + result[i].WORKFLOW_ID +   
                `</div>
                <div class='col-lg-auto col-md-auto'><b>`
                 + result[i].WORKFLOW_NAME +   
                `</div></b>
                <div class='col-lg-auto col-md-auto'>`
                 + result[i].WORKFLOW_INSTANCE_STATUS +   
                `</div>
                <div class='col-lg-auto col-md-auto offset-md-4'>
                    <input type="checkbox" id="mon_toggle_`+i+`" name="set-name" class="switch-input">
                    <label for="mon_toggle_`+i+`" class="switch-label"><span class="toggle--on">Monitoring</span><span class="toggle--off">Monitor</span></label>
                </div>
            </div>
            <br>
            <div class='row'>
                <div class='col-lg-auto col-md-auto justify-content-left'><span class='gray_text'>DURATION </span><b>`
                 + result[i].RUN_TIME_IN_MINS +  ` mins` +
                `</div></b>
                <div class='col-lg-auto col-md-auto  justify-content-left'><span class='gray_text'>STARTED </span><b>`
                 + result[i].START_DT +   
                `</div></b>
                <div class='col-lg-auto col-md-auto  justify-content-left'><span class='gray_text'>ENDED </span><b>`
                 + result[i].END_DT +   
                `</div></b>
                <div class='col-lg-auto col-md-auto  justify-content-left'><span class='gray_text'>UPDATED BY </span><b>`
                 + result[i].UPDATE_USER +   
                `</div></b>
                <div class='col-lg-auto col-md-auto  justify-content-left'><span class='gray_text'>UPDATED ON </span><b>`
                 + result[i].UPDATE_DT +   
                `</div></b>
            </div>
        </div>`;
        
      } 
              
    $('#srch_result_div').html(new_content);    
}

var typingTimer;                //timer identifier
var showSearch = function()
{
    $('#dash_body').hide();

    $(".dropdown-item").click(function(){
        var button = $(this).parents(".btn-group").find('.btn')
        button.html($(this).text());
        button.val($(this).data('value')); 
      });       

    //setup before functions
    clearTimeout(typingTimer);  
    clearInterval(dashStatsTimer);

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

    $('#srch_body').show();    
}

var dashStatsTimer; 
var showDashboard = function()
{
    //clearSearchTimer
    clearTimeout(typingTimer);    
    clearInterval(dashStatsTimer);

    $('#srch_body').hide();
    $('#dash_body').show();

    //Run once
    updateDashboardStats("failed");
    updateDashboardStats("running");

    //Set timer to refresh all data every 1 min
    dashStatsTimer = setInterval(function(){
    updateDashboardStats("failed");
    updateDashboardStats("running");
    }, 0.5 * 60 * 1000);    
    
}
