import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useSelector } from 'react-redux'
import HostItem from './Servers/HostItem'
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,    
    display: 'flex',
    height: '100%',
    outline : 'none'    
  },  
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,    
  },
  tab :{
    '&:active': {
      outline: 'none',      
      backgroundColor :  'lightgray'
    },
    '&:focus': {
      outline: 'none',
      backgroundColor :  'lightgray'
    },
    paddingRight : '2rem'
  }
}));

export default function Servers() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const storeHosts = useSelector(store => store.host.hosts)  
  const storeServerJobs = useSelector(store => store.server.serverJobs)  
  const storeServerMemUsage = useSelector(store => store.server.serverMemory)  
 
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  let host_names;
  if(storeHosts)
  {
   host_names= Object.keys(storeHosts)
  }
  let HostList = (host_names && host_names.map((host_name,index)=>{
      return (          
          <Tab label={host_name} key={'dashTab_' + index} className={classes.tab}/>
      )
  }))
  let HostContent = (host_names && host_names.map((host_name,index) =>{    
    return (                          
          <TabPanel value={value} key={'dashContent_'+index} index={index} style={{width:'100%'}}>
                <HostItem host={storeHosts[host_name]} mem={(storeServerMemUsage)?storeServerMemUsage[host_name]:undefined} jobs={(storeServerJobs)?storeServerJobs[host_name]:undefined} />
          </TabPanel>       
    )
}))

  if(!HostList || HostList.length===0)
  {
    return (
      <div>
        <br/>
        <i>
          No hosts have been configured. Add a host in Settings page
        </i>
      </div>
    )
  }
  return (
    <div className={classes.root} style={{marginLeft:'-1rem'}}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
      >          
          {HostList}          
      </Tabs>
      {HostContent}
    </div>
  );
}