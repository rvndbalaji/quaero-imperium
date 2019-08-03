let params = (new URL(document.location)).searchParams;
let server_name = params.get("server");
let metastore = params.get("db");
let wf_id = params.get("wf");
let auth = params.get("auth");

var wfRefreshTimer;
var ref_timeout;

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

}

var ok_wfConnect = function(req_data)
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
        }
        else
        {                
            result['server_name'] = req_data.server;            
            result['metastore_name'] = req_data.db;             
            prettyResult = minimumPrettify(result,'monitor');    
            
        }                                            
    }       
    $('#wf_result').html(prettyResult);                        
    //Set refreshing status
    $('#ref_status').hide();
        
    //Now that the result has been obtained, set a time out for refresh                    
    clearTimeout(wfRefreshTimer);         
    wfRefreshTimer = setTimeout(function()
    {   
        getWorkflow();                         
    }, ref_timeout * 1000);         

}

function getWorkflow()
{
    //Set refreshing status
    $('#ref_status').fadeIn();
    req_data = { server : server_name,auth_type: auth,where_key : 'WORKFLOW_ID', where_val : wf_id, order_by: 'WORKFLOW_ID', order_type: 'desc', db:metastore , schema:'dbo'};                
    fetchWorkflow(req_data,ok_fetchSingleWF,err_fetchSingleWF,ref_timeout);                                        
}

function ActDeactWorkflow(flag)
{
    //USP_MODIFY_WORKFLOW_INSTANCE_STATUS
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
    server_name = result['server_name'];
    metastore_name = result['metastore_name'];
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
    for (i = 0; i < result.length; i++) {                 
        

        if(filtered_wfs && $.inArray(Number(result[i].WORKFLOW_ID), filtered_wfs) != -1)
            isChecked = "checked";            
        else
            isChecked = "";
        
        var act_deact = ''                
        if(result[i].ACTIVE_FLG==1)
        {
            act_deact =  `<input type="button" id="deact_wf" class="btn btn-danger btn-sm act_deact_wf" value="Deactivate Workflow"/>`            
        }
        else
        {
            act_deact =  `<input type="button" id="act_wf" class="btn btn-success btn-sm act_deact_wf" value="Activate Workflow"/>`
            s_light = '#eaeaea  '
        }
            
                
        sel_light = p_light;
        sel_dark = p_dark;
        sel_bright = p_bright;
        if(['FAILED','FAILED-CLEANUPFAILED'].indexOf(result[i].WORKFLOW_INSTANCE_STATUS) >=0)        
        {
            sel_light = d_light;
            sel_dark = d_dark;
            sel_bright = d_bright;            
        }
        else if(['COMPLETE','COMPLETE-CLEANUPFAILED','COMPLETE-PENDINGCLEANUP'].indexOf(result[i].WORKFLOW_INSTANCE_STATUS) >=0)
         {
            sel_light = s_light;
            sel_dark = s_dark;
            sel_bright = s_bright;            
         }     
        server_details =  `<div class='col-lg-auto col-md-auto justify-content-left'><span class='gray_text'>SERVER </span><b>`
           + configured_hosts[server_name].nickname + ` </b><span class='gray_text'>(` + server_name + `)</span><b>` + 
        `</div></b>
        <div class='col-lg-auto col-md-auto justify-content-left'><span class='gray_text'>METASTORE </span><b>`
            + metastore_name.replace('_metastore','') + `</div></b>`;
        
        new_content =`
        <div class='container-fluid res_item' id='res_item_` + i +`' style='background-color:` + sel_light +`;border-left:`+ sel_dark +` solid 4px'>
            <div class='row'>
                <div class='col-lg-auto col-md-auto'>`
                 + result[i].WORKFLOW_ID +   
                `</div>
                <div class='col-lg-auto col-md-auto'><b>`
                 + result[i].WORKFLOW_NAME +   
                `</div></b>
                <div class='col-lg-auto col-md-auto' style='color:`+ sel_bright +`;font-weight:bold;'>`
                 + result[i].WORKFLOW_INSTANCE_STATUS +   
                `</div>
                <div class='col-lg-auto col-md-auto ml-auto'>
                    <input type="checkbox" id="mon_toggle_`+server_name+`_`+ metastore_name +`_`+result[i].WORKFLOW_ID+`" name="set-name" class="switch-input" onClick="toggleMonitor('`+server_name+`','`+ metastore_name +`','`+result[i].WORKFLOW_ID+`')" ` + isChecked + `>
                    <label for="mon_toggle_`+server_name+`_`+ metastore_name +`_`+result[i].WORKFLOW_ID+`" class="switch-label"><span class="toggle--on">Monitoring</span><span class="toggle--off">Monitor</span></label>
                </div>        
                          
            </div>                        
            <div class='row'>`                                
                + server_details +
                `<div class="btn-group mr-3 ml-auto">`
                 + act_deact +   
                `</div>
                <div class="btn-group mr-3">
                <input type="button" id="modify_wf_inst" class="btn btn-secondary btn-sm" value="Modify Status"/>
                </div>
            </div>            
        </div>`;
        
        //Add individual result row in a list
        resultList.push(new_content)
      }               
    return resultList;    
}