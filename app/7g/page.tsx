import { Metadata } from "next";
import Timetable from "../components/Timetable";
import { scheduleData } from "../data/sevenG";

export const metadata: Metadata = {
  title: "Розклад занять 7 - Г",
};

export default function Page() {
  return <Timetable scheduleData={scheduleData} />;
}
