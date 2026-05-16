import MobileNavbar from "@/components/MobileNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function About() {
  return (
    <>
      <MobileNavbar />
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">About KIWI</h1>
          <div className="prose prose-lg mx-auto text-gray-600">
            <p className="mb-6">
              KIWI is a premium clothing brand committed to delivering high-quality pieces with a focus on modern design and sustainability. We create timeless clothing that combines style, comfort, and durability for the modern lifestyle.
            </p>
            <p className="mb-6">
              Our mobile-first approach ensures that every aspect of our brand is optimized for the digital age, providing a seamless shopping experience across all devices.
            </p>
            <div className="mt-16 pt-12 border-t border-gray-100 flex justify-center">
              <Link 
                href="/admin/designs"
                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 transform flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Access Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}