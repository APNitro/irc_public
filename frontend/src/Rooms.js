import React, { useContext, useState } from 'react';
import { appContext } from './AppContext';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Input, Button } from '@material-ui/core';
import Room from './Room';
import { colors } from './utils/constant';
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: 50,
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        width: '100%'
    },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'fixed',
        width: 180
    },
}));

export default function Rooms({setActiveRoom, renderBool}) {
    const [msg, setMsg] = useState('');
    const context = useContext(appContext);
    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const handleMsgChange = (e) => {
        setMsg(e.target.value);
    }
    const handleChange = (event, newValue) => {
        setValue(newValue);
        setActiveRoom(newValue);
    };

    return (
        <div className={classes.root}>
            <Tabs
                style={{maxHeight: '60vh'}}
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                className={classes.tabs}
            >
                {context.rooms.map((room, index) => (
                    <Tab style={{backgroundColor: context.activeRoom === index && colors.red.five}} label={room} {...a11yProps(index)} />
                ))}
            </Tabs>
            {context.rooms.map((room, index) => (
                <TabPanel  value={value} index={index}>
                    <Room roomName={room} renderBool={renderBool} id={index} />
                </TabPanel>
            ))}
        </div>
    );
}
