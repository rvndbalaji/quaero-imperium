let params = (new URL(document.location)).searchParams;
let server_name = params.get("server");
let metastore = params.get("db");
let wf_id = params.get("wf");
let auth = params.get("auth");
var wfRefreshTimer;
var ref_timeout;
var instance_limit = 5;

///GLOBAL LATEST_VALUES
let LATEST_INSTANCES = undefined;
let current_error_logs;
let current_pc_param;

$(document).ready(function(){            
    /*
        Firebase is initialzed in jScript
        All firebase listeners are declared, and a one time request for configured host is performed
        Finally, when configured hosts are obtained, performConnect() is called from there,
        which executes ok_wfConnect from this javascript
    */

        declareLocalListeners();        
});

var declareLocalListeners = function()
{
    ref_timeout = Number($('#ref_box').val());                                           
    $('#ref_box').change(function() {
        //This function is triggered when the refresh box value has changed                             
        //Give a 1 second delay incase the user is "scrolling" through the numbers
        //provided the user has already been on this screen
        ref_timeout = Number($('#ref_box').val());                                   
        clearTimeout(scrollTim);                                  
        scrollTime = setTimeout(getWorkflow,1000);                                               
    });
    
    
    $(document).on("click", "#deact_wf",function() {
        //This function is triggered when someone clicks the deactivate workflow button.        
        ActDeactWorkflow(0);
    });
    $(document).on("click", "#act_wf",function() {
        //This function is triggered when someone clicks the activate workflow button.
        ActDeactWorkflow(1);
    });

    $('#modifyStatusDialog').on('show.bs.modal', function (event) {        
        var wfi_id = $('#modifyInstanceButton').attr('data-whatever');        
        $('#modifyStatus_config_alert').html('WARNING : You are about to perform a dangerous action');
        var modal = $(this)
        modal.find('#wfi_id').html(wfi_id);
        //Set the onclick to call the modify function and pass the id as param
        modal.find('#modifyButton').attr('onclick',"modifyWFStatus(" + wfi_id + ")")                
    });

    $('#wfi_table').on('click', '.wfi_row', function(event) {
        //Enable selection of tows in table        
        if($(this).hasClass('table-active'))
        {                        
            $(this).removeClass('table-active'); 
            $('.wfi_action').attr('disabled','disabled');   
            $('#VisitOozieButton').addClass('disabled');         
        } else 
        {
            $(this).addClass('table-active').siblings().removeClass('table-active');            
            selected_row = $(this).children("th").html();            
            //Set the data-title attribute that performs an action on the selected workflow instance
            $('#modifyInstanceButton').attr('data-whatever',(LATEST_INSTANCES[(selected_row-1)].WORKFLOW_INSTANCE_ID));  
            $('#ViewLogsButton').attr('data-whatever',LATEST_INSTANCES[(selected_row-1)].EVENT_GROUP_ID);
            $('#PrecompileButton').attr('data-whatever',LATEST_INSTANCES[(selected_row-1)].WORKFLOW_INSTANCE_ID);
            URL = LATEST_INSTANCES[(selected_row-1)].OOZIE_JOB_URL;            
            if(URL!='-')
            {
                $('#VisitOozieButton').attr('href',URL);            
                $('#VisitOozieButton').removeClass('disabled'); 
            }
            $('.wfi_action').removeAttr('disabled');                        
        }        
    });

    $('#viewLogDialog').on('show.bs.modal', function (event) {        
        var eg_id = $('#ViewLogsButton').attr('data-whatever');        
        $('#log_config_alert').html('Fetching logs, please wait...');
        var modal = $(this)
        modal.find('.modal-title').text('Error Logs for ' + eg_id);        
        getErrorLogs(eg_id);
    });

    $('#preCompileDialog').on('show.bs.modal', function (event) {        
        var wfi_id = $('#PrecompileButton').attr('data-whatever');        
        $('#pc_config_alert').html('Generating precompile, please wait...');
        var modal = $(this)
        modal.find('.modal-title').text('Precompile for instance ' + wfi_id);        
        getPrecompile(wfi_id);
    });
    
      //on keyup, start the countdown
      $('#log_srch_box').on('keyup', function () 
      {
        typed_text = $('#log_srch_box').val().trim();
        if(typed_text=='')
        {
            displayLogTable(current_error_logs);
        }
        else
        {   
            var filtered_log = [];
            var def = {
                EVENT_ID : 0,
                EVENT_MSG : "The logs do not contain the text '" + typed_text + "'",
                DATE : '-'
            }
                 
            for(i=0; i < current_error_logs.length; i++)
            {
                if((current_error_logs[i].EVENT_MSG.toLowerCase()).includes(typed_text.toLowerCase()))
                {   
                    var cur = {
                        EVENT_ID : current_error_logs[i].EVENT_ID,
                        EVENT_MSG : current_error_logs[i].EVENT_MSG,
                        DATE : current_error_logs[i].DATE
                    }
                    filtered_log.push(cur);
                }
            }
            if(filtered_log.length==0)
            {
                filtered_log.push(def);
            }
            displayLogTable(filtered_log);
        }
      });
       //on keyup, start the countdown
       $('#pc_srch_box').on('keyup', function () 
       {
         typed_text = $('#pc_srch_box').val().trim().toLowerCase();
         if(typed_text=='')
         {
             displayPCTable(current_pc_param);
         }
         else
         {   
             var filtered_pc = [];
             var def = {
                 PARAM_NAME : '-',
                 PARAM_VALUE : "No param name or value contains the text '" + typed_text + "'"                 
             }
             //Replace all null values with '-'
             current_pc_param = JSON.parse(JSON.stringify(current_pc_param).split(":null").join((':\"-"')));
             for(i=0; i < current_pc_param.length; i++)
             {
                 if((current_pc_param[i].PARAM_NAME.toLowerCase().includes(typed_text)) || (current_pc_param[i].PARAM_VALUE.toLowerCase().includes(typed_text)))
                 {   
                     var cur = {
                        PARAM_NAME : current_pc_param[i].PARAM_NAME,
                        PARAM_VALUE : current_pc_param[i].PARAM_VALUE                         
                     }
                     filtered_pc.push(cur);
                 }
             }
             if(filtered_pc.length==0)
             {
                filtered_pc.push(def);
             }
             displayPCTable(filtered_pc);
         }
       });

}

var getErrorLogs = function(eg_id)
{   
    $('#log_config_alert').show(); 
    $('#log_config_alert').removeClass('alert-danger');
    $('#log_config_alert').addClass('alert-warning');
    $("#err_log_display").hide();
    $("#log_srch_box").val("");
    $("#RefreshLogs").attr('onclick','getErrorLogs(' + eg_id +')');
    req_data = { server : server_name,auth_type: auth,db:metastore , schema:'dbo', event_group_id : eg_id};                
    getRequest(req_data,ok_elog,err_elog,undefined,'/wf_man/wf/error_log');                                        
}



var ok_elog = function(req_data,response,ref_timeout)
{
    if(response.err==1)
    {       
        err_elog((JSON.parse(response.data.info).originalError.info.message));
    }        
    else
    {
        current_error_logs = response.data.info;
        displayLogTable(current_error_logs);
    }
    
}
var displayLogTable = function(err_logs)
{
    t_headers = `
        <thead>
            <tr>
                <th scope="col">Time</th>            
                <th scope="col">Message</th>
                <th scope="col">Event ID</th>
            </tr>
        </thead>`;

        t_body = `<tbody>`;
        each_row = '';
        for (i = 0; i < err_logs.length; i++) 
        {
            each_row += `
            <tr class="log_row">
            <td>`+ err_logs[i].DATE + `</td>                                          
            <td>`+ err_logs[i].EVENT_MSG + `</td>
            <td>`+ err_logs[i].EVENT_ID + `</td>                                    
            </tr>`;        
        }           

        $('#log_table').html(t_headers + t_body + each_row + '</tbody>');
        $("#log_config_alert").hide();
        $('#err_log_display').fadeIn();        
        $("#log_srch_box").focus();
}

var err_elog = function(error,ref_timeout)
{
    $('#log_config_alert').removeClass('alert-warning');
    $('#log_config_alert').addClass('alert-danger');
    $('#log_config_alert').html(error);    
}



var getPrecompile = function(wfi_id)
{   
    $('#pc_config_alert').show(); 
    $('#pc_config_alert').removeClass('alert-danger');
    $('#pc_config_alert').addClass('alert-warning');
    $("#pc_display").hide();
    $("#pc_srch_box").val("");
    req_data = { server : server_name,auth_type: auth,db:metastore , schema:'dbo', workflow_instance_id : wfi_id};                
    getRequest(req_data,ok_precompile,err_precompile,undefined,'/wf_man/wf/precompile');                                        
}



var ok_precompile = function(req_data,response,ref_timeout)
{
    if(response.err==1)
    {       
        err_precompile((JSON.parse(response.data.info).originalError.info.message));
    }        
    else
    {
        current_pc_param = response.data.info;
        displayPCTable(current_pc_param);
    }
    
}
var displayPCTable = function(pc_params)
{
    t_headers = `
        <thead>
            <tr>
                <th scope="col">Param Name</th>            
                <th scope="col">Value</th>                
            </tr>
        </thead>`;

        t_body = `<tbody>`;
        each_row = '';
        for (i = 0; i < pc_params.length; i++) 
        {
            each_row += `
            <tr class="log_row">
            <td>`+ pc_params[i].PARAM_NAME + `</td>                                          
            <td>`+ pc_params[i].PARAM_VALUE + `</td>            
            </tr>`;        
        }           

        $('#pc_table').html(t_headers + t_body + each_row + '</tbody>');
        $("#pc_config_alert").hide();
        $('#pc_display').fadeIn();        
        $("#pc_srch_box").focus();
}

var err_precompile = function(error,ref_timeout)
{
    $('#pc_config_alert').removeClass('alert-warning');
    $('#pc_config_alert').addClass('alert-danger');
    $('#pc_config_alert').html(error);    
}

var ok_wfConnect = function(req_data,response,ref_timeout)
{
    //Once conneciton is established we request workflow details    
    getWorkflow();
    
}
var err_wfConnect = function(error)
{
    $('#wf_result').html(error);                        
}

var err_fetchSingleWF = function(error,ref_timeout)
{
    $('#wf_result').html(error);                        
}

var ok_fetchSingleWF = function(req_data,response,ref_timeout)
{              
    if(response.err==1)
    {                   
        prettyResult = "<br><br>Something went wrong : " + JSON.parse(response.data.info).originalError.info.message;        
    }
    else
    {   
        result  = response.data.info;          
        
        if(!Object.keys(result).length)
        {                   
            prettyResult = "<br><br>No workflows found where " + req_data.where_key + " like '" + req_data.where_val + "'";                                                   
            LATEST_INSTANCES = undefined;
        }
        else
        {                
            result['server_name'] = req_data.server;            
            result['metastore_name'] = req_data.db;             
            //Store results in global variable
            LATEST_INSTANCES = result;
            prettyResult = minimumPrettify('monitor');       
            generateWorkflowInstanceTable();         
        }                                            
    }       

    $('#wf_result').html(prettyResult);   
    $('#wf_result').fadeIn();
    //Set refreshing status
    $('#ref_status').hide();
        
    //Now that the result has been obtained, set a time out for refresh                    
    clearTimeout(wfRefreshTimer);         
    wfRefreshTimer = setTimeout(function()
    {   
        getWorkflow();                         
    }, ref_timeout * 1000);         

}

function generateWorkflowInstanceTable()
{
    t_headers = `
    <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">Instance ID</th>
            <th scope="col">Status</th>
            <th scope="col">Exec Time</th>            
            <th scope="col">File Name</th>
            <th scope="col">Inserted Records</th>            
            <th scope="col">Input DSI</th>
            <th scope="col">Output DSI</th>            
            <th scope="col">Start Time</th>
            <th scope="col">End Time</th>
            <th scope="col">Event GID</th>
        </tr>
    </thead>`;

    t_body = `<tbody>`;
    each_row = '';

    //Replace all null values with '-'
    LATEST_INSTANCES = JSON.parse(JSON.stringify(LATEST_INSTANCES).split(":null").join((':\"-"')));

    bold_style = '';
    limit = (LATEST_INSTANCES.length>7)?7:LATEST_INSTANCES.length;    
    for (i = 0; i < limit; i++) 
    {
        if(i==0)
        {
            bold_style = "style=\"font-family:'futura_bold', serif;font-weight:400\"";            
        }
        else
        {
            bold_style = '';
        }
        each_row += `
        <tr class="wfi_row" ` + bold_style + `">
            <th scope="row">` + (i+1) + `</th>                
                <td>`+ LATEST_INSTANCES[i].WORKFLOW_INSTANCE_ID + `</td>
                <td>`+ LATEST_INSTANCES[i].WORKFLOW_INSTANCE_STATUS + `</td>
                <td>`+ LATEST_INSTANCES[i].RUN_TIME_IN_MINS + `</td>                
                <td>`+ LATEST_INSTANCES[i].FILE_NM + `</td>
                <td>`+ LATEST_INSTANCES[i].NUM_RECORDS_INSERTED + `</td>                
                <td>`+ LATEST_INSTANCES[i].INPUT_DATASET_INSTANCE + `</td>
                <td>`+ LATEST_INSTANCES[i].OUTPUT_DATASET_INSTANCE + `</td>                
                <td>`+ LATEST_INSTANCES[i].START_DT + `</td>
                <td>`+ LATEST_INSTANCES[i].END_DT + `</td>
                <td>`+ LATEST_INSTANCES[i].EVENT_GROUP_ID + `</td>
        </tr>`;        
    }
           

    $('#wfi_table').html(t_headers + t_body + each_row + '</tbody>');
    $('#workflow_instance_status_display').fadeIn();
}

function nullToDash(obj){
    for(e in obj){
        if(obj.hasOwnProperty(e) && obj[e]===null){
            obj[e]="-";
        }
    }
    return obj;
}

function getWorkflow()
{    
    //Set refreshing statush
    //Disable wfi action buttons
    $('.wfi_action').attr('disabled','disabled');
    $('#VisitOozieButton').addClass('disabled');
    $('#ref_status').fadeIn();
    req_data = { server : server_name,auth_type: auth,where_key : 'WORKFLOW_ID', where_val : wf_id, order_by: 'WORKFLOW_INSTANCE_ID', order_type: 'desc', db:metastore , schema:'dbo', limit : instance_limit};                
    getRequest(req_data,ok_fetchSingleWF,err_fetchSingleWF,ref_timeout,'/wf_man/wf/exec_details');                                        
}


function getRequest(req_data,exec_function,err_function,ref_timeout,URL)
{   
    prettyResult =  "";
    
    cur_request =  $.ajax({
        url: URL,
        data : req_data,
        type: 'GET',
        beforeSend : function(xhr){                                                       
        },           
        success: function (response) 
        {    
            exec_function(req_data,response,ref_timeout);
        },
            fail : function(xhr,textStatus,error)
        {   
           err_function(error,ref_timeout);
        }
    });    
}

function ActDeactWorkflow(flag)
{    
    req_data = { server : server_name,auth_type: auth,db:metastore, schema:'dbo', workflow_id : wf_id, act_flag : flag};                

    $.ajax({
        url: '/wf_man/wf/act_deact',
        data : req_data,
        type: 'POST',
        beforeSend : function(xhr){            
            if(flag)
            {
                $("#act_wf").attr('disabled','disabled');                
                $("#act_wf").val('Activating workflow...');                
            }
            else
            {
                $("#deact_wf").attr('disabled','disabled');
                $("#deact_wf").val('Deactivating workflow...');                
            }
            
        },           
        success: function (response) 
        {               
            if(response.err==1)   
            {     
                if(response.data.info.originalError.info.message)
                {
                    response.data.info = response.data.info.originalError.info.message;
                }
                
                if(flag)
                {      
                    $("#act_wf").val(response.data.info);                
                }
                else
                {
                    $("#deact_wf").val(response.data.info);                
                }
            }
            else
            {
                $("#act_wf").val('Activated');                
                $("#deact_wf").val('Deactivated');                
                clearTimeout(wfRefreshTimer);         
                getWorkflow();
            }
         
        },
         fail : function(xhr,textStatus,error)
        {      
            if(flag)
            {      
                $("#act_wf").val('Error Activating. Please refresh page');                
            }
            else
            {
                $("#deact_wf").val('Error Deactivating. Please refresh page');                
            }
        }
        });
}


function minimumPrettify(result,screen)
{    
   
    var bodyStyles = window.getComputedStyle(document.body);
    var p_light = bodyStyles.getPropertyValue('--primary_light');
    var d_light = bodyStyles.getPropertyValue('--danger_light');
    var s_light = bodyStyles.getPropertyValue('--success_light');
    
    var p_dark = bodyStyles.getPropertyValue('--primary_dark');
    var d_dark = bodyStyles.getPropertyValue('--danger_dark');
    var s_dark = bodyStyles.getPropertyValue('--success_dark');

    var p_bright = bodyStyles.getPropertyValue('--primary_bright');
    var d_bright = bodyStyles.getPropertyValue('--danger_bright');
    var s_bright = bodyStyles.getPropertyValue('--success_bright');

    filtered_wfs = undefined;
    server_name = LATEST_INSTANCES['server_name'];
    metastore_name = LATEST_INSTANCES['metastore_name'];
    if(monitored_hosts)                    
    {                        
        if(monitored_hosts[server_name])
        {
            if(monitored_hosts[server_name][metastore_name])
            {
                filtered_wfs  = monitored_hosts[server_name][metastore_name].wf_id;
            }
        }
    }    
    
    var new_content = "";    
    resultList = [];

    //Prettify and display only the first row, i.e the latest instance, remaining, just store them away 
    //to be accessed for futher processing.    

    if(filtered_wfs && $.inArray(Number(wf_id), filtered_wfs) != -1)
        isChecked = "checked";            
    else
        isChecked = "";
    
    var act_deact = ''                  
    if(LATEST_INSTANCES[0].WF_ACTIVE_FLG==1)
    {
        act_deact =  `<input type="button" id="deact_wf" class="btn btn-danger btn-sm act_deact_wf" value="Deactivate Workflow"/>`            
    }
    else
    {
        act_deact =  `<input type="button" id="act_wf" class="btn btn-success btn-sm act_deact_wf" value="Activate Workflow"/>`
        s_light = '#eaeaea'
    }
        
            
    sel_light = p_light;
    sel_dark = p_dark;
    sel_bright = p_bright;
    if(['FAILED','FAILED-CLEANUPFAILED'].indexOf(LATEST_INSTANCES[0].WORKFLOW_INSTANCE_STATUS) >=0)        
    {
        sel_light = d_light;
        sel_dark = d_dark;
        sel_bright = d_bright;            
    }
    else if(['COMPLETE','COMPLETE-CLEANUPFAILED','COMPLETE-PENDINGCLEANUP'].indexOf(LATEST_INSTANCES[0].WORKFLOW_INSTANCE_STATUS) >=0)
        {
        sel_light = s_light;
        sel_dark = s_dark;
        sel_bright = s_bright;            
        }     
    server_details =  `<div class='col-lg-auto col-md-auto justify-content-left'><span class='gray_text'>SERVER </span><b>`
        + configured_hosts[server_name].nickname + ` </b><span class='gray_text'>(` + server_name + `)</span><b>` + 
    `</div></b>
    <div class='col-lg-auto col-md-auto justify-content-left'><span class='gray_text'>METASTORE </span><b>`
        + metastore_name.replace('_metastore','') + `</div></b>` +
    `<div class='col-lg-auto col-md-auto justify-content-left'><span class='gray_text'>INSTANCE </span><b>`
    + LATEST_INSTANCES[0].WORKFLOW_INSTANCE_ID + `</div></b>`;
    
    new_content =`
    <div class='container-fluid res_item' id='res_item_` + 0 +`' style='background-color:` + sel_light +`;border-left:`+ sel_dark +` solid 4px'>
        <div class='row'>
            <div class='col-lg-auto col-md-auto'>`
                + wf_id+   
            `</div>
            <div class='col-lg-auto col-md-auto'><b>`
                + LATEST_INSTANCES[0].WORKFLOW_NAME +   
            `</div></b>
            <div class='col-lg-auto col-md-auto' style='color:`+ sel_bright +`;font-weight:bold;'>`
                + LATEST_INSTANCES[0].WORKFLOW_INSTANCE_STATUS +   
            `</div>
            <div class='col-lg-auto col-md-auto ml-auto'>
                <input type="checkbox" id="mon_toggle_`+server_name+`_`+ metastore_name +`_`+ wf_id +`" name="set-name" class="switch-input" onClick="toggleMonitor('`+server_name+`','`+ metastore_name +`','`+ wf_id +`')" ` + isChecked + `>
                <label for="mon_toggle_`+server_name+`_`+ metastore_name +`_`+ wf_id+`" class="switch-label"><span class="toggle--on">Monitoring</span><span class="toggle--off">Monitor</span></label>
            </div>        
                        
        </div>                        
        <div class='row'>`                                
            + server_details +
            `<div class="btn-group mr-3 ml-auto">`
                + act_deact +   
            `</div>           
        </div>            
    </div>`;
    
    //Add individual result row in a list
    resultList.push(new_content)    
    return resultList;    
}


var modifyWFStatus = function(wfi_id)
{   
    var status = $("input[name='status_name']:checked").val();   
    
    req_data = { server : server_name,auth_type: auth,db:metastore, schema:'dbo', workflow_instance_id : wfi_id, workflow_status : status};                

    $.ajax({
            url: '/wf_man/wf/modifyStatus',
            data : req_data,
            type: 'POST',
            beforeSend : function(xhr){            
                $("#cancel_btn").hide();
                $('#modifyButton').attr('disabled','disabled');
                $("input[name='status_name']").attr('disabled','disabled');
                $('#modifyButton').html('Modifying...');
            },           
            success: function (response) 
            {               
                if(response.err==1)   
                {                 
                    if(response.data.info.originalError.info.message)
                    {
                        response.data.info = response.data.info.originalError.info.message;
                    }      
                    $('#modifyStatus_config_alert').html(response.data.info);
                    
                }
                else
                {
                    clearTimeout(wfRefreshTimer);                       
                    getWorkflow();
                    $('#modifyStatusDialog').modal('toggle');
                }

                $("#cancel_btn").show();
                $('#modifyButton').removeAttr('disabled');
                $("input[name='status_name']").removeAttr('disabled');
                $('#modifyButton').html('Modify');    
            
            },
            fail : function(xhr,textStatus,error)
            {      
                $('#modifyStatus_config_alert').html(error);                
                $("#cancel_btn").show();
                $('#modifyButton').removeAttr('disabled');
                $("input[name='status_name']").removeAttr('disabled');
                $('#modifyButton').html('Modify');    
            }
        });

   
}
