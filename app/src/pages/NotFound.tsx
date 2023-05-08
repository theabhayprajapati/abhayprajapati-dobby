import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-8">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops! Page not found</h2>
      <p className="text-gray-700 text-xl mb-8">The page you are looking for does not exist.</p>
      <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">
        Go Back Home
      </button>
    </div>
  );
};

export default NotFound;
