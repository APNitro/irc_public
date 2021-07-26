import { Chip, Modal, Card, Typography, CardContent, Button, Grid, Box, Avatar, Paper, ListItem, ListItemAvatar, ListItemText, IconButton, Popover } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { appContext } from './AppContext';
import { colors } from './utils/constant';
import useUserroom from './hooks/useUserroom';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
export default function Room({ id, roomName }) {
    const [userRoom, userRoomState] = useUserroom();
    const [users, setUsers] = useState([]);

    //const [messages, setMessages] = useState([])
    const context = useContext(appContext);

    useEffect(async () => {
        const res = await userRoom(roomName);
        if (res != undefined) {
            var usersToShow = [];
            for (var i = 0; i < res.Users.length; i++) {
                usersToShow.push(res.Users[i].pseudo);
            }
        }
        setUsers(usersToShow);
    }, [roomName])
    /*context.socket.on('message', function(data) {
        if (data.room === room) {
            setMessages(messages => [...messages, {username: data.message.username, message: data.message.message, time: data.message.time}])
        }
    })*/
    return (
        <Paper variant="outlined" square style={{ backgroundColor: colors.gray.five, color: colors.gray.seven, position: 'absolute', right: 0, top: 50, left: 185, minHeight: '100vh' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', padding: 20 }}>
                <Typography style={{ fontFamily: 'Stalinist One', width: '50%' }} variant="h5">
                    {context.roomsFeed[id].name}
                </Typography>
                <Button style={{ backgroundColor: colors.gray.nine, color: colors.gray.one }} onClick={() => context.handleLeaveRoom(id)}>LEAVE ROOM</Button>
            </Box>

                <Box style={{minHeight: 50, display: 'flex', justifyContent: 'flex-start'}}>
                    {users.map(user => (<Chip
                        style={{marginLeft: 12, marginRight: 12}}
                        avatar={<Avatar>{user.slice(0, 1)}</Avatar>}
                        label={user}
                        clickable

                    />))}
                </Box>



            {context.roomsFeed[id].messages.map((message, key) => (
                <ListItem alignItems="flex-start" style={{ backgroundColor: colors.gray.three, marginBottom: (key + 1) === context.roomsFeed[id].messages.length ? 100 : 5 }}>
                    <ListItemAvatar>
                        <Avatar style={{ backgroundColor: colors.blue.five }}>{message.username.slice(0, 1)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        style={{ color: colors.gray.eight }}
                        primary={
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <Typography>
                                    {message.username}
                                </Typography>
                                <Typography
                                    style={{ display: 'inline' }}
                                    component="span"
                                    variant="body2"
                                    color={colors.gray.four}
                                >
                                    {message.time}
                                </Typography>
                            </div>}
                        secondary={

                            <div style={{ color: colors.gray.ten }}>
                                {message.message}
                            </div>

                        }
                    />
                </ListItem>
            ))}
        </Paper>
    )
}