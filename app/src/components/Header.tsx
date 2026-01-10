import { LogoIcon } from "./icons";

export default function Header() {
  return (
    <div className="h-18 p-2 flex items-center justify-center border-b border-gray-300">
      <LogoIcon className="max-h-16" />
    </div>
  );
}
