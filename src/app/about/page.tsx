import MobileNavbar from "@/components/MobileNavbar";
import Footer from "@/components/Footer";

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
            <p>
              Join us in redefining fashion for the future.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}