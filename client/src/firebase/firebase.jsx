import  * as firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

//Initialize firebase

firebase.initializeApp({
  apiKey : 'AIzaSyB-F0pQeoCet-dVQH4xhvPyOf4tm2Mbhvk',
  authDomain : 'quaero-operations.firebaseapp.com',
  databaseURL : 'https://quaero-operations.firebaseio.com',
  projectId : 'quaero-operations',
  storageBucket : 'quaero-operations.appspot.com',
  messagingSenderId : '398546063452',
  appId : '1:398546063452:web:f4455c674134ee7f'
});


export default firebase;