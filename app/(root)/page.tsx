import React from "react";

const page = () => {
  return (
    <>
    <div className="flex max-h-[100vh] w-full p-2 pl-5 border-b" style={{borderColor:'#252525'}}>
      <h1 className="text-[25px] font-outfit ">Vind</h1>
    </div>
    <div className="flex flex-row h-[90vh]" >
      <div className="w-[15%] flex flex-col items-center  " >
        <input type="text" className="w-[90%] mt-5 p-1 border rounded-[10px] " placeholder="name of the file" />
      </div>
      <div className="flex  w-[65%] border-r border-l" style={{ background: '#131313', borderColor: '#252525' }}>
        <textarea className="w-full p-10 outline-none resize-none " name="document" id="text-area"></textarea>
      </div>
      <div className="w-[20%]">
        <h1 className="m-5">Commit message</h1>
      </div>
    </div>
    </>
  );
};

export default page;
