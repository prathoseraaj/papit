import React from "react";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ value, onChange }) => {
  return (
    <div
      className=" w-full h-full border-r border-l"
      style={{ background: "#131313", borderColor: "#252525" }}
    >
      <textarea
        className="w-full h-full p-10 outline-none resize-none "
        name="document"
        id="text-area"

        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></textarea>
    </div>
  );
};

export default InputField;
