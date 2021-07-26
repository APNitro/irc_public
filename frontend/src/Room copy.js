import { Card, Typography, CardContent, Button, Grid } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { appContext } from './AppContext';

export default function Room({ id }) {
    //const [messages, setMessages] = useState([])
    const context = useContext(appContext);
    /*context.socket.on('message', function(data) {
        if (data.room === room) {
            setMessages(messages => [...messages, {username: data.message.username, message: data.message.message, time: data.message.time}])
        }
    })*/
    return (
        <Grid container style={{width: '80vw', marginBottom: 100}}>
            <Grid xs={4}>

            </Grid>
            <Grid xs={8}>
                <Typography variant="h3">
                    {context.roomsFeed[id].name}
                </Typography>
                <Button onClick={() => context.handleLeaveRoom(id)}>LEAVE ROOM</Button>
                {context.roomsFeed[id].messages.map(message => (
                    <Grid container>
                        <Grid xs={3}>
                            {message.username}
                        </Grid>
                        <Grid xs={9}>
                            {message.message}
                        </Grid>
                        <Grid xs={3}>
                            {message.time}
                        </Grid>
                    {/*<Card>
                        <CardContent>
                            <Typography variant="h5">
                                {message.username}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {message.message}
                            </Typography>
                        </CardContent>
                    </Card>*/}
                    </Grid>
                ))}
            </Grid>
        </Grid>
    )
}