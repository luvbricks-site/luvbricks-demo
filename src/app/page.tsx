
      // match the file's exact casing; use "@/components/header" if the file is lowercase
import ThemeGrid from "@/components/ThemeGrid";
import AboutUs from "@/components/AboutUs";


export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      
      
    

      {/* Hero spacer */}
      
      {/* Theme cards */}
      <ThemeGrid />
      <AboutUs />
      

      {/* Your extra section (kept) */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:py-12">
        <h1 className="sr-only">LuvBricks — Build more. Spend smart.</h1>
        {/* You can add featured categories or a banner here later */}
      </section>
    </main>
  );
}
