import React, { useState, useContext, useEffect } from 'react';
import { appContext } from './AppContext';
import useUser from './hooks/useUser';
import { Container, Button, Modal, useMediaQuery, Box, TextField } from '@material-ui/core';
import { useHistory } from "react-router-dom";


export default function Login() {
    const history = useHistory();
    const matches = useMediaQuery('(min-width:600px)');
    const [log, setLog] = useState({ email: '', password: '' })
    const user = useContext(appContext);
    const [logUser, { status: logUserStatus, data, error, isFetching }] = useUser()
    const handleChange = (event) => {
        setLog({ ...log, [event.target.name]: event.target.value })
    }
    const handleClose = () => {
        history.push("/dashboard");
    }
    const submit = async () => {
        user.setRooms([]);
        const res = await logUser(log);
        if (res != undefined) {
            console.log(res)
            user.dispatchUser({ type: 'login', payload: res })
            user.setUserId(res.userId);
            //localStorage.setItem('jwtToken', res.data.token)
            handleClose();
        }
    }

    useEffect(() => {
        logUserStatus == 'success' && handleClose();
        logUserStatus == 'success' && console.log(data)

    }, [logUserStatus])
    return (
            <Container style={{marginTop: 150}}>
                <Box>
                    <TextField name='email' label="email" onChange={handleChange} value={log.email} />
                    <TextField name='password' label="password" onChange={handleChange} value={log.password} />
                    <Button onClick={submit}>LOGIN</Button>
                </Box>
            </Container>



    )
}