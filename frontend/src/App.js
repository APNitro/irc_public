import logo from './logo.svg';
import './App.css';
import useEditPseudo from './hooks/useEditPseudo'
import setJWTToken from "./utils/setJWTToken";
import { requestContext } from './RequestContext';
import { appContext } from './AppContext';
import openSocket from "socket.io-client";
import { Button, Container, Input, Typography } from '@material-ui/core';
import { useEffect, useState, useReducer, useContext } from 'react';
import AppBarChat from './AppBarChat';
import Rooms from './Rooms.js';
import Login from './Login';
import useListRooms from './hooks/useListRooms';
import ChatBar from './ChatBar';
import useUserroom from './hooks/useUserroom';
import Register from './Register';
import { BrowserRouter as Router, Route, Switch, useHistory } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { userReducer, initialUserState } from './reducers/userReducer';
var socket;
const jwtToken = localStorage.jwtToken;


if (jwtToken) {
  setJWTToken(jwtToken);
  const decodedJwtToken = jwt_decode(jwtToken);
  /*store.dispatch({
    type: SET_CURRENT_USER,
    payload: decodedJwtToken
  });
  store.dispatch(getCurrentUser());*/

  const currentTime = Date.now() / 1000;
  console.log("Expire Time : ", decodedJwtToken);
  if (decodedJwtToken.exp < currentTime) {
    //store.dispatch(logout());
    window.location.href = "/login";
  }
}/* else {
  if (window.location.href != "/login")
 { window.location.href = "/login"; }
}*/
function App() {
  useEffect(() => {
    setUserId(0);
  })
  const [userState, dispatchUser] = useReducer(userReducer, initialUserState);
  const [userId, setUserId] = useState(0);
  const [listRooms, listRoomsState] = useListRooms();
  const [userRoom, userRoomState] = useUserroom();
  const [editPseudo, editPseudoState] = useEditPseudo();
  //const [username, setUsername] = useState('testuser');
  //const [room, setRoom] = useState('testroom');
  const [rooms, setRooms] = useState([]);
  const [roomsFeed, setRoomsFeed] = useState([]);
  const [activeRoom, setActiveRoom] = useState(0);
  const [message, setMessage] = useState('');
  const [renderBool, setRenderBool] = useState(true);
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('');
  const history = useHistory();
  var userToken = {};
  useEffect(() => {

    const jwtToken = localStorage.jwtToken;
    if (jwtToken) {
      setJWTToken(jwtToken);
      const decodedJwtToken = jwt_decode(jwtToken);
      const currentTime = Date.now() / 1000;
      userToken = decodedJwtToken;
      dispatchUser({ type: 'login', payload: userToken })
      /*var newRooms = [];
      var newRoomsFeed = [];
       for (var i = 0; i < decodedJwtToken.rooms.length; i++) {
         newRooms.push(decodedJwtToken.rooms[i].name);
         newRoomsFeed.push({name: decodedJwtToken.rooms[i].name, messages: []});
         for (var n = 0; n<decodedJwtToken.rooms[i].Messages.length; n++) {
         newRoomsFeed[i].messages.push({ username:  decodedJwtToken.rooms[i].Messages[n].User.pseudo, message: decodedJwtToken.rooms[i].Messages[n].content, time: decodedJwtToken.rooms[i].Messages[n].time })
         }
       }
       setRooms(newRooms);
       console.log(newRoomsFeed )
       setRoomsFeed(newRoomsFeed);*/
       //setRoomsFeed(decodedJwtToken.rooms);
      
      if (decodedJwtToken.exp < currentTime) {
        //store.dispatch(logout());
        dispatchUser({ type: "logout", payload: {} })
        localStorage.removeItem("jwtToken");
        setUserId(0);
      }

    }
    


  }, [userId])

  const sendMsg = async () => {
    const joinRegex = /(\/join\s)/;
    const quitRegex = /(\/quit\s)/;
    const listRegex = /(\/list\s)/;
    const nicknameRegex = /(\/nick\s)/;
    const privateRegex = /(\/msg\s[a-z]{0,}\s)/;
    if (message.match(privateRegex)) {

      const msg = message.replace(privateRegex, "");
      const userTo = message.slice(5, message.length - msg.length -1);
      console.log(msg);
      console.log(userTo)
      socket.emit('privateMessage', ({message: msg, userTo, username: userState.pseudo}))
    }

    else if (message.match(joinRegex)) {
      handleSubmitJoinRoom(message.slice(6))
    } else if (message.match(quitRegex)) {

      for (var i = 0; i < rooms.length; i++) {
        message.slice(6) === rooms[i] && handleLeaveRoom(i); 
      }
    } else if (message === '/users') {
      const res = await userRoom(rooms[activeRoom]);
      if (res != undefined) {
        var usersToShow = '';
        for (var i = 0; i < res.Users.length; i++) {
          usersToShow += ' ' + res.Users[i].pseudo;
        }
        alert(usersToShow);
      }
    } else if (message.match(listRegex) || message === '/list') {
      const res = await listRooms(message.slice(6));
      if (res != undefined) {
        var roomsToShow = '';
        for (var i = 0; i < res.length; i++) {
          roomsToShow += ' ' + res[i].name;
        }
        alert(roomsToShow);
      }
    } else if (message.match(nicknameRegex)) {
      const oldPseudo = userState.pseudo;
      console.log(userState)
      const res = await editPseudo({pseudo : message.slice(6)});

        if (res != undefined && res.userId) {
            dispatchUser({ type: 'login', payload: res })
            setUserId(res.userId);
            setSuccess('Votre pseudo a bien été mise à jour')
            socket.emit('joinPrivate', {pseudo : message.slice(6)});
            socket.emit('leaveRoom', ({ username: message.slice(6), room: oldPseudo }))
            roomsFeed.forEach((room) => {
              room.messages.forEach((msg) => {
                if (msg.username === oldPseudo) {
                  msg.username = message.slice(6)
                }
              })
            })
    } else {
     res && res.error && setError(res.error);
    }
  }
    else {
    socket.emit('chatMessage', { message: message, room: rooms[activeRoom], username: userState.pseudo });
    }
    setRenderBool(renderBool => !renderBool);
    setMessage('');
  }

  const handleLogout = () => {
    dispatchUser({ type: "logout", payload: {} })
    localStorage.removeItem("jwtToken");
    setUserId(0);
    setRooms([]);
    setRoomsFeed([]);
    history.push("/login");
  }
   
  const handleSubmitJoinRoom = (room) => {
    console.log(room)
    var alreadyJoined = false;
    for (var i = 0; i < rooms.length; i++) {
      if (rooms[i] === room) {
        alreadyJoined = true;
      }
    }
    if (!alreadyJoined) {
      socket.emit('joinRoom', ({username: userState.pseudo, room }))
      if (room != userState.pseudo){setRooms(rooms => [...rooms, room]);
      console.log(rooms)
      var newRoom = { name: room, messages: [] }
      setRoomsFeed(roomsFeed => [...roomsFeed, newRoom]);}
    }
  }

  const handleIncomingMessage = (data) => {
    for (var i = 0; i < rooms.length; i++) {
      console.log(rooms[i] === data.room)
      if (rooms[i] === data.room) {
        var newRoomsFeed = roomsFeed;
        newRoomsFeed[i].messages.push({ username: data.message.username, message: data.message.message, time: data.message.time })
        setRoomsFeed(newRoomsFeed); 
        setRenderBool(renderBool => !renderBool);
      }

    }
  }
  const handlePrivateMessage = (data) => {
    alert(data.username + ':' + data.message) 
  }
  const handleLeaveRoom = (id) => {
    console.log('leaving room' + id)
    socket.emit('leaveRoom', ({ username: userState.pseudo, room: rooms[id] }))
    var newRoomsFeed = roomsFeed;
    newRoomsFeed.splice(id, 1);
    setRoomsFeed(newRoomsFeed);
    var newRooms = rooms;
    newRooms.splice(id, 1);
    setRooms(newRooms);
    setRenderBool(renderBool => !renderBool);
  }
  useEffect(() => {
    if (socket) {
      socket.on('message', function (data) {
        handleIncomingMessage(data)
      })
      socket.on('privateMsg', function(data) {
        console.log('private message:' + data.message)
        handlePrivateMessage(data);
      })
      
      socket.on('userState', function (user) {
        const decodedJwtToken = jwt_decode(user.token);
        console.log(user.token)
        localStorage.setItem('jwtToken', user.token)
        userToken = decodedJwtToken;
       dispatchUser({ type: 'login', payload: userToken })
       var newRooms = [];
       for (var i = 0; i < decodedJwtToken.rooms.length; i++) {
         newRooms.push(decodedJwtToken.rooms[i].name);
       }
       setRooms(newRooms);
       //setRoomsFeed(decodedJwtToken.rooms);

      })
    }
    
    return () => {
      if (socket) {
        socket.off('message');
        socket.off('privateMsg')
      }
    }
  }, [rooms, handleIncomingMessage])

  useEffect(() => {
    if (socket) {
      if (userState) {
        socket.emit('joinPrivate', {pseudo : userState.pseudo});
        userState.rooms && userState.rooms.forEach((room) => {
          handleSubmitJoinRoom(room.name);
          
        })
      }
    }
  }, [userState])

  useEffect(() => {

    socket = openSocket.connect('http://localhost:8080')

    socket.on('connect', function () {

      console.log('connected')

    })
    return () => socket.disconnect();
  }, [])

  return (
    <div className="App">
      <link href="https://fonts.googleapis.com/css2?family=Stalinist+One&display=swap" rel="stylesheet"/>
      <requestContext.Provider value={{ error: error, setError: setError, success: success, setSuccess: setSuccess }}>
      <appContext.Provider value={{ handleLeaveRoom: handleLeaveRoom, socket: socket, username: userState.pseudo  , rooms: rooms, roomsFeed: roomsFeed, activeRoom: activeRoom, userId: userId, setUserId: setUserId, userState: userState, dispatchUser: dispatchUser, setRooms }}>
          <Container>
            <Switch>
              <Route path='/login'><Login/></Route>
              <Route path='/register'><Register/></Route>
              <Route path='/dashboard'>
              <AppBarChat handleLogout={handleLogout} handleSubmitJoinRoom={handleSubmitJoinRoom} />
                <Rooms renderBool={renderBool} setActiveRoom={setActiveRoom} />
                <ChatBar message={message} setMessage={setMessage} sendMsg={sendMsg} />
                </Route>
            </Switch>
          </Container>
      </appContext.Provider>
      </requestContext.Provider>
      {/*<Input value={username} onChange={handleChange} />
      <Input value={message} onChange={handleMessageChange} />
  <Button onClick={handleSubmitMessage}>SEND</Button>*/}

    </div>
  );
}

export default App;
