import { Metadata } from "next";
import Capybara from "../components/Capybara";
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
      <Timetable scheduleData={scheduleData} />
      <Capybara scheduleData={scheduleData} />
    </>
  );
}
