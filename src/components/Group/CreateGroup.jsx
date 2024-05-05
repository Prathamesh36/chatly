import React, { useEffect, useState } from "react";
import {
  BsArrowLeft,
  BsArrowRight,
  BsCheck2,
  BsFilter,
  BsPencil,
} from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { searchUser } from "../../Redux/Auth/Action";

import UserChat from "../HomePage/UserChat";
import SelectedMember from "./SelectedMember";
import NewGroup from "./NewGroup";

import { FiSearch } from "react-icons/fi";

const CreateGroup = ({ handleBack, setIsGoup }) => {
  const { auth, chat } = useSelector((store) => store);

  const [groupMember, setGroupMember] = useState(new Set());

  const dispatch = useDispatch();

  const [querys, setQuerys] = useState("");

  const token = localStorage.getItem("token");

  const [newGroup, setNewGroup] = useState(false);

  const handleSearch = (keyword) => {
    dispatch(searchUser({ userId: auth.reqUser?.id, keyword, token }));
  };
  const handleRemoveMember = (item) => {
    console.log("removed..")
    groupMember.delete(item);
    setGroupMember(groupMember);
  };
  return (
    <div className="w-full h-full">
      {!newGroup && (
        <div>
          <div className="flex items-center rounded-2xl space-x-10 bg-[#ff4a09] text-white pt-[1.3rem] px-10 pb-[1.3rem] mb-2">
            <BsArrowLeft
              onClick={handleBack}
              className="cursor-pointer text-3xl font-bold"
            />
            <p className="text-md font-semibold ml-4">Add Group Participats</p>
          </div>

          <div className="relative  bg-white py-4 px-3 rounded-2xl mb-2">
            {/* <div className="flex space-x-2 flex-wrap space-y-1">
              {groupMember.size > 0 &&
                Array.from(groupMember).map((item) => (
                  <SelectedMember
                    handleRemoveMember={() => handleRemoveMember(item)}
                    member={item}
                  />
                ))}
            </div> */}


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
            <FiSearch className="absolute top-7 right-20 text-slate-400" />


            {/* <input
              onChange={(e) => {
                setQuerys(e.target.value);
                handleSearch(e.target.value);
              }}
              className="outline-none border-b border-[#888888] px-2  py-2 w-[93%]"
              type="text"
              placeholder="Search or start new Chat"
              value={querys}
            /> */}
          </div>

          <div className="bg-white overflow-y-scroll h-[59.6vh] rounded-2xl mb-2">
            
            <div className="flex flex-wrap m-2">
              {groupMember.size > 0 &&
                Array.from(groupMember).map((item) => (
                  <SelectedMember
                    handleRemoveMember={() => handleRemoveMember(item)}
                    member={item}
                  />
                ))}
            </div>


            {querys &&
              auth.searchUser?.map((item, index) => (
                <div
                  onClick={() => {
                    groupMember.add(item);
                    setGroupMember(groupMember);
                    setQuerys("");
                  }}
                  key={item?.id}
                >

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
          </div>

          <div className="bottom-11 py-5 bg-[#FF4A09] flex items-center justify-center rounded-2xl">
            <div
              onClick={() => {
                setNewGroup(true);
              }}
              className="cursor-pointer "
            >
              <BsArrowRight className="text-white font-bold text-3xl" />
            </div>
          </div>
        </div>
      )}

      {newGroup && (
        <div>
          <NewGroup groupMember={groupMember} setIsCreateGroup={setIsGoup} />
        </div>
      )}
    </div>
  );
};

export default CreateGroup;
