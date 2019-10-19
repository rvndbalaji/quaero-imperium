var express = require('express');
var router = express.Router();
const { Client } = require('ldapts'); 

const url = process.env.LDAP_url
const bindDN = process.env.LDAP_bindDN
const password = process.env.LDAP_password
const searchDN = process.env.LDAP_searchDN

const client = new Client({
  url,
});

//Perform Login
router.post('/performLogin',[    
], async (req,res) => 
{          
    var result = {
        err: 1,
        data : {}
      };     
      
    var username = req.body.username;           
      //Sign in attempt, immediately set undefined to the user's password
    delete GLOBAL_FLYING_PASSWORDS[username]
    logger.info(username + '\t' + 'Initiated Log In');
    //User wanted to login, send them a token if credentails are valid
    admin.auth().createCustomToken(username)
        .then(async function(customToken) 
    {
        
            try {                
                await client.bind(bindDN, password);                  
                logger.info(username +'\t' + 'Server LDAP Bind Successful');

                const {
                searchEntries,
                searchReferences,
                } = await client.search(searchDN, {
                scope: 'sub',
                filter: '(sAMAccountName=' + username  +')',
                //filter: '(objectClass=*)',
                });                
                //User was found, fetch the user's DN    
                if(searchEntries && searchEntries[0] && searchEntries[0]['dn'])
                {
                    
                    isImperiumMember = false;
                    //First check the the user is a member of imperium group
                    user_groups= searchEntries[0]['memberOf'];
                    //Loop through and find all groups
                    for(grp_index in user_groups)
                    {
                        //Fetch the account type. It'll either be Internal or Client indicating whether
                        //the account that is running imperium is an internal deployment or client deployment.                        
                        //Check if the user belongs to the group which the account is running on.
                        //Ex : ESPN users can only be auth'ed if they belong to Imperium-Client group                        
                        if(user_groups[grp_index].split(',')[0]===process.env.ACCOUNT_TYPE)
                        {
                            
                            isImperiumMember = true;
                            break;
                        }
                    }

                    //Proceed Authenticate only if the user belongs to the correct group
                    if(!isImperiumMember)
                    {                        
                        result.data.info = 'Authentication Failed : User does not belong to group ' + process.env.ACCOUNT_TYPE
                        res.send(result)
                        logger.error(username + '\t' + 'Auth Failed : User does not belong to group');
                    }
                    else
                    {
                        //Using the user's DN, authenticate him using the password he provided
                        try 
                        {
                            let userDN = searchEntries[0]['dn'];                                                
                            await client.bind(userDN, req.body.password);
                            
                            //User has been verified, now update profile and send token to authenticate
                            fetchUserDetailsAndStoreInFirebase(username,req.body.password,searchEntries[0],customToken,res)                             

                        } catch (ex) 
                        {                        
                            if(ex.code && ex.code==49)
                            {                        
                                result.data.info = 'Incorrect username/password (or you got locked out)'                                                 
                                logger.error(username + '\t' + 'Auth Failed : Invalid pass; Account possibly locked : ' + ex.toString());
                            }            
                            else
                            {                        
                                result.data.info = 'Authentication Failed'   
                                logger.error(username + '\t' + 'Auth Failed : ' + ex.toString());
                            } 
                            
                            result.data.err_msg = ex.toString();           
                            res.send(result)
                        } finally {
                            await client.unbind();            
                        }
                    }                   
                }    
                else
                {
                    result.data.info = 'Authentication Failed : User not found'                     
                    res.send(result)
                    logger.error(username + '\t' + 'Auth Failed : User not found');
                }
            } catch (ex) {        
                result.data.info = 'LDAP : Something important failed. Please report to admin'                
                result.data.err_msg = ex.toString();
                res.send(result)
                logger.error(username + '\tServer LDAP Bind FAIL : ' + ex.toString());
            } finally {
                await client.unbind();
            }
        
  });   
});


function fetchUserDetailsAndStoreInFirebase(username,password,userRecord,customToken,res)
{
    var result = {
        err: 1,
        data : {}
      }; 
      
    let full_name = userRecord['displayName'];
    let email = userRecord['proxyAddresses'][0].split(':')[1].toLowerCase();    
    let title = JSON.stringify(userRecord['title']).replace(/['"]+/g, '')
        
    //Check if a user already exists. If yes, check if password was changed and then update the user account with the details,
    //otherwise, create a new user account

    firebase.doc('users').collection(username).doc('profile').get().then(user_data =>
        {   
            if(!user_data.exists)        
            {   
                //User does not exist, create a profile
                admin.auth().createUser({
                    uid : username,
                    email,
                    emailVerified: false,                
                    password,
                    displayName:  full_name,                
                    disabled: false
                    })
                    .then(function(userObject) {       
                        //Once profile is created, encrypt and save the password under the user's profile
                        //This will be used throughout the app for Forward-Authentication        
                        updateAndSavePassword(userObject,password,customToken,res,title)        
                        logger.info(username + '\t' + 'User created');                                            
                    })
                    .catch(function(error) {  
                        //Something seriously went wrong. Stop and send an error                
                        result.data.info = 'There was an error while creating the user\'s profile. Please report to admin'                        
                        result.data.err_msg = error.toString();
                        res.send(result)
                        logger.error(username + '\t' + 'Error creating user : ' + error.toString());
                    });
            }  
            else
            {
                user_data = user_data.data();                
                var dec_pass;
                //Get the existing password and compare. If password hasnt changed, do nothing,
                //otherwise update the entire profile
                try {
                    dec_pass = decrypt(user_data.password);                    
                } catch (error) {
                    result.data = {info : "FATAL DECRYPT ERROR : Please report to admin!",
                                   err_msg : error.toString()
                                    };                                                                                                    
                    res.send(result);
                    logger.error(username + '\t' + 'Decryption failed : ' + error.toString());
                    return;
                }
                if(dec_pass===(password) && user_data.title===title)
                {
                    //User's details have not changed. Simply send token   
                    GLOBAL_FLYING_PASSWORDS[username] = user_data.password;                                                     
                    result.err = 0;                                                        
                    result.data = {token : customToken};
                    res.send(result);         
                    logger.info(username + '\t' + 'Logged In');
                }
                else{
                    //User's data. Update the profile with new information
                    admin.auth().updateUser(username, {                        
                        password,                            
                        title : title                                                                    
                      })
                        .then(function(userObject) {
                          updateAndSavePassword(userObject,password,customToken,res,title)
                        })
                        .catch(function(error) {
                           result.data = {info : "The user's password failed while updating profile. Please report to admin",
                                   err_msg : error.toString()
                                    };                                                         
                           res.send(result);
                           logger.error(username + '\t' + 'Failed to update user profile : ' + error.toString());                                                  
                        });
                }
            }
        })
        .catch(function(error) {            
                result.data = {info : 'Oops! Something went wrong during authentication. Try again, or please report to admin', err_msg : error.toString()};                                
                res.send(result);
                logger.error(username + '\t' + 'Fatal Auth Failure : ' + error.toString());
        });   


  
}

function updateAndSavePassword(userObject,password,customToken,res,mytitle)
{
    let encryped_pass = encrypt(password);
    GLOBAL_FLYING_PASSWORDS[username] = encryped_pass;
    firebase.doc('users').collection(userObject.uid).doc('profile').set(
        {
            name : userObject.displayName,
            email : userObject.email,
            title : mytitle,            
            password : encryped_pass
        }).then(()=>{
            //Sucessfully created/updated user, send token                 
            res.send({
                err : 0,
                data : {token : customToken}
            });  
            logger.info(username + '\t' + 'Logged In');
        });
}

module.exports = router;

