import React, { useContext, useState } from 'react';
import { AppBar, Button, Input, InputBase, Toolbar, Typography } from '@material-ui/core'
import { appContext } from './AppContext';
import { makeStyles } from '@material-ui/core/styles';
import  { colors} from './utils/constant';
const useStyles = makeStyles((theme) => ({
    text: {
      padding: theme.spacing(2, 2, 0),
    },
    paper: {
      paddingBottom: 50,
    },
    list: {
      marginBottom: theme.spacing(2),
    },
    subheader: {
      backgroundColor: theme.palette.background.paper,
    },
    appBar: {
      top: 'auto',
      bottom: 0,
      backgroundColor: colors.gray.four
    },
    grow: {
      flexGrow: 1,
    },
    fabButton: {
      position: 'absolute',
      zIndex: 1,
      top: -30,
      left: 0,
      right: 0,
      margin: '0 auto',
    },
  }));

export default function ChatBar({ message, sendMsg, setMessage}) {
  const context = useContext(appContext);
    const handleMsgChange = (e) => {
        setMessage(e.target.value);
    }
    const classes = useStyles();
    return (
        <AppBar className={classes.appBar} position="fixed" color="primary">
            <Toolbar style={{display: 'flex', justifyContent: 'space-between'}}>
                <Input style={{width: '74%'}} value={message} onChange={handleMsgChange} />
                <Button style={{width: '16%', backgroundColor: colors.blue.nine, color: colors.blue.one}} onClick={sendMsg}>SEND</Button>
            </Toolbar>
        </AppBar>
    )
}