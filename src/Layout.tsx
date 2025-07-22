import React, { useState } from 'react';

// --- SVG Icon Components ---
const GridIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> </svg> );
const DashboardIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /> </svg> );
const LightbulbIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M11 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /> </svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /> </svg> );
const SparklesIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M19 3v4M17 5h4M14 11l-1.5-1.5L11 11l-1.5-1.5L8 11l-1.5-1.5L5 11l1.5 1.5L8 14l1.5-1.5L11 14l1.5-1.5L14 14l1.5-1.5L17 14l1.5-1.5L20 11l-1.5-1.5L17 8l-1.5 1.5L14 8l-1.5 1.5L11 8l-1.5 1.5L8 8 6.5 9.5 5 8l1.5 1.5L5 11zM19 18v4m-2 2h4" /> </svg> );
const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /> </svg> );

type LayoutProps = {
    children: React.ReactNode;
    activePage: string;
    setActivePage: (page: string) => void;
};

function Layout({ children, activePage, setActivePage }: LayoutProps) {
    const navItems = [
        { icon: <DashboardIcon />, label: 'DASHBOARD' },
        { icon: <LightbulbIcon />, label: 'ALL IDEAS' },
        { icon: <PlusIcon />, label: 'ADD NEW' },
        { icon: <SparklesIcon />, label: 'SUGGESTED NEW' },
        { icon: <SettingsIcon />, label: 'SETTINGS' },
    ];

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-gray-50 p-5">
            {/* Mobile Header */}
            <header className="w-full flex items-center justify-between bg-white p-4 shadow-sm lg:hidden fixed top-0 left-0 z-40">
            <button
                    className="p-2 focus:outline-none"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sidebar"
                >
                    {/* Hamburger Icon */}
                    <svg className="h-6 w-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {/* <span className="font-bold text-lg">AI Tweet Idea Generator</span> */}
                
            </header>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 p-5 left-0 h-screen w-64 bg-white mr-5 flex-col rounded-md shadow-sm z-50
                    transform transition-transform duration-200
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:flex
                `}
               
            >
                {/* Close button for mobile */}
                <div className="flex items-center justify-between p-4 lg:hidden">
                    <span className="font-bold text-lg">Menu</span>
                    <button
                        className="p-2"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        {/* X Icon */}
                        <svg className="h-6 w-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {/* Sidebar content here */}
                <div>
                    {/* <div className="mb-12 h-10 flex items-center"><GridIcon /></div> */}
                    <nav>
                        <ul className="space-y-2">
                            {navItems.map(({ icon, label }) => (
                                <li key={label}>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActivePage(label);
                                            if (sidebarOpen) setSidebarOpen(false); // Close sidebar on mobile
                                        }}
                                        className={`flex items-center space-x-3 py-2 px-3 rounded-lg transition-all text-sm font-semibold ${
                                            activePage === label
                                                ? 'bg-purple-200 text-purple-900'
                                                : 'text-gray-500 hover:bg-purple-100 hover:text-purple-800'
                                        }`}
                                    >
                                        {icon}
                                        <span>{label}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                {/* <div className="flex items-center space-x-3 border-t border-gray-200 pt-4">
                    <img src="https://i.pravatar.cc/40?u=jane" alt="Jane Doe" className="h-10 w-10 rounded-full" />
                    <div>
                        <p className="font-semibold text-sm">jane doe</p>
                        <p className="text-xs text-gray-500">jane@example.com</p>
                    </div>
                </div> */}
            </aside>

            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-transparentk bg-opacity-30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main
                className={`flex-1 flex flex-col min-h-screen ${sidebarOpen ? 'pb-64' : ''} pt-20 lg:pt-0 `}
            >
                {children}
            </main>
        </div>
    );
}

export default Layout;