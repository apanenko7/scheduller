import { Metadata } from "next";
import Capybara from "../components/Capybara";
import FunFact from "../components/FunFact";
import StarrySky from "../components/StarrySky";
import Timetable from "../components/Timetable";
import { scheduleData } from "../data/fiveB";

export const metadata: Metadata = {
  title: "Розклад занять 5 - Б",
};

export default function Page() {
  return (
    <>
      <StarrySky />
      <div className="w-full">
        <FunFact />
        <Timetable scheduleData={scheduleData} withIcons />
      </div>
      <Capybara scheduleData={scheduleData} />
    </>
  );
}
