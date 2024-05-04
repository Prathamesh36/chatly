import React from "react";

const Message = ({ isReqUserMessage, content, messageRef}) => {
  return (
    <div
      ref={messageRef}
      className={`py-2 px-2 rounded-t-xl max-w-[50%]  ${isReqUserMessage ? "rounded-bl-none rounded-br-xl self-start bg-[#0E46A3] text-white " : "rounded-bl-xl rounded-br-none self-end bg-[#E1F7F5] " }`}
    >
      
    <p>{content}</p>
    </div>
  );
};

export default Message;
