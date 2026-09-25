import { getCurrentBusiness } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";

// Wraps every page under /dashboard with the same top nav. Each page still
// does its own login check and redirect; if nobody's logged in, this just
// renders the page without a nav so the redirect happens cleanly.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness();

  return (
    <>
      {business && <DashboardNav businessName={business.name} />}
      {children}
    </>
  );
}
