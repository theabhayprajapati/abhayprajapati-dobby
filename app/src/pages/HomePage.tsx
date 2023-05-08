import React from "react";
import Header from "../components/Header";
import ImageUploadModal from "../components/ImageUploadModal";
const images = [
    {
        id: 1,
        src: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/400/300`,
        title: 'Sunset',
        description: 'A beautiful sunset at the beach'
    },
    {
        id: 2,
        src: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/400/300`,
        title: 'Mountains',
        description: 'A breathtaking view of the mountains'
    },
    {
        id: 3,
        src: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/400/300`,
        title: 'Cityscape',
        description: 'A stunning view of the city skyline at night'
    }
];
const HomePage: React.FC = () => {
    const [showImageUplaodModal, setShowImageUploadModal] = React.useState<boolean>(false);
    const [userData, setUserData] = React.useState<any>(null);
    const onUpload = () => {
        setShowImageUploadModal(true);
    };
    const onLogout = () => {
        const URL = "http://localhost:3000/logout";
        fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: localStorage.getItem("token"),
            }),
        }).then((response) => {
            response.json().then((data) => {
                console.log(data);
                // status 2000
                if (data.status === 200) {
                    localStorage.removeItem("token")
                    window.location.replace("/login");
                }
            }
            )
        })
    };
    React.useEffect(() => {
        console.log("HomePage mounted");
        const URL = "http://localhost:3000/status";
        fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: localStorage.getItem("token"),
            }),
        }).then((response) => {
            response.json().then((data) => {
                console.log(data);
            }
            )
        })
        const headers = {
            "Content-Type": "application/json",
            'token': `${localStorage.getItem("token")}`
        };

        fetch('http://localhost:3000/userdata', {
            method: "GET",
            headers: headers
        }).then((response) => {
            response.json().then((data) => {
                console.log(data);
                setUserData(data);
            }
            )
        })
        return () => {
            console.log("HomePage unmounted");
        };
    }, []);
    return (

        <div>
            <ImageUploadModal isOpen={showImageUplaodModal} onClose={() => setShowImageUploadModal(false)} />

            <div className="bg-gray-100 min-h-screen">
                <Header onUpload={onUpload} onLogout={onLogout} userData={userData} />
                <Search />
                {
                    userData?.name && <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">

                                <h3 className="text-lg leading-6 font-medium text-gray-900">Hey, {userData?.name}!</h3>
                            </div>
                        </div>
                    </div>
                }
                <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {
                            userData?.name && userData?.images.map((image: any, index: number) => (
                                <ImageCard key={index} src={image} alt={image} width={400} height={300} />
                            ))

                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

type ImageCardProps = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
};

const ImageCard = ({ src, alt, width, height }: ImageCardProps) => {
    return (
        <div className="relative">
            <img src={src} alt={alt} className="w-full h-full object-cover rounded-lg" style={{ aspectRatio: `${width}/${height}` }} />
            <div className="absolute bottom-0 left-0 w-full py-2 px-4 bg-gray-800 bg-opacity-50 rounded-b-lg">
                <p className="text-sm font-bold text-white">{alt}</p>
            </div>
        </div>
    );
}; const Search: React.FC = () => {
    return (
        <div className="container mx-auto mt-4 relative w-full">
            <input
                type="text"
                placeholder="Search"
                className="w-full border border-gray-400 rounded-lg py-2 px-4 pr-12 placeholder-gray-400 focus:outline-none focus:ring focus:border-indigo-500"
            />
            <button className="absolute top-0 right-0 h-full px-4 py-2 bg-indigo-500 text-white rounded-r-lg hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600">
                Search
            </button>
        </div>
    );
}; 
