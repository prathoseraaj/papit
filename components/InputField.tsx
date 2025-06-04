import React from "react";

const InputField = () => {
  return (
    <div
      className=" w-full border-r border-l"
      style={{ background: "#131313", borderColor: "#252525" }}
    >
      <textarea
        className="w-full h-full p-10 outline-none resize-none "
        name="document"
        id="text-area"
      ></textarea>
    </div>
  );
};

export default InputField;
