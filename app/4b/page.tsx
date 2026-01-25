import { Metadata } from "next";
import Timetable from "../components/Timetable";
import { scheduleData } from "../data/fourB";

export const metadata: Metadata = {
  title: "Розклад занять 4 - Б",
};

export default function Page() {
  return <Timetable scheduleData={scheduleData} />;
}
