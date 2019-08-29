let params = (new URL(document.location)).searchParams;
let server_name = params.get("server");
let metastore = params.get("db");
let wf_id = params.get("wf");
let auth = params.get("auth");
var wfRefreshTimer;
var ref_timeout;
var instance_limit =7;
let total_items = 6;
let items_loaded = 0;
let first_time_load = true;

///GLOBAL LATEST_VALUES
let LATEST_INSTANCES = undefined;
let current_error_logs;
let current_pc_param;
let current_datasets;
let current_entity;
let current_stage;
let current_source_system;
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
        ref_timeout = (ref_timeout<5)?5:ref_timeout;
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
        //Enable selection of rows in table        
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

   
    $('#stage_table').on('click', '.stage_row', function(event) {  
        
        //Enable selection of rows in table        
        if($(this).hasClass('table-active'))
        {                        
            $(this).removeClass('table-active'); 
            $('.stage_action').attr('disabled','disabled');               
        } else 
        {
            $(this).addClass('table-active').siblings().removeClass('table-active');            
            selected_row = $(this).children("th").html();                        
            //Set the data-title attribute that performs an action on the selected workflow stage file            
            ftp_id = current_stage[selected_row-1].FTP_ID;               
            $('#restageButton').attr('data-title',("Restage File " + ftp_id));
            $('#restageButton').attr('data-body',("Restaging removes file tracking information, downloads the file and ingests it again. This may cause duplication of data in the staging table<br>Are you sure you wish to re-stage the file?<br><b>" + current_stage[selected_row-1].FILE_NM + "</b>"));
            $('#restageButton').attr('data-alert',("alert-danger"));
            $('#restageButton').attr('data-alert_msg',("WARNING : You are about to perform a dangerous action"));
            $('#restageButton').attr('data-oktext',"Re-Stage");
            $('#msg_success_btn').attr('onclick','reStage(' + ftp_id + ')');
            $('.stage_action').removeAttr('disabled');                    
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

      $('#messageDialog').on('show.bs.modal', function (event) {                
        
        var button = $(event.relatedTarget) // Button that triggered the modal                                
        var body = button.attr('data-body')
        var alert = button.attr('data-alert')
        var alert_msg = button.attr('data-alert_msg')
        var okText = button.attr('data-oktext')
        var title = button.attr('data-title')

        $("#msg_config_alert").removeClass('alert-info');
        $("#msg_config_alert").removeClass('alert-danger');
        $("#msg_config_alert").removeClass('alert-success');
        $("#msg_config_alert").removeClass('alert-warning');
        $("#msg_config_alert").addClass(alert);
        $('#msg_config_alert').html(alert_msg);
        $('#msg_success_btn').html(okText);
        $('#msg_display').html(body);
        var modal = $(this)
        modal.find('.modal-title').text(title);                
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


        //Display progress bar only if its first time loading. If its refreshing, then not required.
        if(first_time_load)
        {
            $("#ref_progress_bar").fadeIn();            
        }        
        //Begin fetching DATASETS, ENTITY       
        getDatasets();       
}

var getBlockedStatus = function()
{   
    req_data = { server : server_name,auth_type: auth,workflow_id: wf_id, db:metastore , schema:'dbo'};                
    getRequest(req_data,ok_blockInfo,err_blockInfo,undefined,'/wf_man/wf/blockInfo');                                        
}


var ok_blockInfo = function(req_data,response,ref_timeout)
{
    if(response.err==1)
    {   
        err_blockInfo(response);
    }        
    else
    {
        blockRows = response.data.info;                
        block_reasons = []        
        
        if(LATEST_INSTANCES && !LATEST_INSTANCES[0].WORKFLOW_INSTANCE_STATUS.match('COMPLETE.*|FAILED.*'))
        {
            $("#blocked_reason").hide();
        }
        else
        {                        
            if(blockRows.length>0)
            {           
                if(blockRows.length==1 && blockRows[0].BLOCKED_REASON.match("No Available DSIs"))     
                {
                    $("#blocked_reason").hide();
                }
                else 
                {
                    for(i=0; i<blockRows.length; i++)
                    {
                        block_reasons.push(blockRows[i].BLOCKED_REASON)
                    }                         
                    $("#blocked_reason").html(block_reasons.join(', '));
                    $("#blocked_reason").fadeIn();
                }
            }              
            else
            {
                //If there is workflow is not blocked and not executing, it implies
                //that the workflow is waiting to be dispatched
                $("#blocked_reason").html("<span style='color:black'><i>Awaiting Dispatch</i></span>");
                $("#blocked_reason").fadeIn();
            }
            
        }        
        updateLoadProgress();   
            
    }
}

var updateLoadProgress = function()
{    
    //We display the Load Progress bar only when the page is loading
    //During refresh, nothing is displayed except the refresh status
    //which is hidden when this function is called    
    items_loaded++;
    percent_refreshed = (items_loaded/total_items)* 100;
    $("#ref_progress").css('width',percent_refreshed + '%');   
    if(items_loaded>=total_items)    
    {        
        $("#ref_progress").css('width',0);           
        $("#ref_progress_bar").hide();
        $("#ref_status").hide();        
        
        $('#wf_result').fadeIn();    

        if(LATEST_INSTANCES && LATEST_INSTANCES.length>0)
        {
            $('#workflow_instance_status_display').fadeIn();    
        }
        
        if(current_datasets && current_datasets.length>0)
        {
            $('#dataset_display').fadeIn();        
        }
        
        if(current_entity.length && current_entity.length>0)
        {
            $("#entity_display").fadeIn();
        }

        $("#blocked_wf").fadeIn(); 
        //Display stage only if stage is available    
        if(current_stage.length && current_stage.length>=0)
        {
            $("#stage_display").fadeIn();
        }
        if(current_source_system && current_source_system.length>=0)
        {
            $("#ss_display").fadeIn();
        }

        first_time_load = false;
        items_loaded=total_items;
    }
}

var err_blockInfo = function(error)
{
    console.log("BlockInfo : " + JSON.stringify(error))
    updateLoadProgress();   
}


var getSourceEntity = function()
{   
    req_data = { server : server_name,auth_type: auth,workflow_id: wf_id, db:metastore , schema:'dbo'};                
    getRequest(req_data,ok_fetchEntity,err_fetchEntity,undefined,'/wf_man/wf/entity');                                        
}


var ok_fetchEntity = function(req_data,response,ref_timeout)
{
    if(response.err==1)
    {   
        err_fetchEntity(response);
    }        
    else
    {
        current_entity = response.data.info;        
        displayEntityTable(current_entity);                
        updateLoadProgress();   
        //Once we fetch the entities, we may use the entity_id to fetch Staging details
        getStageInfo();        
        //Once we fetch the entities, we may use the source_system_id to fetch Source System details
        getSourceSystem();        
    }
    
}

var err_fetchEntity = function(error)
{
    console.log("EntityFetch : " + JSON.stringify(error))
    updateLoadProgress();   
}

var displayEntityTable = function(current_entity)
{
    if(current_entity.length==0)
    {
        $("#entity_display").hide(); 
        $('#ent_table').html("<i>No source entities used by this workflow</i>");                                   
        return;
    }
    bold_style = "style=\"font-family:'futura_bold', serif;font-weight:400\"";            
    t_headers = `
        <thead>
            <tr ` + bold_style + `">                                        
                <th scope="col">Entity ID</th>
                <th scope="col">Name</th>
                <th scope="col">Stage Table</th>
                <th scope="col">Stage Strategy</th>                
                <th scope="col">Include Header</th>
                <th scope="col">Header Rows</th>
                <th scope="col">File Mask</th>
                <th scope="col">Column Delimiter</th>
                <th scope="col">Row Delimiter</th>
                <th scope="col">Text Qualifier</th>            
                <th scope="col">File Format</th>            
                <th scope="col">Frequency</th>            
                <th scope="col">Freq Days</th>            
                <th scope="col">Unzip Flag</th>                
                <th scope="col">Active</th>                
            </tr>
        </thead>`;

        //Replace all null values with '-'
        current_entity = JSON.parse(JSON.stringify(current_entity).split(":null").join((':\"-"')));

        t_body = `<tbody>`;
        each_row = '';
        bold_style = '';
        for (i = 0; i < current_entity.length; i++) 
        {        
            
            each_row += `            
            <tr class="ent_row">
                <td>`+ current_entity[i].ID + `</td>                                          
                <td>`+ current_entity[i].ENTITY_NM + `</td>
                <td>`+ current_entity[i].STAGE_TABLE_NM + `</td>                                    
                <td>`+ current_entity[i].STAGE_STRATEGY + `</td>                                    
                <td>`+ current_entity[i].INCLUDE_HEADER + `</td>                                    
                <td>`+ current_entity[i].NUM_HEADER_ROWS + `</td>                          
                <td>`+ current_entity[i].SOURCE_FILE_MASK + `</td>
                <td>`+ current_entity[i].COLUMN_DELIMITER + `</td>
                <td>`+ current_entity[i].ROW_DELIMITER + `</td>
                <td>`+ current_entity[i].TEXT_QUALIFIER + `</td>
                <td>`+ current_entity[i].FILE_FORMAT_ID + `</td>
                <td>`+ current_entity[i].TEXT_QUALIFIER + `</td>
                <td>`+ current_entity[i].FREQUENCY + `</td>
                <td>`+ current_entity[i].FREQUENCY_DAYS + `</td>
                <td>`+ current_entity[i].ACTIVE_FLG + `</td>
            </tr>`;        
        }                   
        $('#ent_table').html(t_headers + t_body + each_row + '</tbody>');                                
}


var getSourceSystem = function()
{   

    system_id_list =  []
    for(i=0; i<current_entity.length; i++)
    {
        system_id_list.push(current_entity[i].SYSTEM_ID)
    }
    
    req_data = { server : server_name,auth_type: auth,ss_id: system_id_list.join(","), db:metastore , schema:'dbo'};
    getRequest(req_data,ok_fetchSource,err_fetchSource,undefined,'/wf_man/wf/source_system');                                        
}


var ok_fetchSource = function(req_data,response,ref_timeout)
{
    if(response.err==1)
    {   
        err_fetchSource(response);
    }        
    else
    {
        current_source_system = response.data.info;        
        displaySourceSystemTable(current_source_system);                
        updateLoadProgress();           
    }
    
}

var err_fetchSource = function(error)
{
    console.log("SourceSystemFetch : " + JSON.stringify(error))
    updateLoadProgress();   
}

var displaySourceSystemTable = function(current_source_system)
{
    if(current_source_system.length==0)
    {
        $("#ss_display").hide(); 
        $('#ss_table').html("<i>No source systems used by this workflow</i>");                                   
        return;
    }
    bold_style = "style=\"font-family:'futura_bold', serif;font-weight:400\"";            
    t_headers = `
        <thead>
            <tr ` + bold_style + `">                                        
                <th scope="col">System ID</th>
                <th scope="col">Name</th>
                <th scope="col">Ingestion Protocol</th>                
                <th scope="col">Host ID</th>
                <th scope="col">Scan Interval</th>        
                <th scope="col">Directory</th>        
                <th scope="col">Type</th>        
                <th scope="col">Active</th>                
            </tr>
        </thead>`;

        //Replace all null values with '-'
        current_source_system = JSON.parse(JSON.stringify(current_source_system).split(":null").join((':\"-"')));

        t_body = `<tbody>`;
        each_row = '';
        bold_style = '';
        for (i = 0; i < current_source_system.length; i++) 
        {        
            
            each_row += `            
            <tr class="ent_row">
                <td>`+ current_source_system[i].ID + `</td>                                          
                <td>`+ current_source_system[i].SYSTEM_NM + `</td>
                <td>`+ current_source_system[i].DATA_INGESTION_PROTOCOL + `</td>                                                    
                <td>`+ current_source_system[i].API_HOST_ID + `</td>                          
                <td>`+ current_source_system[i].SOURCE_SYSTEM_TIME_BETWEEN_SCAN_SECS + `</td>
                <td>`+ current_source_system[i].REMOTE_DIRECTORY + `</td>
                <td>`+ current_source_system[i].SYSTEM_TYPE + `</td>                
                <td>`+ current_source_system[i].ACTIVE_FLG + `</td>
            </tr>`;        
        }                   
        $('#ss_table').html(t_headers + t_body + each_row + '</tbody>');                                
}

var getStageInfo = function()
{   
    if(current_entity[0]) 
    {        
        req_data = { server : server_name,auth_type: auth,entity_id: current_entity[0].ID, db:metastore , schema:'dbo'};                
        getRequest(req_data,ok_stageInfo,err_stageInfo,undefined,'/wf_man/wf/stageInfo');                                        
    }
    else
    {        
        $('#stage_table').html("<i>No files were staged by this workflow</i>");                                   
        $("#stage_display").hide();          
        updateLoadProgress();   
    }
}


var ok_stageInfo = function(req_data,response,ref_timeout)
{
    if(response.err==1)
    {   
        err_stageInfo(response);
    }        
    else
    {
        current_stage = response.data.info;   
        displayStageInformation(current_stage);                        
    }
    updateLoadProgress();       
}

var err_stageInfo = function(error)
{
    console.log("StageFetch : " + JSON.stringify(error))
    updateLoadProgress();   
}

function formatBytes(bytes, decimals = 2) {
    bytes = parseInt(bytes);
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

var displayStageInformation = function(current_stage)
{    
    if(current_stage.length==0)
    {
        $("#stage_display").hide(); 
        $('#stage_table').html("<i>No files were staged by this workflow</i>");                                   
        return;
    }
    bold_style = "style=\"font-family:'futura_bold', serif;font-weight:400\"";            
    t_headers = `
        <thead>
            <tr ` + bold_style + `">        
                <th scope="col">#</th>             
                <th scope="col">Dataset Instance ID</th>                               
                <th scope="col">File Name</th>                
                <th scope="col">FTP Status</th>                                
                <th scope="col">File Status</th>                
                <th scope="col">DSI Status</th>                                
                <th scope="col">File Size</th>                
            </tr>
        </thead>`;

        //Replace all null values with '-'
        current_stage = JSON.parse(JSON.stringify(current_stage).split(":null").join((':\"-"')));

        t_body = `<tbody>`;
        each_row = '';
        bold_style = '';
        limit = (current_stage.length>7)?7:current_stage.length;
        var failed_files = 0;
        for (i = 0; i < limit; i++) 
        {        
            file_size = current_stage[i].FILE_SIZE_BYTES;
            
            if(file_size!='-')
            {                   
                file_size = formatBytes(file_size);                
            }
            color_code_row = "stage_row"
            //Match all status which contains the text 'fail'. i option is case-insensitive
            var fail_string_regex = new RegExp('.*FAIL.*','i');
            if(current_stage[i].FTP_STATUS.match(fail_string_regex) || current_stage[i].FLE_STATUS.match(fail_string_regex) || current_stage[i].DSI_STATUS.match(fail_string_regex))
            {
                color_code_row = "stage_row text-danger font-weight-bold"                
                failed_files++;                
            }                       
            each_row += `                        
            <tr class="` + color_code_row + `">
                <th scope="row">` + (i+1) + `</th>                
                <td>`+ current_stage[i].DATASET_INSTANCE_ID + `</td>                                    
                <td>`+ current_stage[i].FILE_NM + `</td>                                          
                <td>`+ current_stage[i].FTP_STATUS + `</td>
                <td>`+ current_stage[i].FLE_STATUS + `</td>                                                    
                <td>`+ current_stage[i].DSI_STATUS + `</td>                                    
                <td>`+ file_size +`</td>                                    
            </tr>`;        
        }        
        if(failed_files>0)
        {
            $('#stage_status').html("Ingestion failed for " +failed_files + " files");           
            $('#stage_wf').fadeIn();
        }
        else
        {
            $('#stage_wf').fadeOut();
        }
        
        $('#stage_table').html(t_headers + t_body + each_row + '</tbody>');                                        
}

var getDatasets = function()
{    
    req_data = { server : server_name,auth_type: auth,workflow_id: wf_id, db:metastore , schema:'dbo'};                
    getRequest(req_data,ok_fetchDatasets,err_fetchDatasets,undefined,'/wf_man/wf/datasets');                                        
}

var ok_fetchDatasets = function(req_data,response,ref_timeout)
{
    if(response.err==1)
    {   
        err_fetchDatasets(response);
    }        
    else
    {
        current_datasets = response.data.info;
        displayDatasetTable(current_datasets);            
        updateLoadProgress();   
    }
}

var err_fetchDatasets = function(error)
{
    console.log("DatasetFetch : " + JSON.stringify(error))
    updateLoadProgress();   
}


var displayDatasetTable = function(current_datasets)
{
    if(current_datasets.length==0)
    {
        $("#dataset_display").hide(); 
        $('#ds_table').html("<i>No input/output datasets for this workflow</i>");                                   
        return;
    }
    bold_style = "style=\"font-family:'futura_bold', serif;font-weight:400\"";            
    t_headers = `
        <thead>
            <tr ` + bold_style + `">                        
                <th scope="col">Dataset Type</th>            
                <th scope="col">Dataset ID</th>
                <th scope="col">Name</th>
                <th scope="col">Object Type</th>
                <th scope="col">Object Schema</th>                
                <th scope="col">Host ID</th>
                <th scope="col">Active</th>
                <th scope="col">Primary Columns</th>
                <th scope="col">Data Columns</th>
                <th scope="col">Partition Columns</th>                
            </tr>
        </thead>`;

        //Replace all null values with '-'
        current_datasets = JSON.parse(JSON.stringify(current_datasets).split(":null").join((':\"-"')));

        t_body = `<tbody>`;
        each_row = '';
        bold_style = '';
        for (i = 0; i < current_datasets.length; i++) 
        {        
            
            each_row += `            
            <tr class="ds_row">
                <td>`+ current_datasets[i].DATASET_TYPE + `</td>                                          
                <td>`+ current_datasets[i].DATASET_ID + `</td>
                <td>`+ current_datasets[i].DATASET_NAME + `</td>                                    
                <td>`+ current_datasets[i].OBJECT_TYPE + `</td>                                    
                <td>`+ current_datasets[i].OBJECT_SCHEMA + `</td>                                    
                <td>`+ current_datasets[i].HOST_ID + `</td>          
                <td>`+ ((current_datasets[i].ACTIVE_FLG==1)?'Yes':'<span style=\'color:var(--danger_bright)\'>NO</span>') + `</td>                          
                <td>`+ current_datasets[i].PRIMARY_KEY_COLUMNS + `</td>
                <td>`+ current_datasets[i].DATA_COLUMNS + `</td>
                <td>`+ current_datasets[i].PARTITION_COLUMNS + `</td>                
            </tr>`;        
        }                   
        $('#ds_table').html(t_headers + t_body + each_row + '</tbody>');                                
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
        err_elog(JSON.stringify(error));
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

var err_elog = function(error)
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

var err_precompile = function(error)
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

var err_fetchSingleWF = function(error)
{
    $('#wf_result').html(error);   
    updateLoadProgress();                          
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
    updateLoadProgress();     
        
    //Now that the result has been obtained, set a time out for refresh                    
    clearTimeout(wfRefreshTimer);         
    wfRefreshTimer = setTimeout(function()
    {   
        getWorkflow();                         
    }, ref_timeout * 1000);         

}

function generateWorkflowInstanceTable()
{
    if(LATEST_INSTANCES.length==0)
    {        
        $('#wfi_table').html("<i>This workflow was never executed, so no instances were found</i>");                                   
        return;
    }
    bold_style = "style=\"font-family:'futura_bold', serif;font-weight:400\"";            
    t_headers = `
        <thead>
        <tr ` + bold_style + `"> 
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

    //limit = LATEST_INSTANCES.length;
    limit = (LATEST_INSTANCES.length>instance_limit)?instance_limit:LATEST_INSTANCES.length;    

    for (i = 0; i < limit; i++) 
    {
        if(i==0)
        {
            bold_style = "style=\"font-weight:400\"";            
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
}

function reStage(ftp_id_num)
{
    req_data = { server : server_name,auth_type: auth,ftp_id : ftp_id_num, db:metastore , schema:'dbo', limit : instance_limit};                
    
    $('#msg_config_alert').removeClass('alert-danger');
    $('#msg_config_alert').addClass('alert-warning');
    $('#msg_config_alert').html("Removing tracking information...");        
    $("#msg_success_btn").text('Re-staging...')
    $("#msg_success_btn").attr('disabled','disabled');
    getRequest(req_data,ok_restage,err_restage,ref_timeout,'/wf_man/wf/restage');                                                            
}


var ok_restage = function(req_data,response,ref_timeout)
{
    if(response.err==1)
    {   
        err_restage(response);
    }        
    else
    {        
        clearTimeout(wfRefreshTimer);                       
        getWorkflow();
        $("#msg_success_btn").removeAttr('disabled');
        $('#messageDialog').modal('toggle');
    }
    
}

var err_restage = function(error)
{
    $('#msg_config_alert').html("Something went wrong");        
    $('#msg_config_alert').removeClass('alert-warning');
    $('#msg_config_alert').addClass('alert-danger');    
    $("#msg_success_btn").text('Re-Stage')
    $("#msg_success_btn").removeAttr('disabled');
    $('#msg_config_alert').html(JSON.stringify(error));            
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
    //Set refreshing status
    $('#ref_status').fadeIn();

    //Disable wfi action buttons
    $('.wfi_action').attr('disabled','disabled');
    $('#VisitOozieButton').addClass('disabled');

    req_data = { server : server_name,auth_type: auth,where_key : 'WORKFLOW_ID', where_val : wf_id, order_by: 'WORKFLOW_INSTANCE_ID', order_type: 'desc', db:metastore , schema:'dbo', limit : instance_limit};                
    getRequest(req_data,ok_fetchSingleWF,err_fetchSingleWF,ref_timeout,'/wf_man/wf/exec_details');                                        

    //Add all functions that you wish to run at every refresh    
    getSourceEntity();  //Implicitly gets StagingInfo 
    getBlockedStatus();
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
