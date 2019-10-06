import store from '../../store/redux_store'
export const  getIDToken =() =>
{
    return new Promise((resolve, reject) => {
            let user = store.getState().auth.authUser
            if(user)
            {            
                user.getIdToken(/* forceRefresh */ false).then(function(idToken) 
                {
                    resolve(idToken);

                }).catch(err=>{
                    reject(err)                
                });
            }            
            else{
                reject('NoAuth')                
            }                   
     });
}