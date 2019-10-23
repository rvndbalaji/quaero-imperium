import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';
import Tooltip from '@material-ui/core/Tooltip';
import {FaServer,FaTachometerAlt,FaShieldAlt, FaTools, FaSearch,FaUserAlt,FaChartPie, FaDatabase,FaChevronRight, FaChevronLeft,FaComments,FaHotjar} from "react-icons/fa";

import {Link} from 'react-router-dom'
import quaero_logo from '../../images/q_logo_full.png'
import Image from 'react-bootstrap/Image';
import Search from '../WorkflowManager/Search';
import Monitor from '../WorkflowManager/Monitor';
import Settings from '../WorkflowManager/Settings'
import Profile from '../WorkflowManager/Profile'
import Servers from '../WorkflowManager/Servers';
import Support from '../WorkflowManager/Support';
import WhatsNew from '../WorkflowManager/WhatsNew';



const ico_size =  '1.3em'
const bar_color = '#396CB2' //644B9E or 396CB2
const menu_color = '#263238'
const logo_back_color = menu_color
const ico_color = '#ffffff'
const ico_text_color = ico_color
const sections = [<Search />,<Monitor/>,<div>Reporting : Generate reports for multiple workflows, group workflows and create new reporting processes etc. <b>Coming Soon</b></div>,<div>Queries : Execute custom queries to obtain adhoc results. <b>Coming Soon</b></div>,<Servers />,<Profile />,<div>Admin : Manage Imperium Administration. <b>Coming Soon, only for admins</b></div>,<Settings />,<Support/>,<WhatsNew></WhatsNew>];
const icon_name = [<FaSearch size={ico_size} color={ico_color}/>,<FaTachometerAlt size={ico_size} color={ico_color}/>,<FaChartPie size={ico_size} color={ico_color}/>, <FaDatabase size={ico_size} color={ico_color}/>,<FaServer size={ico_size} color={ico_color}/>,<FaUserAlt size={ico_size} color={ico_color}/>,<FaShieldAlt size={ico_size} color={ico_color}/>,<FaTools size={ico_size} color={ico_color}/>,<FaComments size={ico_size} color={ico_color} />,<FaHotjar size={ico_size} color={ico_color}/>]        



const drawerWidth = 200;
const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'   
  },   
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    })    
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
    marginLeft : '-1rem'
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,    
    whiteSpace: 'nowrap'    
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),    
    background : menu_color,    
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    background : menu_color,
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7) + 2,
    }    
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 15,
    
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),    
  }  
}));
export default function MiniDrawer() {  
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  
  function handleDrawerOpen() {
    setOpen(true);
  }

  function handleDrawerClose() {
    setOpen(false);
  }
  function handleListItemClick(event, index) {
    setSelectedIndex(index);
  }
  
  return (             
    <div className={classes.root}>
      <CssBaseline />
      <AppBar 
        position="fixed"        
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar variant="dense" style={{background:bar_color, minHeight : '2.8rem'}}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <FaChevronRight size='0.8em'/>
          </IconButton>
          <span id='wf_title'>Workflow Manager</span>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"        
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,             
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,                             
          }),                  
        }}
        open={open}
      >
        <div className='m-0 p-0' style={{backgroundColor:logo_back_color}}>            
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <FaChevronRight size='0.8em' color = {ico_color}/> : <FaChevronLeft size='0.8em' color =  {ico_color}/>}
          </IconButton>
          <Tooltip title='Homepage' placement='right'>                                            
          <Link className='ml-2' to="/" target="_self"><Image id="logo" src={quaero_logo} width="125rem" fluid  /></Link>                            
          </Tooltip>
        </div>
        <Divider />
        <List style={{color:ico_text_color,marginTop:'-0.5rem'}}>        
          {['Search','Monitor','Reporting','Queries','Servers'].map((text, index) => (            
            <Tooltip title={text} placement='right' key={text}>                                            
              <ListItem button
                  onClick={event => handleListItemClick(event, index)}
                  selected={selectedIndex === index}
              >
                
                  <ListItemIcon className='pl-1'>{icon_name[index]}</ListItemIcon>                                
                  <span className='p-1' style={{fontFamily: 'futura_bold', fontSize : '1rem'}}>{text}</span>              
              </ListItem>     
            </Tooltip>                               
          ))}
        </List>
        <Divider />
        <List  style={{color:ico_text_color}}>
          {['Profile','Admin','Settings','Support','What\'s New!?'  ].map((text, index) => (
            <Tooltip title={text} placement='right' key={text}>                                            
            <ListItem button 
                       onClick={event => handleListItemClick(event, index + 5)}
                       selected={selectedIndex === index + 5}
                       >
              <ListItemIcon className='pl-1'>{icon_name[index + 5]}</ListItemIcon>
              <span className='p-1' style={{fontFamily: 'futura_bold', fontSize : '1rem'}}>{text}</span>
            </ListItem>
            </Tooltip>
          ))}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {sections[selectedIndex]}
      </main>
    </div>
  );
}
