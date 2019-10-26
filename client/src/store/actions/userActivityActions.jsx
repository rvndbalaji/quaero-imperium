import  firebase from '../../firebase/firebase'
let fire = firebase.database()

export const sendUserActivity = () =>
{    
    return (dispatch,getState) =>
    {
        let authUser = getState().auth.authUser;        
        let mydate = new Date()  
        let datestring = mydate.getDate() + ' ' + getMonthName(mydate) + ' '  + mydate.getFullYear() + ' - ' + mydate.toLocaleTimeString() + ' ' + getTimeZone(mydate);
        fire.ref('lastUserActivity/').update({
            [authUser.uid] : datestring
          });
    }
}


const getMonthName = (date) => {
    var monthNames = [ "January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December" ];
    return monthNames[date.getMonth()];
  }

const getTimeZone = (mydate) =>
{
  let zone_string = (mydate.toString().match(/\(([A-Za-z\s].*)\)/)[1]);
  try
  {    
    let zone_word = zone_string.split(' ');
    return zone_word[0][0] + zone_word[1][0] + zone_word[2][0]
  }
  catch(err){
    return zone_string
  }  
}

