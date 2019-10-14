import authReducer from './authReducer'
import hostReducer from './hostReducer'
import searchReducer from './searchReducer'
import monitorReducer from './monitorReducer'
import viewReducer from './viewReducer'
import serverReducer from './serverReducer'
import  {combineReducers} from 'redux'

const rootReducer = combineReducers({
    auth : authReducer,
    host : hostReducer,
    search : searchReducer,
    monitor : monitorReducer,
    view : viewReducer,
    server : serverReducer
});

export default rootReducer;