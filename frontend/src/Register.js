import React, { useState, useEffect } from 'react';
import useCreateUser from './hooks/useCreateUser';
import { Container, Button, Modal, useMediaQuery, TextField, Box } from '@material-ui/core';
import { useHistory } from "react-router-dom";

export default function Register() {
    const history = useHistory();
    const matches = useMediaQuery('(min-width:600px)');
    const initialUser = { pseudo: '', email: '', password:'', password2: ''}
    const [newUser, setNewUser] = useState(initialUser);

    const handleChange = (event) => {
        setNewUser({...newUser, [event.target.name]: event.target.value})
    }
    const handleClose = () => {
        history.push("/login")
    }
    
    const submit = async () => {
        createUser(newUser);
    }
   
    const [createUser, { status: createUserStatus, data, error, isFetching }] = useCreateUser()

    useEffect(() => {
        createUserStatus === 'success' && handleClose();
        
    }, [createUserStatus])
    return (
            <Container style={{ position: "relative", display: 'flex', justifyContent: 'center', alignContent: ' center', width: '100%' }}>
                <Box matches={matches}>
                    <TextField name='email'  label="email" onChange={handleChange} value={newUser.email} />
                    <TextField name='pseudo'  label="pseudo" onChange={handleChange} value={newUser.pseudo} />
                    <TextField name='password'  label="password" onChange={handleChange} value={newUser.password} />
                    <TextField name='password2' label="password" onChange={handleChange} value={newUser.password2} />

                    <Button onClick={submit}>CREER MON COMPTE</Button>
                    {createUserStatus === 'loading'
                ? 'Saving...'
                : createUserStatus === 'error'
                ? error.response.data.error
                : createUserStatus === 'success'
                ? 'Saved!'
                : ''}
                </Box>
            </Container>
    )
}