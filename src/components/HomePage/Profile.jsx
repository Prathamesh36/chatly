import React from "react";
import { useState } from "react";
import { BsArrowLeft, BsCheck2, BsPencil } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../Redux/Auth/Action";
import SimpleSnackbar from "./SimpleSnackbar";

const Profile = ({ handleBack }) => {
  const { auth } = useSelector((store) => store);
  const [tempPicture, setTempPicture] = useState(null);
  const dispatch = useDispatch();
  const [username, setUsername] = useState(auth.reqUser.full_name);
  const [flag, setFlag] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const data = {
    id: auth.reqUser?.id,
    token: localStorage.getItem("token"),
    data: { full_name:username },
  };

  const handleClose = () => setOpen(false);
  return (
    <div className=" w-full h-full">
      <div className=" flex items-center rounded-2xl space-x-10 bg-[#ff4a09] text-white pt-5 px-10 pb-5 mb-2">
        <BsArrowLeft
          onClick={handleBack}
          className="cursor-pointer text-2xl font-bold"
        />
        <p className="text-xl font-semibold">Profile</p>
      </div>

      <div className="bg-white w-full h-[79vh] rounded-2xl pt-8">
        {/*update profile pic section*/}

      <div className="flex flex-col justify-center items-center my-12">
        <label htmlFor="imgInput">
          <img
            className="rounded-full w-[13vw] h-[13vw] cursor-pointer"
            src={tempPicture || auth.reqUser.profile_picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"}
            alt=""
          />
        </label>

        <input
          type="file"
          id="imgInput"
          className="hidden"
          onChange={(e) => {
            const uploadPic = (pics) => {
              const data = new FormData();
              data.append("file", pics);
              data.append("upload_preset", "ashok21");
              data.append("cloud_name", "zarmariya");
              fetch("https://api.cloudinary.com/v1_1/zarmariya/image/upload", {
                method: "post",
                body: data,
              })
                .then((res) => res.json())
                .then((data) => {
                  setTempPicture(data.url.toString());
                  setMessage("profile image updated successfully")
                  setOpen(true);
                  console.log("imgurl", data.url.toString());
                  const dataa = {
                    id: auth.reqUser.id,
                    token: localStorage.getItem("token"),
                    data: { profile_picture: data.url.toString() },
                  };
                  // userUpdate(id, )
                  dispatch(updateUser(dataa));
                  
                });
            };
            if (!e.target.files) return;

            uploadPic(e.target.files[0]);
          }}
        />
      </div>


      {/*name section*/}

      <div className="bg-white px-5 ">
        <p className="pt-4">Your Name</p>
        {!flag && (
          <div className="w-full flex justify-between items-center">
            <p className="py-3">{username || auth.reqUser?.full_name}</p>
            <BsPencil
              onClick={() => {
                setFlag(true);
                console.log(flag, "-----");
              }}
              className="cursor-pointer"
            />
          </div>
        )}

        {flag && (
          <div className="w-full flex justify-between items-center py-2">
            <input
              onChange={(e) => setUsername(e.target.value)}
              className="w-[80%] border-2 border-slate-300 px-3  py-2 rounded-3xl"
              type="text"
              placeholder="Enter you name"
              value={username}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  dispatch(updateUser(data));
                  setFlag(false);
                }
              }}
            />
            <BsCheck2
              onClick={() => {
                setMessage("name updated successfully")
                dispatch(updateUser(data));
                setFlag(false);
                setOpen(true);
              }}
              className="cursor-pointer text-2xl"
            />
          </div>
        )}
      </div>


      <div className="px-5 my-5">
        <p className="py-10 text-slate-500 text-sm">
          this is not your username, this name will be visible to your whatapp
          contects.
        </p>
      </div>

      <SimpleSnackbar
        message={message}
        open={open}
        handleClose={handleClose}
        type={"success"}
      />
      </div>
    </div>
  );
};

export default Profile;
