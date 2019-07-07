let userLoaded = false;
var currentUser;
var visScreen;
var unsAuth;
var unsHost;
var unsMon;
var manualToggle=false;
function getCurrentUser(auth) {    
  return new Promise((resolve, reject) => {
     if (userLoaded) {         
          resolve(firebase.auth().currentUser);             
     }     
     else
    {   
        if (unsAuth) unsAuth();
        unsAuth = auth.onAuthStateChanged(user => 
        {   
            if (!user) {                                   
                clearSession();
            }         
            else{                
                userLoaded = true; 
                currentUser = user;
                resolve(user);
            }
        }, reject);
    }
    
  });
}
var clearSession = function()
{
    unsAuth();
    currentUser = undefined;               
    userLoaded = false;
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";                                         
    window.location.replace('users/login');                                             
}

var fire;
$(document).ready(function(){        
    
    if(window.location.pathname=='/' || window.location.pathname=='/wf_man')
    {
        getCurrentUser(firebase.auth()).then(user=>{            
            currentUser = user;                
                fire = firebase.firestore().collection('root');          
                if(window.location.pathname=='/wf_man')
                {   
                    visScreen = $('#srch_body');
                    declareListeners();                      
                }
        }).catch(err=>{
            console.log(err);          
        });
    }
    
});

var configured_hosts;
var monitored_hosts;
var monRefreshTimer;
var scrollTim;
var declareListeners = function()
{   
    $('#editServer').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var type = button.data('type')         
        var title = button.data('title')            
        var host_name = button.html();       

        var modal = $(this)
        modal.find('.modal-title').text(title)        
        $('#deleteServerDetails').fadeIn(); 
        $('#host_name').attr('disabled','disabled');       
        if(type=='add')
        {
            host_name = "";            
            $('#deleteServerDetails').hide();
            $('#host_name').removeAttr('disabled');
        }
        else
        {   
            //Get and Set the server type
            server_type  = configured_hosts[host_name].server_type;
            auth_type  = configured_hosts[host_name].auth_type;            
            nick_name  = configured_hosts[host_name].nickname;                                    
            (server_type==1)?($('#prod_option').prop('checked',true)):$('#test_option').prop('checked',true);
            (auth_type==1)?($('#sql_option').prop('checked',true)):$('#win_option').prop('checked',true);
            $('#nick_name').val(nick_name);
            
        }
        //Set the host name        
        $('#host_name').val(host_name);
        $('#host_name').focus();

    });

    
    $('#ref_box').change(function() {
        //This function is triggered when the refresh box value has changed                     
        
        if(visScreen.prop('id')=='mon_body')
        {
            //Give a 1 second delay incase the user is "scrolling" through the numbers
            //provided the user has already been on this screen
            clearTimeout(scrollTim);            
            scrollTime = setTimeout(refreshMonitors,1000);            
        }
        else{
            visScreen = $('#mon_body');
            $('#mon_body').show();     
            refreshMonitors();                        
        }

    });

    $('#editServer').on('hide.bs.modal', function (event) {
        //When dialog is closed, hide errors
        $("#host_name").val('');
        $("#nick_name").val('');
        $("#server_config_alert").hide();
    });

    //Hide all config dialog at first    
    $("#server_config_alert").hide();
    $('#notif_bar').hide();

    //Listener to get the monitors and update any workflow results
   //Remove any previous listeners            
   if (unsMon) unsMon();   
   unsMon =  fire.doc('users').collection(currentUser.uid).doc('monitors').onSnapshot(function(monitors)
    {
        monitored_hosts = undefined;                    
        if (monitors.exists) {            
            monitored_hosts = monitors.data();                                         
        }
        if(!manualToggle){
            prev_searchterm="";
            //Refresh the search results on Search screen
            performSearch();                              
            return;          
        }
        
        manualToggle = false;

        
    });

    //Listener to get hosts and set them as drop down menus in search section
    //Remove any previous listeners     
   if (unsHost) unsHost();   
   unsHost =  fire.doc('users').collection(currentUser.uid).doc('hosts').onSnapshot(function(hosts)
    {      
        
        var empty = true;
        if (hosts.exists) 
        {            
            configured_hosts = hosts.data();
            configured_host_names = Object.keys(configured_hosts);                        
            if(configured_host_names.length!=0)
            {
                var sett_content = "";
                var srch_content = "";
                configured_host_names.forEach(myFunction);            
                function myFunction(item, index) 
                {
                    sett_content += "<div class='col-lg-auto col-md-auto col-sm-auto col-xs-auto'><button type='button' class='btn btn-light'  data-toggle='modal' data-target='#editServer' data-type='edit' data-title='Edit server'>" + item + "</button></div>"; 
                    srch_content += "<a class='dropdown-item server_item' href='#' target='_self'>" +  item + " - " + configured_hosts[item].nickname +  "</a>"

                    //For every server, begin making connections to it
                    $('#load_txt').text("Preparing workspace...");                                                            
                    req_data = {server : item,auth_type: configured_hosts[item].auth_type};
                    performConnect(req_data,ok_initConnect,err_initConnect);
                }               

                $('#server_list').html(sett_content);                                            
                $('#server_drop').html(srch_content);                                                            
                $('#server_name').removeAttr('disabled');        
                $('#server_name').html("Select server");                                                                                            
                disableSearch();
                
                empty =false;
            }
        }
        if(empty)
        {
            $('#server_list').html("<div class='col-lg-auto col-md-auto col-sm-auto col-xs-auto'>You haven't configured any servers</div>");            
            $('#server_name').html("Not configured");                                            
            $('#server_name').attr('disabled','disabled');    
            disableSearch();      
             
        }        
    });    
}

var refreshMonitors =  function()
{
    clearTimeout(monRefreshTimer);  
    mon_failed_wf_count =0;
    mon_complete_wf_count =0;
    mon_executing_wf_count =0;
    //Refresh monitors only if its not already refreshing
    if(remaining_monitors_to_be_loaded==0) 
    {        
        performMonitorRefresh();        
    }                              
}

var disableSearch = function()
{
    $('#srch_box').attr('disabled','disabled');
    $("#metastore_name").attr('disabled','disabled');
    $('#srch_col').attr('disabled','disabled');
    $('#order_col').attr('disabled','disabled');
    $('#order_type').attr('disabled','disabled'); 
}


var typingTimer;                //timer identifier
var showSearch = function()
{    
    //Set the listener for selecting server
    $(".server_item").unbind().click(function()
    {
        var button = $(this).parents(".btn-group").find('.btn')        
        host_name = $(this).text();        
        button.html(host_name.substr(0, host_name.indexOf('-')).trim());                
        //Now that the server is selected, we need to fetch the list of metastores
        //and establish connection
        disableSearch();

        prev_searchterm="";
        $('#srch_box').val('');
        $('#srch_result_div').html("<br><br>Search for workflows and filter them from above");                        
        $('#notif_bar').fadeIn();
        $('#notif_bar').text("Connecting to sever...");    
        $('#notif_bar').css('background-color','#2196F3');        
        performConnect(req_data = undefined,ok_srchConnect,err_srchConnect);        
    });    

    visScreen.hide();          

    //setup before functions
    clearTimeout(typingTimer);  
    clearInterval(dashStatsTimer);
    clearTimeout(scrollTim);
    clearTimeout(monRefreshTimer);

    var doneTypingInterval = 1000;  //time in ms, 1 second for example
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

    visScreen = $('#srch_body');
    $('.menu_item').removeClass('menu_selected');
    $('#srch_menu').addClass('menu_selected');
    //Remove the loading text 
    $('#load_img').hide();
    $('#srch_body').show();            
    $('.menu_item').fadeIn();
}

var monTimer;


var showMonitor = function()
{    
    clearTimeout(typingTimer);  
    clearInterval(dashStatsTimer);    

    if(visScreen.prop('id')!='mon_body')
    {        
        visScreen.hide();        
    }     
    $('.menu_item').removeClass('menu_selected');
    $('#mon_menu').addClass('menu_selected');
    $('#ref_box').change();       
}

totalMonitors = [];
remaining_monitors_to_be_loaded = 0;
var performMonitorRefresh = function()
{       
    var ref_sec = Number($('#ref_box').val());                    
    totalMonitors = [];
    $('#mon_status').fadeIn();

    for(server_name in monitored_hosts)
    {        
        for(metastore_name in monitored_hosts[server_name])
        {            
             wf_list = monitored_hosts[server_name][metastore_name];
             if(wf_list)
             {                 
                 for(i=0; i< wf_list.wf_id.length; i++)                 
                 {
                    //We have the workflow ID, lets fetch the details                           
                    remaining_monitors_to_be_loaded++;                    
                    fetchWorkflow(server_name,metastore_name,wf_list.wf_id[i],'WORKFLOW_ID','WORKFLOW_ID','asc',ref_sec);                                        
                 }
             }
           
        }
    }   

    $('#mon_body').show();    
}

var current_div;

function performConnect(req_data,exec_function,err_function)
    {   
        //Check if payload has been passed, if not, fetch it.        
        if(!req_data)
        {
            server_name = $('#server_name').html().trim();        
            req_data = {server : server_name,auth_type: configured_hosts[server_name].auth_type};
        }        
        $.ajax({
            url: '/wf_man/connectSQL',
            data : req_data,
            type: 'POST',                   
            success: function (response) 
            {         
                if(response.err==1)   
                {     
                    err_function(response);
                }
                else{
                    exec_function(req_data);                    
                }
                
            },
            fail : function(xhr,textStatus,error)
            {
               err_function(error);               
            }
            });
    }

var err_initConnect = function(error)
{
    
    //When an initial connection to a server fails, we will just ignore it for now
    //and increment attempts
    host_connect_attempt_count++;
    console.log("FAILED initConnect " + error);
}

host_connect_attempt_count = 0;
var ok_initConnect = function(req_data)
{       
    //When an initial connection for a host is performed, we increment the connection attempt count
    //because, if anything fails, we still want to be able to load the app
    host_connect_attempt_count++;
    
    //Once initial connection attempt is done for all hosts, equal to total configured hosts, we'll show the search screen

    if(host_connect_attempt_count==configured_host_names.length)    
    {
        //If current screen is search section, display the search screen
        if(visScreen.prop('id')=='srch_body')
        {
            //Display search section
            showSearch();           
        }
    }      
}    


var err_serverConfig = function(error)
{
    $('#server_config_alert').removeClass('alert-danger');
    $('#server_config_alert').addClass('alert-warning');    
    $("#server_config_alert").text(error.data.info);
    $("#server_config_alert").fadeIn();
    $("#host_name").removeAttr('disabled');
    $("input[name='auth_type']").removeAttr('disabled');
    $("input[name='server_type']").removeAttr('disabled');
    $("#saveServerDetails").removeAttr('disabled');
}

var ok_serverConfig = function(req_data)
{                                   
    writeHostDetailsToFirebase(req_data);
}


var err_srchConnect = function(error)
{
    $('#notif_bar').text(error.data.info);
    $('#notif_bar').css('background-color','#F44336');
}

var ok_srchConnect = function(req_data)
{
    $('#notif_bar').css('background-color','#4CAF50');
    $('#notif_bar').text("Connected");      
    fetchMetastores();                      
}


function fetchWorkflow(server_name,metastore_name,srch_val,srch_col,order_col,order_ad,ref_timeout)
{   
    prettyResult =  "";
    req_data = { server : server_name,auth_type: configured_hosts[server_name].auth_type,where_key : srch_col, where_val : srch_val, order_by: order_col, order_type: order_ad, db:metastore_name , schema:'dbo'};            
    cur_request =  $.ajax({
        url: '/wf_man/search/wf',
        data : req_data,
        type: 'GET',
        beforeSend : function(xhr){                                                       
        },           
        success: function (response) 
        {    
            if(response.err==1)
            {   
                prettyResult = "<br><br>Something went wrong : " + response.data.info;
            }
            else
            {                
                result  = response.data.info;          
                      
                if(!Object.keys(result).length)
                {                   
                    prettyResult = "<br><br>No workflows found where " + srch_col + " like '" + srch_val + "'";                                       
                    //If no workflows were found, make sure this workflow isn't being monitored.
                    //Remove entry.
                    toggleMonitor(server_name,metastore_name,srch_val);
                }
                else
                {                
                    result['server_name'] = server_name;
                    result['metastore_name'] = metastore_name;                    
                    prettyResult = getPrettifyResults(result,'monitor');                                        
                }                                            
            }            

            totalMonitors.push(prettyResult);
            remaining_monitors_to_be_loaded--;
            if(remaining_monitors_to_be_loaded<=0)
            {
                //Sort the workflows, because order might keep changing during refresh
                totalMonitors.sort();
                remaining_monitors_to_be_loaded=0;
                $('#monitor_div').html(totalMonitors.join(' '));
                $('#mon_status').hide();     
                setWorkflowStatusCounts();
                
                //Now that all results have been obtained, set a time out for refresh                
                clearTimeout(monRefreshTimer);         
                monRefreshTimer = setTimeout(function()
                {                    
                    refreshMonitors();     
                    console.log('refresh');
                }, ref_timeout * 1000);       
            }
        },
            fail : function(xhr,textStatus,error)
        {   
            totalMonitors.push(error);
            remaining_monitors_to_be_loaded--;
            if(remaining_monitors_to_be_loaded<=0)
            {
                remaining_monitors_to_be_loaded=0;
                $('#monitor_div').html(totalMonitors.join(' '));
                $('#mon_status').hide(); 
                setWorkflowStatusCounts();  
                
                 //Now that all results have been obtained, set a time out for refresh
                 clearTimeout(monRefreshTimer);         
                 monRefreshTimer = setTimeout(function()
                 {                    
                     refreshMonitors();                    
                 }, ref_timeout * 1000);       
            }                    
        }
        });    
}

var setWorkflowStatusCounts = function()
{
    $('#complete_filter_label').html("<span class='green_text font-weight-bold'>" + mon_complete_wf_count + "</span> COMPLETE%");
    $('#failed_filter_label').html("<span class='red_text font-weight-bold'>" + mon_failed_wf_count + "</span> FAILED%");
    $('#executing_filter_label').html("<span class='blue_text font-weight-bold'>" + mon_executing_wf_count + "</span> EXECUTING");
}
function fetchMetastores()
{
     server_name = $('#server_name').html().trim();         
     req_data = {server : server_name,auth_type: configured_hosts[server_name].auth_type};                                                                    
     $.ajax({
         url: '/wf_man/getMetastores',
         data : req_data,
         type: 'POST',
         beforeSend : function(xhr){    
             empty = true;                                                        
             $('#notif_bar').text("Fetching metastores...");    
             $('#notif_bar').css('background-color','#1ABC9C');
         },           
         success: function (response) 
         {                
             if(response.err==1)
             {
                 $('#notif_bar').text(response.data.info);
                 $('#notif_bar').css('background-color','#F44336');
             }
             else{

                 //We have the metastores, let's update them                                                
                 metastore_list = Object.values(response.data.info);                                                    
                 if(metastore_list.length!=0)
                 {
                     var meta_content = "";
                     metastore_list.forEach(myFunction);            
                     function myFunction(item, index) 
                     {
                         meta_content += "<a class='dropdown-item meta_item' href='#' target='_self'>" + item['NAME'].replace('_metastore','') + "</a>"
                     }                                                                                                            
                     $('#meta_drop').html(meta_content);                                                            
                     $('#metastore_name').removeAttr('disabled');         
                     $('#metastore_name').html("Select metastore");                                                  
                     empty =false;
                 }
                 if(empty)
                 {
                     $('#server_list').html("<div class='col-lg-auto col-md-auto col-sm-auto col-xs-auto'>You haven't configured any servers</div>");            
                     $('#server_name').html("No metastores");                                            
                     $('#server_name').attr('disabled','disabled');            
                     $('#notif_bar').css('background-color','#F44336');
                     $('#notif_bar').text("No metastores found in this server (format : *_metastore)"); 
                 }
                 else
                 {
                     $(".meta_item").unbind().click(function()
                     {
                         var button = $(this).parents(".btn-group").find('.btn')        
                         metastore_name = $(this).text();
                         button.html(metastore_name);             

                         $('#srch_box').attr('disabled','disabled');
                         $('#srch_col').attr('disabled','disabled');
                         $('#order_col').attr('disabled','disabled');
                         $('#order_type').attr('disabled','disabled');
                        //When the metastore has been selected, we need to immediately fetch the M_WORKFLOW table columns
                        //This is because each metastore may have different columns and may not be uniform.

                        fetchMWorkflowColumns(req_data,metastore_name);
                     });                         

                     $('#notif_bar').hide();            
                     if(metastore_list.length==1)
                     {                         
                        $(".meta_item:first").click();
                     }
                     else
                     {
                        $('#metastore_name').click();
                     }
                 }                 
             }
                 
         },
         fail : function(xhr,textStatus,error)
         {
             $('#notif_bar').css('background-color','#F44336');
             $('#notif_bar').text(error);                
         }
         });
}

function fetchMWorkflowColumns(req_data,metastore_name)
{    
    req_data = {server : req_data.server,auth_type: req_data.auth_type,db: metastore_name +"_metastore", table_name : 'M_WORKFLOW'};                                                                    
    $.ajax({
        url: '/wf_man/getColumns',
        data : req_data,
        type: 'POST',
        beforeSend : function(xhr){    
            empty = true;        
            $('#notif_bar').text("Fetching M_WORKFLOW columns...");    
            $('#notif_bar').css('background-color','#1ABC9C');
            $('#notif_bar').fadeIn();

        },           
        success: function (response) 
        {                
            if(response.err==1)
            {                
                $('#notif_bar').text(response.data.info);
                $('#notif_bar').css('background-color','#F44336');                
            }
            else{

                //We have the metastores, let's update them                                                
                m_columns = Object.values(response.data.info);                                                                    
                if(m_columns.length!=0)
                {
                    var wf_content = "";
                    var order_content = "";
                    m_columns.forEach(myFunction);            
                    function myFunction(item, index) 
                    {
                        wf_content += "<a class='dropdown-item wf_item' href='#' target='_self'>" + item['COLUMN_NAME'] + "</a>"
                        order_content += "<a class='dropdown-item order_item' href='#' target='_self'>" + item['COLUMN_NAME'] + "</a>"
                    }                                                                                                            
                    $('#wf_drop').html(wf_content);                                                                                
                    $('#order_drop').html(order_content);                                                                                
                    empty =false;
                }
                if(empty)
                {                    
                    $('#srch_col').html("No columns");                                            
                    $('#srch_col').attr('disabled','disabled');            
                    $('#notif_bar').css('background-color','#F44336');
                    $('#notif_bar').text("No M_WORKFLOW columns found in this metastore"); 
                }
                else
                {
                    $(".wf_item").unbind().click(function()
                    {
                        var button = $(this).parents(".btn-group").find('.btn')        
                        col_name = $(this).text();
                        button.html(col_name);    
                        $('#srch_box').removeAttr('disabled');       
                        $('#srch_col').removeAttr('disabled');       
                        $('#order_col').removeAttr('disabled');       
                        $('#order_type').removeAttr('disabled');                
                        prev_searchterm="";
                        $('#srch_box').val('');
                        $('#srch_result_div').html("<br><br>Search for workflows and filter them from above");        
                    });     
                    $(".order_item").unbind().click(function()
                    {
                        var button = $(this).parents(".btn-group").find('.btn')        
                        col_name = $(this).text();
                        button.html(col_name);                            
                        prev_searchterm="";
                        performSearch();
                    });    
                    
                    $('#notif_bar').css('background-color','#4CAF50');                                                
                    $('#notif_bar').text("Ready");                    
                    $('#notif_bar').fadeOut();
                    
                    
                    $('.wf_item').filter(function() {
                        return $(this).text() == 'WORKFLOW_NAME';
                     }).click();
                     $('.order_item').filter(function() {
                        return $(this).text() == 'WORKFLOW_ID';
                     }).click();
                    
                }                 
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
    metastore_name = $('#metastore_name').html().trim();        
    req_data = { type : wf_type, db:metastore_name + "_metastore",schema:'dbo'};
    
    $.ajax({
        url: '/wf_man/wf/count',
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
    server_name = $('#server_name').html().trim();         
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
            $('#notif_bar').hide();
    }
    if(srch_val=='')    
    {
        $('#srch_result_div').html("<br><br>Search for workflows and filter them from above");
        prev_searchterm= "";
        return;
    }
    //Clear the results
    $('#srch_result_div').html("");
    
    prev_searchterm = srch_val;     
    metastore_name = $('#metastore_name').html().trim();               

    req_data = { server : server_name,auth_type: configured_hosts[server_name].auth_type,where_key : srch_col, where_val : srch_val, order_by: order_col, order_type: order_ad, db:metastore_name + "_metastore", schema:'dbo'};        
    cur_request =  $.ajax({
        url: '/wf_man/search/wf',
        data : req_data,
        type: 'GET',
        beforeSend : function(xhr){            
            $('#notif_bar').text("Fetching workflows...");    
            $('#notif_bar').fadeIn();            
            $('#notif_bar').css('background-color','#2196F3');            
            $('#srch_result_div').hide();
        },           
        success: function (response) 
        {
           $('#notif_bar').hide();            
            if(response.err==1)
            {
                response.data.info = JSON.parse(response.data.info);
                $('#notif_bar').css('background-color','#E57373');            
                if(response.data.info.originalError.message)
                {
                    $('#notif_bar').html(response.data.info.originalError.message);                
                }
                else
                {
                    $('#notif_bar').html("Something went wrong : " + response.data.info);                
                }
                $('#notif_bar').fadeIn();    
            }
            else
            {                
                result  = response.data.info;    

                if(!Object.keys(result).length){

                    $('#srch_result_div').html("<br><br>No workflows found where " + srch_col + " like '" + srch_val + "'");                    
                    $('#srch_result_div').fadeIn();    
                }
                else
                {                    
                    result['server_name'] = server_name;
                    result['metastore_name'] = metastore_name + '_metastore';
                    prettyResult =  getPrettifyResults(result,'search');                    
                    $('#srch_result_div').html(prettyResult.join(' '));        
                    $('#srch_result_div').fadeIn(); 
                }                                            
            }            
        },
            fail : function(xhr,textStatus,error)
        {            
            $('#notif_bar').hide();
            $('#srch_result_div').text(error);
            $('#srch_result_div').fadeIn();
        }
        });    
}

mon_failed_wf_count =0;
mon_complete_wf_count =0;
mon_executing_wf_count =0;
function getPrettifyResults(result,screen)
{    
   
    var bodyStyles = window.getComputedStyle(document.body);
    var p_light = bodyStyles.getPropertyValue('--primary_light');
    var d_light = bodyStyles.getPropertyValue('--danger_light');
    var s_light = bodyStyles.getPropertyValue('--success_light');
    
    var p_dark = bodyStyles.getPropertyValue('--primary_dark');
    var d_dark = bodyStyles.getPropertyValue('--danger_dark');
    var s_dark = bodyStyles.getPropertyValue('--success_dark');
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
                
        sel_light = p_light;
        sel_dark = p_dark;
        if(['FAILED','FAILED-CLEANUPFAILED'].indexOf(result[i].WORKFLOW_INSTANCE_STATUS) >=0)        
        {
            sel_light = d_light;
            sel_dark = d_dark;
            mon_failed_wf_count++;
        }
        else if(['COMPLETE','COMPLETE-CLEANUPFAILED','COMPLETE-PENDINGCLEANUP'].indexOf(result[i].WORKFLOW_INSTANCE_STATUS) >=0)
         {
            sel_light = s_light;
            sel_dark = s_dark;
            mon_complete_wf_count++;
         }
        else{
            mon_executing_wf_count++;
        }
        server_details = '';
        if(screen=='monitor')
        {
            server_details =  `<div class='col-lg-auto col-md-auto justify-content-left'><span class='gray_text'>SERVER </span><b>`
            + configured_hosts[server_name].nickname + ` </b><span class='gray_text'>(` + server_name + `)</span><b>` + 
        `</div></b>
        <div class='col-lg-auto col-md-auto justify-content-left'><span class='gray_text'>METASTORE </span><b>`
            + metastore_name.replace('_metastore','') + `</div></b>`;
        }
        new_content =`
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
                <div class='col-lg-auto col-md-auto'>
                    <input type="checkbox" id="mon_toggle_`+server_name+`_`+ metastore_name +`_`+result[i].WORKFLOW_ID+`" name="set-name" class="switch-input" onClick="toggleMonitor('`+server_name+`','`+ metastore_name +`','`+result[i].WORKFLOW_ID+`')" ` + isChecked + `>
                    <label for="mon_toggle_`+server_name+`_`+ metastore_name +`_`+result[i].WORKFLOW_ID+`" class="switch-label"><span class="toggle--on">Monitoring</span><span class="toggle--off">Monitor</span></label>
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
                `</div></b>`
                + server_details +
            `</div>
        </div>`;
        
        //Add individual result row in a list
        resultList.push(new_content)
      }               
    return resultList;    
}




var toggleMonitor = function(server_name,metastore_name,wfid)
{       
    manualToggle = true;       
    a_type = configured_hosts[server_name].auth_type;          
    item = $('#mon_toggle_' + server_name + '_' + metastore_name + '_' + wfid).prop('checked');
    if(item)
    {        
        fire.doc("users").collection(currentUser.uid).doc('monitors').set({  
            [server_name] : 
            {     
                [metastore_name]: 
                {
                    wf_id : firebase.firestore.FieldValue.arrayUnion(Number(wfid))
                },
                auth_type : a_type             
            }
        },{merge : true})
        .then(function() {       
             
        })
        .catch(function(error) {
            $('#mon_toggle_' + btn).prop('checked',!item);
            $('#notif_bar').css('background-color','#F44336');
            $('#notif_bar').text("Oops! Unable to monitor this workflow");    
            $('#notif_bar').fadeIn();                        
            setTimeout(function(){
                $('#notif_bar').fadeOut();                                    
            },1000);          
        });
    }
    else
    {
        fire.doc("users").collection(currentUser.uid).doc('monitors').set({  
            [server_name] : 
            {     
                [metastore_name]: 
                {
                    wf_id : firebase.firestore.FieldValue.arrayRemove(Number(wfid))
                },
                auth_type : a_type             
            }
        },{merge : true})
        .then(function() {       
             
        })
        .catch(function(error) {
            
        });
    }
}
var dashStatsTimer; 

var showDashboard = function()
{
    //clearSearchTimer
    clearTimeout(typingTimer);    
    clearInterval(dashStatsTimer);
    clearTimeout(scrollTim);
    clearTimeout(monRefreshTimer);

    visScreen.hide();
    visScreen = $('#dash_body');
    $('.menu_item').removeClass('menu_selected');
    $('#dash_menu').addClass('menu_selected');

    $('#dash_body').show();

    //Run once
    updateDashboardStats("failed");
    updateDashboardStats("running");

    //Set timer to refresh all data every 1 min
    dashStatsTimer = setInterval(function(){
    updateDashboardStats("failed");
    updateDashboardStats("running");
    //0.5 minutes
    }, 0.5 * 60 * 1000);    
    
}

var showSettings = function()
{       
    clearTimeout(scrollTim);
    clearTimeout(monRefreshTimer);

    visScreen.hide();
    visScreen = $('#sett_body');    
    $('.menu_item').removeClass('menu_selected');
    $('#sett_menu').addClass('menu_selected');
    $('#sett_body').show();    
}


var requestLogin = function()
{       
    un = $('#username_box').val()    
    pw = $('#password_box').val()        
    req_data = {username:un,password:pw};                        
    $.ajax({
        url: '/users/login',
        data : req_data,
        type: 'POST',
        beforeSend : function(xhr){
           $('#alert').removeClass('alert-danger');
           $('#alert').removeClass('alert-success');
           $('#alert').addClass('alert-warning');
           $('#alert').text('Authenticating...');
        },           
        success: function (response) 
        {    
            if(response.err==1)
            {
                
                $('#alert').removeClass('alert-warning');
                $('#alert').addClass('alert-danger');                
                $('#alert').html(response.data.info);               
            }
            else
            {                        
                
                firebase.auth().signInWithCustomToken(response.data.token)
                .then(function()                
                {               
                        
                        //Authentication successful. User recieves the token 
                        //Send the Token ID back to the server in exchange for cookie                 
                        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) 
                        {   
                            $.ajax(
                            {
                                url: '/',                                
                                data : {token:idToken},
                                type: 'POST',
                                beforeSend : function(xhr){
                                   $('#alert').addClass('alert-warning');                               
                                   $('#alert').html("Letting you in...");                                     
                                },
                                success: function (response) 
                                {
                                    if(response.err==1)
                                    {
                                        $('#alert').removeClass('alert-warning');                                    
                                        $('#alert').removeClass('alert-danger');                                    
                                        $('#alert').html(response.data.info);                                              
                                    }
                                    else
                                    {                                                       
                                        //User will be redirected
                                        $('#alert').removeClass('alert-warning');
                                        $('#alert').addClass('alert-success');
                                        $('#alert').html(response.data.info);  
                                        
                                        window.location.replace('/');                                        
                                    } 
                                }
    
                            }).catch(function(error) 
                            {
                                $('#alert').removeClass('alert-warning');
                                $('#alert').addClass('alert-danger');
                                $('#alert').html(error.message);           
                            });
                        
                        })                    
                        .catch(function(error) 
                        {                    
                            var errorCode = error.code;
                            var errorMessage = error.message;                    
                            $('#alert').removeClass('alert-warning');
                            $('#alert').addClass('alert-danger');
                            $('#alert').html(error.message);               
                        }); 
                })
                .catch(function(error){
                    var errorCode = error.code;
                    var errorMessage = error.message;                    
                    $('#alert').removeClass('alert-warning');
                    $('#alert').addClass('alert-danger');
                    $('#alert').html(error.message);  
                });
                
            }
        },            
        fail : function(xhr,textStatus,error)
        {
            $('#alert').removeClass('alert-warning');                
            $('#alert').addClass('alert-danger');
            $('#alert').html(error);               
        }        
    });

}

var LogOut = function()
{   
    //Destory cookies immediately
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    firebase.auth().signOut().then(function() {                
        //Send a log out request to server,
        //This will destroy the cookies
        $.ajax({
            url: '/users/logout',            
            type: 'POST',            
            beforeSend : function(xhr){
                $('#notif_bar').fadeIn();
                $('#notif_bar').text("Logging out...");    
                $('#notif_bar').css('background-color','#F44336');
            }
        });
        
      }).catch(function(error) {        
      });
}

var saveServerDetails = function()
{   
    var title = $("#host_name").val().trim().toUpperCase();    
    var nickname = $("#nick_name").val().trim();
    var auth = ($("input[name='auth_type']:checked").val()=='sql')?1:0;    

    if(title=='')
    {       
       $('#server_config_alert').removeClass('alert-success');
       $('#server_config_alert').addClass('alert-danger');
       $("#server_config_alert").text("Please enter a server name");
       $("#server_config_alert").fadeIn();
       return;
    }    
    if(nickname=='')
    {       
       $('#server_config_alert').removeClass('alert-success');
       $('#server_config_alert').addClass('alert-danger');
       $("#server_config_alert").text("Nicknames make it easier to remember server names!");
       $("#server_config_alert").fadeIn();
       return;
    }

    //Disable the inputs     
    $("#host_name").attr('disabled','disabled');
    $("#nick_name").attr('disabled','disabled');
    $("input[name='auth_type']").attr('disabled','disabled');
    $("input[name='server_type']").attr('disabled','disabled');
    $("#saveServerDetails").attr('disabled','disabled');

    $('#server_config_alert').removeClass('alert-danger');
    $('#server_config_alert').addClass('alert-warning');    
    $("#server_config_alert").text("Testing Connection...");
    $("#server_config_alert").fadeIn();

    //Check the connection and only then save the host    
    req_data = {server : title, auth_type: auth};                                
    performConnect(req_data,ok_serverConfig,err_serverConfig);    
}
var writeHostDetailsToFirebase = function()
{    
    $('#notif_bar').hide();     
    var title = $("#host_name").val().trim().toUpperCase();
    var server_type = ($("input[name='server_type']:checked").val()=='prod')?1:0;
    var auth_type = ($("input[name='auth_type']:checked").val()=='sql')?1:0;    
    var nickname = $("#nick_name").val().trim();

    $('#server_config_alert').removeClass('alert-warning');
    $('#server_config_alert').addClass('alert-success');    
    $("#server_config_alert").text("Saving...");
    $("#server_config_alert").fadeIn();
    
    //Prepare server configuration            
    fire.doc("users").collection(currentUser.uid).doc('hosts').set({  
        [title] : 
        {     
            host: title,
            nickname : nickname,
            server_type: server_type,
            auth_type: auth_type        
        }
    },{merge : true})
    .then(function() {       
            $('#editServer').modal('toggle');     
            //Enable the inputs     
            $("#host_name").removeAttr('disabled');
            $("#nick_name").removeAttr('disabled');
            $("input[name='auth_type']").removeAttr('disabled');
            $("input[name='server_type']").removeAttr('disabled');
            $("#saveServerDetails").removeAttr('disabled');
    })
    .catch(function(error) {
        $('#server_config_alert').removeClass('alert-success');
        $('#server_config_alert').addClass('alert-danger');
        $("#server_config_alert").text("Oops " + error);
        $("#server_config_alert").fadeIn();
        $('#editServer').modal('toggle');     
        //Enable the inputs     
        $("nick_name").removeAttr('disabled');
        $("host_name").removeAttr('disabled');
        $("#input[name='auth_type']").removeAttr('disabled');
        $("#input[name='server_type']").removeAttr('disabled');
        $("#saveServerDetails").removeAttr('disabled');
    });
}

var deleteServerDetails = function()
{    
    $('#saveServerDetails').attr('disabled','disabled');                  
    var title = $("#host_name").val().trim().toUpperCase();
    $('#server_config_alert').addClass('alert-danger');    
    $("#server_config_alert").text("Deleting...");
    $("#server_config_alert").fadeIn();
    //Prepare server configuration            
    fire.doc("users").collection(currentUser.uid).doc('hosts').update({  
            [title] : firebase.firestore.FieldValue.delete()
    })
    .then(function() {       
       $('#editServer').modal('toggle');    
       $('#saveServerDetails').removeAttr('disabled');                                
    })
    .catch(function(error) {
        $('#server_config_alert').removeClass('alert-success');
        $('#server_config_alert').addClass('alert-danger');
        $("#server_config_alert").text("Oops " + error);
        $("#server_config_alert").fadeIn();
        $('#saveServerDetails').removeAttr('disabled');                                        
    });
}


var toggleOrder = function()
{    
    text =  $('#order_type').html().trim();
    if(text=='ASC')
    {
        text = 'DESC';
    }
    else
    {
        text = 'ASC';
    }
    $('#order_type').html(text);
    prev_searchterm=""
    performSearch();
}