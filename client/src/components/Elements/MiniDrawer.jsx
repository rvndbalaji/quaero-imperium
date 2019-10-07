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
import {FaTh,FaTachometerAlt,FaShieldAlt, FaTools, FaSearch,FaUserAlt,FaChartPie, FaDatabase,FaChevronRight, FaChevronLeft,FaComments} from "react-icons/fa";

import {Link} from 'react-router-dom'
import quaero_logo from '../../images/q_logo_full.png'
import Image from 'react-bootstrap/Image';
import Search from '../WorkflowManager/Search';
import Monitor from '../WorkflowManager/Monitor';
import Settings from '../WorkflowManager/Settings'
import Feedback from '../WorkflowManager/Feedback'
import Profile from '../WorkflowManager/Profile'


const ico_size =  '1.3em'
const bar_color = '#7E57C2'
const menu_color = '#263238'
const logo_back_color = menu_color
const ico_color = '#ffffff'
const ico_text_color = ico_color
const sections = [<div>Dashboard</div>,<Search />,<Monitor/>,<div>Reporting</div>,<div>Queries</div>,<Profile />,<div>Admin</div>,<Settings />,<Feedback/>];
const icon_name = [<FaTh size={ico_size} color={ico_color}/>,<FaSearch size={ico_size} color={ico_color}/>,<FaTachometerAlt size={ico_size} color={ico_color}/>,<FaChartPie size={ico_size} color={ico_color}/>, <FaDatabase size={ico_size} color={ico_color}/>,<FaUserAlt size={ico_size} color={ico_color}/>,<FaShieldAlt size={ico_size} color={ico_color}/>,<FaTools size={ico_size} color={ico_color}/>,<FaComments size={ico_size} color={ico_color}/>]        



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
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,    
    whiteSpace: 'nowrap',      
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
      width: theme.spacing(7) + 1,
    },
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
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  
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
          <Link className='ml-2' to="/" target="_self"><Image id="logo" src={quaero_logo} width="125rem" fluid  /></Link>                            
        </div>
        <Divider />
        <List className='ml-1' style={{color:ico_text_color}}>
          {['Dashboard','Search','Monitor','Reporting','Queries'].map((text, index) => (
             <ListItem button key={text}
                onClick={event => handleListItemClick(event, index)}
                selected={selectedIndex === index}
             >
              <ListItemIcon>{icon_name[index]}</ListItemIcon>
              <span className='p-1' style={{fontFamily: 'futura_bold', fontSize : '1rem'}}>{text}</span>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List className='ml-1' style={{color:ico_text_color}}>
          {['Profile','Admin','Settings','Feedback'].map((text, index) => (
            <ListItem button key={text}
                       onClick={event => handleListItemClick(event, index + 5)}
                       selected={selectedIndex === index + 5}
                       >
              <ListItemIcon>{icon_name[index + 5]}</ListItemIcon>
              <span className='p-1' style={{fontFamily: 'futura_bold', fontSize : '1rem'}}>{text}</span>
            </ListItem>
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
