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
            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
              <Link 
                href="/admin/designs"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}