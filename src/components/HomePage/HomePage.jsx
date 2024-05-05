/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { BiCommentDetail } from "react-icons/bi";
import {
  BsThreeDotsVertical,
  BsFilter,
  BsEmojiSmile,
} from "react-icons/bs";
import { FiMic } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { TbCircleDashed, TbMessagePlus } from "react-icons/tb";
import { RiSendPlaneFill } from "react-icons/ri";
import { AiOutlineSearch } from "react-icons/ai";
import { ImAttachment } from "react-icons/im";
import UserChat from "./UserChat";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import { currentUser, searchUser } from "../../Redux/Auth/Action";
import { createSingleChat, getAllChat } from "../../Redux/Chat/Action";
import { createNewMessage, getAllMessage } from "../../Redux/Message/Action";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./Home.css";

import { useRef } from "react";
import Picker from "emoji-picker-react";
import Profile from "./Profile";
import { BsArrowLeft } from "react-icons/bs";
import SimpleSnackbar from "./SimpleSnackbar";
import DropDown from "../DropDown/DropDown";
import SockJS from "sockjs-client/dist/sockjs";
import { over } from "stompjs";
import CreateGroup from "../Group/CreateGroup";
import WelcomeScr from "./WelcomeScr";
import Spline from '@splinetool/react-spline';

let soket, selectedChatCompare;

const HomePage = () => {
  const dispatch = useDispatch();
  const { auth, chat, message } = useSelector((store) => store);
  const token = localStorage.getItem("token");
  const [querys, setQuerys] = useState("");
  const [content, setContent] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const messageRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfile, setIsProfile] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [stompClient, setStompClient] = useState(null);
  const [isCreateGroup, setIsCreateGroup] = useState(false);

  //dispatch current user if user signup or login
  useEffect(() => {
    if (token) dispatch(currentUser(token));
  }, [token, auth.updatedUser]);

  //redirect to signup page if user not authenticate
  useEffect(() => {
    if (!auth.reqUser) navigate("/signup");
  }, [auth.reqUser]);

  const connect = () => {
    const sock = new SockJS("http://localhost:5454/ws");
    const temp = over(sock);
    setStompClient(temp);
    const headers = {
      Authorization: `Bearer ${token}`,
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
    };
    temp.connect(headers, onConnect, onErr);
  };

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
  }

  const onErr = (error) => {
    console.log("on Error", error);
  };

  const onConnect = () => {
    setConnected(true);

    // stompClient.subscribe("/topic/notification",onMessageRecive)
    console.log("------ ", stompClient);

    // stompClient.send("/app/notification",{},JSON.stringify(messages))
  };

  // setCurrentChat
  // useEffect(() => {
  //   if (chat.singleChat) {
  //     setCurrentChat(chat.singleChat);

  //   }
  // }, [chat.singleChat]);

  const handleCurrentChat = (item) => {
    setCurrentChat(item);

    // if (item.id === notifications[0]?.chat.id) {
    //   setNotifications([]);
    // }
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  //create new Single chat
  const createNewChat = (userId) => {
    const data = { token, userId };
    if (token) dispatch(createSingleChat(data));
  };

  //get all chats
  useEffect(() => {
    if (token) dispatch(getAllChat(token));
  }, [token, chat.singleChat, chat.createdGroup]);

  //create new message
  const handleCreateNewMessage = () => {
    const data = { token, chatId: currentChat?.id, content };
    dispatch(createNewMessage(data));
    sendMessageToServer();
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  //get all message
  useEffect(() => {
    if (!currentChat?.id) return;
    dispatch(getAllMessage({ chatId: currentChat?.id, token }));
    selectedChatCompare = currentChat;
  }, [currentChat, message.newMessage]);

  //setMessage and sent to server
  useEffect(() => {
    if (message.newMessage && stompClient) {
      // soket.emit("send-message", message.newMessage);
      setMessages([...messages, message.newMessage]);
      stompClient?.send("/app/message", {}, JSON.stringify(message.newMessage));
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [message.newMessage]);

  useEffect(() => {
    if (message.messages) setMessages(message.messages);
  }, [message.messages]);

  //search user by name
  const handleSearch = (keyword) => {
    dispatch(searchUser({ userId: auth.reqUser?.id, keyword, token }));
  };

  useEffect(() => {
    if (connected && stompClient && auth.reqUser && currentChat) {
      const subscription = stompClient.subscribe(
        `/user/${currentChat?.id}/private`,
        onMessageRecive
      );
      // stompClient.subscribe('/user/'+currentChat?.id+'/private', onMessageRecive);
      stompClient.subscribe(
        "/group/" + currentChat.id.toString(),
        onMessageRecive
      );
      // stompClient.subscribe('/group/public', onMessageRecive);
      return () => {
        subscription.unsubscribe();
      };
    }
  });

  const onMessageRecive = (payload) => {
    console.log("onMessageRecive ............. -----------", payload);

    console.log("recive message -  - - - - - - -  -", JSON.parse(payload.body));

    const recievedMessage = JSON.parse(payload.body);

    setMessages([...messages, recievedMessage]);
  };

  const sendMessageToServer = () => {
    if (stompClient) {
      const value = {
        content,
        chatId: currentChat?.id,
      };
      console.log("---- send message --- ", value);
      stompClient?.send(
        `/app/chat/${currentChat?.id.toString()}`,
        {},
        JSON.stringify(value)
      );
      // stompClient.send("/app/message", {}, JSON.stringify(value));
      // setMessages("")
    }
  };

  const onEmojiClick = (event, emojiObject) => {
    setContent(content + " " + emojiObject.emoji);
  };

  const handleEmojiBoxClose = () => {
    setIsOpen(false);
  };

  const handleBack = () => setIsProfile(false);

  useEffect(() => {
    setOpen(true);
    connect();
  }, []);

  const handleNavigate = () => {
    navigate("/status");
  };

  const handleCreateGroup = () => {
    setIsCreateGroup(true);
  };

  return (
    <div className="relative">
      <div className="h-[100vh] w-[100vw] bg-[#EEEEEE]"></div>

      <div className="absolute w-[90vw] h-[88vh] bg-[#f0f2f500] top-12 left-[80px] flex rounded-2xl">
        <div className="w-[30%] h-full rounded-2xl ">

          {isCreateGroup && (
            <div className="h-full">
              <CreateGroup
                setIsGoup={setIsCreateGroup}
                handleBack={handleBack}
              />{" "}
            </div>
          )}

          {/*profile*/}

          {isProfile && (
            <div className="h-full">
              <Profile handleBack={handleBack} />
            </div>
          )}



          {!isProfile && !isCreateGroup && (
            <div className="h-full ">
              <div className=" w-full h-[21%] mb-2">
                {/* profile img and icons */}
                <div className="flex justify-between items-center bg-white rounded-2xl px-4 py-4 text-black mb-2">
                  <div className="flex items-center space-x-3 ">
                    <img
                      onClick={() => setIsProfile(true)}
                      className="rounded-full w-10 h-10 cursor-pointer"
                      src={
                        auth.reqUser?.profile_picture ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                      }
                      alt=""
                    />
                    <p>{auth.reqUser?.full_name}</p>
                  </div>
                  <div className="space-x-3 text-2xl flex">
                    <TbCircleDashed className="cursor-pointer" onClick={handleNavigate} />
                    <BiCommentDetail />
                    <DropDown handleCreateGroup={handleCreateGroup} />
                  </div>
                </div>

                {/* input */}
                <div className="relative flex justify-center items-center bg-white py-4 px-4 rounded-2xl ">
                  <input
                    onChange={(e) => {
                      setQuerys(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="border border-slate-300 hover:border-slate-400 outline-none py-2  rounded-3xl w-[93%] pl-7"
                    type="text"
                    placeholder="Search..."
                    value={querys}
                  />
                  <FiSearch  className="absolute top-7 right-20 text-slate-400" />
                  <div>
                    <BsFilter className="ml-4 text-3xl" />
                  </div>
                </div>
              </div>
              {/* all user */}

              <div className="relative bg-[#ffffff] rounded-2xl overflow-y-scroll h-[78%] z-200 no-scrollbar">
                {querys &&
                  auth.searchUser?.map((item, index) => (
                    <div
                      onClick={() => {
                        createNewChat(item?.id);
                        setQuerys("");
                      }}
                      key={item?.id}
                    >
                      {/* <hr />  horizontal line */}
                      <UserChat
                        isChat={false}
                        name={item.full_name}
                        userImg={
                          item.profile_picture ||
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                        }
                      />
                    </div>
                  ))}

                {!chat.chats?.error &&
                  chat?.chats?.map((item, index) => (
                    <div onClick={() => handleCurrentChat(item)} key={item.id}>
                      {/* <hr /> */}
                      {item.is_group ? (
                        <UserChat
                          name={item.chat_name}
                          userImg={
                            item.chat_image ||
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                          }
                        />
                      ) : (
                        <UserChat
                          isChat={true}
                          name={
                            auth.reqUser?.id !== item.users[0]?.id
                              ? item.users[0].full_name
                              : item.users[1].full_name
                          }
                          userImg={
                            auth.reqUser.id !== item.users[0].id
                              ? item.users[0].profile_picture ||
                              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                              : item.users[1].profile_picture ||
                              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                          }
                          notification={notifications.length}
                          isNotification={
                            notifications[0]?.chat?.id === item.id
                          }
                          message={
                            (item.id ===
                              messages[messages.length - 1]?.chat?.id &&
                              messages[messages.length - 1]?.content) ||
                            (item.id === notifications[0]?.chat?.id &&
                              notifications[0]?.content)
                          }
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {!currentChat && (
          <div className="w-[70%] flex flex-col ml-2 items-center justify-start bg-[#fefefe] rounded-2xl overflow-hidden ">
            {/* <div className="max-w-[70%] text-center">
              <img
                src="https://res.cloudinary.com/zarmariya/image/upload/v1662264838/whatsapp_multi_device_support_update_image_1636207150180-removebg-preview_jgyy3t.png"
                alt=""
              />
              <h1 className="text-4xl text-gray-600">WhatsApp Web</h1>
              <p className=" my-9">
                send and reveive message without keeping your phone online. Use
                WhatsApp on Up to 4 Linked devices and 1 phone at the same time.
              </p>
            </div> */}
            {/* <img src="file:///C:/Users/PRATHAMESH/OneDrive/Desktop/homeBgimg.jpg" alt="" /> */}
            <Spline scene="https://prod.spline.design/PbHx9Uf0k1tGye75/scene.splinecode" className='spline flex justify-center h-[60vh]' />
            <div className="flex flex-col">
              <p className="HomePageText text-6xl text-gray-600 ">Connect Instantly.</p>
              <p className="HomePageText text-6xl text-gray-600 text-center">With Chatly.</p>
            </div>
          </div>

        )}

        {/*right side message section*/}

        {currentChat && (
          // bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png')]
          <div className="w-[70%] relative rounded-2xl ml-2 ">
            {/* header part */}
            <div className="header top-0 w-full bg-white rounded-2xl text-black mb-2">
              <div className=" flex justify-between">
                <div className="py-4 space-x-4 flex items-center px-4 bg">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={currentChat?.is_group ? (currentChat?.chat_image || "https://cdn.pixabay.com/photo/2016/04/15/18/05/computer-1331579__340.png") :
                      (auth.reqUser?.id !== currentChat?.users[0].id
                        ? currentChat?.users[0].profile_picture ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                        : currentChat?.users[1].profile_picture ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png")
                    }
                    alt=""
                  />
                  <p>
                    {currentChat?.is_group ? (currentChat?.chat_name) : (auth.reqUser?.id !== currentChat?.users[0].id
                      ? currentChat?.users[0].full_name
                      : currentChat?.users[1].full_name)}
                  </p>
                </div>
                <div className="py-3 space-x-4 flex items-center px-3 bg">
                  <AiOutlineSearch />
                  <BsThreeDotsVertical />
                </div>
              </div>
            </div>



            {/* message section */}

            <div
              onClick={handleEmojiBoxClose}
              className="px-10 h-[69vh] overflow-y-scroll mb-2 chat-background bg-slate-50 rounded-2xl"
            >
              <div className=" space-y-1 flex flex-col justify-center border-none mt-20 py-2 pl-10 pr-10">
                {messages.length > 0 &&
                  messages?.map((item, index) => (
                    <Message
                      messageRef={messageRef}
                      key={item.id}
                      isReqUserMessage={item.user?.id !== auth.reqUser.id}
                      content={`${item.content}`}
                    />
                  ))}
              </div>
            </div>


            {/* footer send message part */}
            <div className="footer absolute bottom-0 w-full flex justify-between gap-2">
              <div className="bg-white rounded-2xl w-[90%] py-[1rem] text-2xl  text-black">
                <div className="flex justify-between items-center px-6 relative ">

                  <ImAttachment className="self-center"/>
                  <div
                    className={`${isOpen ? "block" : "hidden"
                      } absolute bottom-[310px] right-60`}
                  >
                    <Picker onEmojiClick={onEmojiClick} />
                  </div>

                  <input
                    onChange={(e) => setContent(e.target.value)}
                    className="py-2 outline-none border-none bg-white pl-4 w-[90%] rounded-2xl text-black text-sm "
                    placeholder="Write messages..."
                    value={content}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateNewMessage();
                        setContent("");
                      }
                    }}
                  />
                  <BsEmojiSmile
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer self-center"
                  />

                </div>
              </div>

              {/* mic */}
              <div className=" bg-white w-[72px] h-[72px] py-4 text-2xl rounded-2xl text-black flex justify-center">
                <FiMic  className="self-center" />
              </div>

              {/* send */}
              <div className=" bg-[#FF4A09] w-[72px] h-[72px]  py-4 text-2xl rounded-2xl flex justify-center text-white">
                <RiSendPlaneFill className="self-center" />
              </div>

            </div>



          </div>
        )}
      </div>
      <SimpleSnackbar
        message={`Welcome ${auth.reqUser?.full_name}`}
        open={open}
        handleClose={handleClose}
        type={"success"}
      />
    </div>
  );
};

export default HomePage;
