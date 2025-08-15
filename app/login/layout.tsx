

import Navbarlogin from "@/components/Navbarloign"; // Adjusted the path to match the relative location

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbarlogin />
      <main className="pt-16">{children}</main> {/* pt-16 para no quedar detrás del navbar */}
    </>
  );
}
