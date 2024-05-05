import React from "react";

const Message = ({ isReqUserMessage, content, messageRef}) => {
  return (
    <div
      ref={messageRef}
      className={`py-3 px-3  rounded-t-2xl max-w-[50%]  ${isReqUserMessage ? "rounded-bl-none rounded-br-2xl self-start bg-[#C7C7C7]  " : "rounded-bl-2xl rounded-br-none self-end text-white bg-[#FF4A09] " }`}
    >
      
    <p className="text-md">{content}</p>
    </div>
  );
};

export default Message;
