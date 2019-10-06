import authReducer from './authReducer'
import hostReducer from './hostReducer'
import searchReducer from './searchReducer'
import monitorReducer from './monitorReducer'
import viewReducer from './viewReducer'
import  {combineReducers} from 'redux'

const rootReducer = combineReducers({
    auth : authReducer,
    host : hostReducer,
    search : searchReducer,
    monitor : monitorReducer,
    view : viewReducer
});

export default rootReducer;