import React from "react";

const page = () => {
  return (
    <>
    <div className="flex max-h-[100vh] w-full p-5 border-b" style={{borderColor:'#252525'}}>
      <h1 className="text-[25px] font-outfit ">Vind</h1>
    </div>
    <div className="flex flex-row h-[90vh]" >
      <div className="w-[15%]" >
        <h1 className="m-5">Documents</h1>
      </div>
      <div className="flex justify-center items-center w-[65%] border-r border-l" style={{ background: '#131313', borderColor: '#252525' }}>
        <h1>Text Box</h1>
      </div>
      <div className="w-[20%]">
        <h1 className="m-5">Commit message</h1>
      </div>
    </div>
    </>
  );
};

export default page;
