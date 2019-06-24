let userLoaded = false;
var currentUser;
var visScreen;
var unsAuth;
var unsHost;
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
            clearSession();
        });
    }
    
});

var configured_hosts;
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
        $('#host_name').val(host_name);
        $('#host_name').focus();
    });

    $('#editServer').on('hide.bs.modal', function (event) {
        //When dialog is closed, hide errors
        $("#host_name").val('');
        $("#server_config_alert").hide();
    });

    //Hide all config dialog at first    
    $("#server_config_alert").hide();
    $('#srch_box').attr('disabled','disabled');
    $("#metastore_name").attr('disabled','disabled');
    $('#notif_bar').hide();
    //Listener to get hosts and set them as drop down menus in search section
    //Remove any previous listeners 
   if (unsHost) unsHost();   
   unsHost =  fire.doc('users').collection(currentUser.uid).doc('hosts').onSnapshot(function(hosts)
    {      
        
        var empty = true;
        if (hosts.exists) {            
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
                    srch_content += "<a class='dropdown-item server_item' href='#' target='_self'>" + item + "</a>"
                }               
                
                $('#server_list').html(sett_content);                                            
                $('#server_drop').html(srch_content);                                                            
                $('#server_name').removeAttr('disabled');                
                $('#server_name').html("Select server");                                                                            
                
                empty =false;
            }
        }
        if(empty)
        {
            $('#server_list').html("<div class='col-lg-auto col-md-auto col-sm-auto col-xs-auto'>You haven't configured any servers</div>");            
            $('#server_name').html("Not configured");                                            
            $('#server_name').attr('disabled','disabled');            
        }
        
        //If current screen is search section, display the search screen
        if(visScreen.prop('id')=='srch_body')
        {
            //Set the listener for selecting server
            $(".server_item").unbind().click(function()
            {
                var button = $(this).parents(".btn-group").find('.btn')        
                host_name = $(this).text();
                button.html(host_name);                
                //Now that the server is selected, we need to fetch the list of metastores
                //and establish connection
                performConnect();
                
            });    
            //Display search section
            showSearch();
        }  
        

    });

    
}


var typingTimer;                //timer identifier
var showSearch = function()
{    
    visScreen.hide();          

    //setup before functions
    clearTimeout(typingTimer);  
    clearInterval(dashStatsTimer);

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
    $('#srch_body').fadeIn();    
}

var current_div;

function performConnect()
    {          
        
        server_name = $('#server_name').html().trim();        
        req_data = {server : server_name,auth_type: configured_hosts[server_name].auth_type};                                
        $.ajax({
            url: '/wf_man/connectSQL',
            data : req_data,
            type: 'POST',
            beforeSend : function(xhr){                
                $('#notif_bar').fadeIn();
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
                   
                        //Connected, now let's fetch metastores
                                    server_name = $('#server_name').html().trim();        
                                    req_data = {server : server_name,auth_type: configured_hosts[server_name].auth_type};                                
                                    $.ajax({
                                        url: '/wf_man/getMetastores',
                                        data : req_data,
                                        type: 'GET',
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
                                                        host_name = $(this).text();
                                                        button.html(host_name);                
                                                    });

                                                    $('#notif_bar').css('background-color','#4CAF50');                                                
                                                    $('#notif_bar').text("Ready");
                                                    $('#srch_box').removeAttr('disabled');                                                     
                                                }
                                                setTimeout(function()
                                                    {
                                                        $('#notif_bar').hide();                                                        
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
    req_data = { where_key : srch_col, where_val : srch_val, order_by: order_col, order_type: order_ad, db:metastore_name + "_metastore", schema:'dbo'};        
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
                $('#srch_result_div').html("<br><br>Something went wrong : " + response.data.info);
            }
            else{                
                result  = response.data.info;                
                if(!Object.keys(result).length){

                    $('#srch_result_div').html("<br><br>No workflows found where " + srch_col + " like '" + srch_val + "'");
                }
                else{
                    prettifyAndDisplayResult(result);                    
                }               
            }
            $('#srch_result_div').fadeIn();
        },
            fail : function(xhr,textStatus,error)
        {            
            $('#notif_bar').hide();
            $('#srch_result_div').text(error);
            $('#srch_result_div').fadeIn();
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

var dashStatsTimer; 
var showDashboard = function()
{
    //clearSearchTimer
    clearTimeout(typingTimer);    
    clearInterval(dashStatsTimer);

    visScreen.hide();
    visScreen = $('#dash_body');
    $('#dash_body').fadeIn();

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
    visScreen.hide();
    visScreen = $('#sett_body');
    $('#sett_body').fadeIn();    
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
    var server_type = ($("input[name='server_type']:checked").val()=='prod')?1:0;
    var auth_type = ($("input[name='auth_type']:checked").val()=='sql')?1:0;    
    
    if(title=='')
    {       
       $('#server_config_alert').removeClass('alert-success');
       $('#server_config_alert').addClass('alert-danger');
       $("#server_config_alert").text("Please enter a server name");
       $("#server_config_alert").fadeIn();
       return;
    }    
    $('#server_config_alert').removeClass('alert-danger');
    $('#server_config_alert').addClass('alert-success');    
    $("#server_config_alert").text("Saving...");
    $("#server_config_alert").fadeIn();
    //Prepare server configuration            
    fire.doc("users").collection(currentUser.uid).doc('hosts').set({  
            [title] : 
            {     
                host: title,
                server_type: server_type,
                auth_type: auth_type        
            }
        },{merge : true})
    .then(function() {       
       $('#editServer').modal('toggle');                  
    })
    .catch(function(error) {
        $('#server_config_alert').removeClass('alert-success');
        $('#server_config_alert').addClass('alert-danger');
        $("#server_config_alert").text("Oops " + error);
        $("#server_config_alert").fadeIn();
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


