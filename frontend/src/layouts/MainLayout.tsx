import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Header />
            {/* pt-16 to account for fixed header height */}
            <main className="flex-grow pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
