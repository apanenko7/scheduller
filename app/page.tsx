import Link from "next/link";
import Timetable from "./components/Timetable";

export default function Home() {
  return (
    <ul className="w-full self-start p-4 space-y-1">
      <li>
        <Link href="4b" className="hover:bg-cyan-500 text-md font-black p-2 rounded-lg text-center transition-all border text-center border-cyan-500 block w-40 text-center">
          4-Б
        </Link>
      </li>
      <li>
        <Link href="7g" className="hover:bg-cyan-500 text-md font-black p-2 rounded-lg text-center transition-all border text-center border-cyan-500 block w-40 text-center">
          7-Г
        </Link>
      </li>
    </ul>
  );
}
