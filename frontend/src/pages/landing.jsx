import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function LandingPage() {

  const route = useNavigate();

  return (
    <div className="landingContainer p-[40px] w-full h-screen">
        <Navbar />
      <div className="md:grid grid-col-1 md:grid-cols-2 md:h-[93%]">
        <div className="h-full mt-20 md:mt-0 flex flex-col gap-6 justify-center items-center">
          <div className="flex flex-col gap-6 items-start">
            <h1 className="text-5xl font-bold leading-18">
              Connect. Collaborate. <br />{" "}
                Confera
            </h1>
            <p className="opacity-60 font-semibold">Say more. Do more. Together, on Confera.</p>
            <div
              className="px-16 py-2 text-xl flex justify-center items-center rounded-lg bg-[#BF1CBA] cursor-pointer hover:opacity-75 hover:scale-110 transition-all duration-200"
              role="button"
            >
              Join now
            </div>
          </div>
        </div>
        <div className="h-full mt-24 md:mt-0 flex justify-center items-center">
          <img
            src="../public/amico.png"
            className="w-[30rem]"
            alt="Call image"
          />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
