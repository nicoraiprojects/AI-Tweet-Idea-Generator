import React, { useState } from 'react';

// --- SVG Icon Components ---
const HelpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);

const TweetIcon = () => (
    <div className="w-7 h-7 bg-white flex items-center justify-center rounded-md">
        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.55v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21c7.34 0 11.35-6.08 11.35-11.35 0-.17 0-.34-.01-.51.78-.57 1.45-1.29 1.99-2.09z"></path>
        </svg>
    </div>
);

const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

type LayoutProps = {
    children: React.ReactNode;
    activePage: string;
    setActivePage: (page: string) => void;
};

function Layout({ children, activePage, setActivePage }: LayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0d1117]">
            <header className="bg-[#161b22] border-b border-gray-800 sticky top-0 z-50">
                <nav className="px-4 py-2 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <TweetIcon />
                            </div>
                            <span className="text-white font-bold text-lg">Tweet Ideas</span>
                        </div>
                        <div className="flex items-center space-x-4 md:space-x-6">
                            {/* Hamburger Menu for Mobile */}
                            <button
                                className="md:hidden focus:outline-none"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <HamburgerIcon />
                            </button>

                            {/* Navigation Links for Desktop */}
                            <div className="hidden md:flex items-center space-x-4 md:space-x-2">
                                <button
                                    onClick={() => setActivePage('DASHBOARD')}
                                    className={`px-3 py-2 cursor-pointer rounded-md text-sm font-medium transition-colors ${
                                        activePage === 'DASHBOARD' ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    Home
                                </button>
                                <button
                                    onClick={() => setActivePage('ADD NEW')}
                                    className={`px-3 py-2 cursor-pointer rounded-md text-sm font-medium transition-colors ${
                                        activePage === 'ADD NEW' ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    AddNew
                                </button>
                                <button
                                    onClick={() => setActivePage('SUGGESTED NEW')}
                                    className={`px-3 py-2 cursor-pointer rounded-md text-sm font-medium transition-colors ${
                                        activePage === 'SUGGESTED NEW' ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    SuggestedNew
                                </button>
                                <button
                                    onClick={() => setActivePage('SETTINGS')}
                                    className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors ${
                                        activePage === 'SETTINGS' ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    Settings
                                </button>
                                <button className="focus:outline-none cursor-pointer">
                                    <HelpIcon />
                                </button>
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-9 w-9 rounded-full cursor-pointer"
                                        src="https://i.pravatar.cc/40"
                                        alt="User profile"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMenuOpen && (
                        <div className="md:hidden">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                <button
                                    onClick={() => {
                                        setActivePage('DASHBOARD');
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activePage === 'DASHBOARD' ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    Home
                                </button>
                                <button
                                    onClick={() => {
                                        setActivePage('ADD NEW');
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activePage === 'ADD NEW' ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    AddNew
                                </button>
                                <button
                                    onClick={() => {
                                        setActivePage('SUGGESTED NEW');
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activePage === 'SUGGESTED NEW' ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    SuggestedNew
                                </button>
                                <button
                                    onClick={() => {
                                        setActivePage('SETTINGS');
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activePage === 'SETTINGS' ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    Settings
                                </button>
                                <button className="w-full text-left focus:outline-none">
                                    <div className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
                                        <HelpIcon />
                                        <span className="ml-3">Help</span>
                                    </div>
                                </button>
                                <div className="flex-shrink-0 px-3 py-2">
                                    <img
                                        className="h-9 w-9 rounded-full"
                                        src="https://i.pravatar.cc/40"
                                        alt="User profile"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </nav>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {children}
            </main>
        </div>
    );
}

export default Layout;