import ViteLogo from '../assets/vite.svg';

type HeaderProps = {
    onLogout: () => void;
    onUpload: () => void;
    userData: any;
};


const Header = ({ onLogout, onUpload, userData }: HeaderProps) => {

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <nav className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <img src={ViteLogo} alt="Vite Logo" className="w-10 h-10 mr-4" />
                        <h1 className="text-lg font-bold text-gray-800">Vite Media</h1>
                    </div>

                    {userData?.name && <div className="flex items-center">
                        <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg mr-4 hover:bg-indigo-700" onClick={onUpload}>
                            Upload
                        </button>
                        <button className="text-indigo-600 font-bold hover:underline" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                    }
                </nav>
            </div >
        </header >
    );
};

export default Header;

