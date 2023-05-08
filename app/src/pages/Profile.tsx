import React from "react";

type User = {
  name: string;
  username: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
};

const Profile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="flex flex-col items-center bg-gray-100 p-4">
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6 w-full max-w-lg">
        <div className="flex flex-row items-center">
          <img
            className="rounded-full w-16 h-16 object-cover mr-4"
            src="https://picsum.photos/200"
            alt="Profile"
          />
          <div className="flex flex-col">
            <h2 className="font-bold text-lg">{user.name}</h2>
            <p className="text-gray-700">@{user.username}</p>
          </div>
        </div>
        <p className="text-gray-700 mt-4">{user.bio}</p>
        <div className="flex flex-row mt-4">
          <div className="mr-6">
            <p className="font-bold text-lg">{user.followers}</p>
            <p className="text-gray-700">Followers</p>
          </div>
          <div className="mr-6">
            <p className="font-bold text-lg">{user.following}</p>
            <p className="text-gray-700">Following</p>
          </div>
          <div>
            <p className="font-bold text-lg">{user.posts}</p>
            <p className="text-gray-700">Posts</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg mb-6 w-full max-w-lg">
        <h3 className="font-bold text-lg mb-4">Activity Feed</h3>
        <ul>
          <li className="text-gray-700 hover:text-gray-900 cursor-pointer mb-2">
            Followed user <span className="text-blue-500">@johndoe</span>
          </li>
          <li className="text-gray-700 hover:text-gray-900 cursor-pointer mb-2">
            Liked post by <span className="text-blue-500">@janedoe</span>
          </li>
          <li className="text-gray-700 hover:text-gray-900 cursor-pointer mb-2">
            Commented on post by <span className="text-blue-500">@janedoe</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
