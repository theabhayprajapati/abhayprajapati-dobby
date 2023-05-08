import { Link, NavLink } from "react-router-dom";

const Navigation: React.FC = () => {
    return (
        <nav className="bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                            My App
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center">
                            <NavLink
                                to="/"
                                activeClassName="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                                className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/explore"
                                activeClassName="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                                className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Explore
                            </NavLink>
                            <NavLink
                                to="/profile"
                                activeClassName="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                                className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Profile
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
