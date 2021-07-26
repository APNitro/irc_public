import React, { useContext, useState } from 'react';
import { AppBar, Button, Box, Input, InputBase, Toolbar, Typography } from '@material-ui/core'
import { appContext } from './AppContext';
import  { colors } from './utils/constant';

export default function AppBarChat({handleSubmitJoinRoom, handleLogout}) {
    
    const [newRoom, setNewRoom] = useState('');
    const context = useContext(appContext);
    
    const handleRoomChange = (e) => {
        setNewRoom(e.target.value)
    }
    return (
        <AppBar style={{height: 50, backgroundColor: colors.gray.two}}>
            <Toolbar style={{display: 'flex', justifyContent: 'space-between'}} variant="dense">
                <Typography style={{color: colors.gray.ten, fontSize: 14, fontFamily: 'Stalinist One'}}>
                    {context.username}
                </Typography>
                <Box style={{backgroundColor: colors.gray.four}}>

                <InputBase value={newRoom} onChange={handleRoomChange} placeholder="Join room" />
                <Button style={{backgroundColor: colors.geekblue.three}} onClick={() => handleSubmitJoinRoom(newRoom)}>JOIN ROOM</Button>
                </Box>
                <Button onClick={() => handleLogout()}>LOGOUT</Button>
            </Toolbar>
        </AppBar>
    )
}