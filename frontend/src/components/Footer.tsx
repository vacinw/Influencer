import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-black rounded-lg transform rotate-45"></div>
                            <span className="text-xl font-bold text-gray-900">InfluConnect</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Connecting brands with the best creators for impactful campaigns.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Platform</h3>
                        <ul className="space-y-3">
                            <li><Link to="/creators" className="text-gray-500 hover:text-gray-900 text-sm">For Creators</Link></li>
                            <li><Link to="/brands" className="text-gray-500 hover:text-gray-900 text-sm">For Brands</Link></li>
                            <li><Link to="/pricing" className="text-gray-500 hover:text-gray-900 text-sm">Pricing</Link></li>
                            <li><Link to="/case-studies" className="text-gray-500 hover:text-gray-900 text-sm">Case Studies</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="/help" className="text-gray-500 hover:text-gray-900 text-sm">Help Center</Link></li>
                            <li><Link to="/terms" className="text-gray-500 hover:text-gray-900 text-sm">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="text-gray-500 hover:text-gray-900 text-sm">Privacy Policy</Link></li>
                            <li><Link to="/contact" className="text-gray-500 hover:text-gray-900 text-sm">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Facebook</span>
                                <Facebook className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Twitter</span>
                                <Twitter className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Instagram</span>
                                <Instagram className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">GitHub</span>
                                <Github className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-base text-gray-400 text-center">
                        &copy; {new Date().getFullYear()} InfluConnect. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
