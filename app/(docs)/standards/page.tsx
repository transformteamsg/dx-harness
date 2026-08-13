import { redirect } from "next/navigation";

export const metadata = { title: "Standards" };

export default function Page() {
  redirect("/standards/catalog");
}
