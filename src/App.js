import './chat.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from "react-redux";

export default function App() {
  console.log("render")
  const chatServerIp = 'http://54.180.145.47:8008';
  const sellerName = 'seller';
  const chatMessages = useSelector(state => state.chatMessages);
  const roomNumber = useSelector(state => state.roomNumber);
  const socket = useSelector(state => state.socket);
  const dispatch = useDispatch();

  // const [loading, setLoading] = useState(false);

  const chatRoomClick = (room) => {
    const roomNum = room.split('room')[1];
    if (roomNumber !== null) {
      socket.emit("leave", `room${roomNum}`, 1);
    }
    dispatch({ type: 'SET_ROOM_NUMBER', payload: roomNum });
    socket.emit("join", `room${roomNum}`, 1);
  };

  const chatListget = async () => {
    try {
      const res = await axios.get(`${chatServerIp}/chatList?room=${roomNumber}`);
      dispatch({ type: 'SET_CHAT_MESSAGE', payload: res.data });
    }
    catch (err) {
      console.log(err);
    }
    finally {
      // console.log('chatListget');
    }
  }

  const chatSubmit = (chatInput, setChatInput) => {
    socket.emit("chat message", `room${roomNumber}`, 999, sellerName, chatInput, 1);
    dispatch({
      type: 'ADD_CHAT_MESSAGE', payload: {
        room: `room${roomNumber}`,
        user: 999,
        userName: sellerName,
        message: chatInput,
      }
    });
    setChatInput('');
  }

  useEffect(() => {
    if (roomNumber === null) return;
    chatListget();
  }, [roomNumber]);


  useEffect(() => {
    dispatch({ type: 'SET_SOCKET', payload: io(`${chatServerIp}/chat`) });
    return () => {
      if (socket) {
        socket.disconnect();
      }
    }
  }, []);


  useEffect(() => {
    if (socket) {
      //여러번 호출 방지
      socket.off('chat message');
      socket.on('chat message', (room, user, userName, message) => {
        dispatch({
          type: 'ADD_CHAT_MESSAGE', payload: {
            room,
            user,
            userName,
            message,
          }
        });
      });
    }
  }, [socket]);

  const ChatRoomListContainer = () => {
    const [roomList, setRoomList] = useState([]);
    const roomListget = async () => {
      try {
        const res = await axios.get(`${chatServerIp}/roomlist?seller=1`);
        setRoomList(res.data.roomList);
      }
      catch (err) {
        console.log(err);
      }
      finally {
        // console.log('roomListget');
      }
    }

    useEffect(() => {
      roomListget();
    }, []);

    return (
      <div className='chatRoomListContainer'>
        {roomList.map((room, index) => {
          return (
            <div key={index} onClick={() => { chatRoomClick(room.room) }} className='chatRoomList'
              style={{ backgroundColor: room.room === `room${roomNumber}` ? '#F5EBE0' : '' }}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="chatRoomImage" className='productImg' />
              <div className='productInfo'>
                <div className='productTitle'>
                  <h3>{room.room}</h3>
                </div>
                <div className='productDesc'>
                  <p>판매자 {room.sellerId}</p>
                </div>
                <div className='productDesc'>
                  <p>구독만료일 2022.12.30</p>
                </div>
                <div className='lastChatTime'>
                  <p>38분전...</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const ChatBox = () => {
    const [chatInput, setChatInput] = useState('');

    return (
      <div className='chatBox'>
        {roomNumber === null ? <div className='chatRoomSelect'>채팅방을 선택해 주세요!</div> :

          <div className='chatMsgBox'>
            {chatMessages.map((chat, index) => {
              return (
                <div key={index} className={chat.userName === sellerName ? 'meChat' : 'youChat'}>
                  {chat.message}
                </div>
              )
            })}
          </div>}

        <div className='chatInputBox'>
          <input placeholder='내용을 입력해 주세요!' value={chatInput} onChange={(e) => { setChatInput(e.target.value) }} className='chatInput'
            disabled={roomNumber === null ? true : false}
          />
          <button onClick={() => { chatSubmit(chatInput, setChatInput) }} className='chatSubmitButton'>전송</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <ChatRoomListContainer />
      <ChatBox />
    </div>
  );
}


