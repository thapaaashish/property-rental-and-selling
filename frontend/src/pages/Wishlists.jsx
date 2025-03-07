// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";

// const Wishlists = () => {
//   const [wishlistItems, setWishlistItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { currentUser } = useSelector((state) => state.user);

//   useEffect(() => {
//     const fetchWishlistProperties = async () => {
//       try {
//         const response = await fetch("/api/wishlist/get", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Error: ${response.status}`);
//         }

//         const data = await response.json();
//         setWishlistItems(data);
//       } catch (error) {
//         console.error("Failed to fetch wishlist:", error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWishlistProperties();
//   }, [currentUser]);

//   const handleRemoveFromWishlist = async (propertyId) => {
//     try {
//       const response = await fetch("/api/wishlist/remove", {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//         },
//         body: JSON.stringify({ propertyId }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to remove from wishlist");
//       }

//       // Update the UI by filtering out the removed property
//       setWishlistItems(wishlistItems.filter((item) => item._id !== propertyId));
//     } catch (error) {
//       console.error("Error removing from wishlist:", error);
//       setError("Failed to remove property from wishlist.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex justify-center items-center">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           <p>{error}</p>
//           {!currentUser && (
//             <Link
//               to="/login"
//               className="mt-2 inline-block text-blue-500 hover:underline"
//             >
//               Go to login
//             </Link>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (wishlistItems.length === 0) {
//     return (
//       <div className="min-h-screen flex justify-center items-center flex-col">
//         <h1 className="text-2xl font-semibold mb-4">Your Wishlist</h1>
//         <p className="text-gray-600">Your wishlist is empty.</p>
//         <Link
//           to="/listings"
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Explore Properties
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-semibold mb-6">Your Wishlist</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {wishlistItems.map((property) => (
//           <div
//             key={property._id}
//             className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
//           >
//             {property.imageUrls && property.imageUrls.length > 0 ? (
//               <img
//                 src={property.imageUrls[0]}
//                 alt={property.title}
//                 className="h-48 w-full object-cover"
//               />
//             ) : (
//               <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
//                 <span className="text-gray-500">No image available</span>
//               </div>
//             )}

//             <div className="p-4">
//               <h2 className="text-lg font-medium">
//                 {property.name || property.title}
//               </h2>
//               <p className="text-gray-600 mt-1">{property.address}</p>

//               <div className="flex items-center mt-2">
//                 <span className="text-gray-800 font-semibold">
//                   ${property.price?.toLocaleString() || "Contact for price"}
//                 </span>
//                 {property.type === "rent" && (
//                   <span className="text-gray-600 ml-1">/ month</span>
//                 )}
//               </div>

//               <div className="flex items-center mt-4 text-sm">
//                 {property.bedrooms && (
//                   <span className="mr-3 flex items-center">
//                     <svg
//                       className="h-4 w-4 mr-1"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
//                     </svg>
//                     {property.bedrooms}{" "}
//                     {property.bedrooms === 1 ? "bed" : "beds"}
//                   </span>
//                 )}
//                 {property.bathrooms && (
//                   <span className="mr-3 flex items-center">
//                     <svg
//                       className="h-4 w-4 mr-1"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M2 4a1 1 0 011-1h1a1 1 0 011 1v1h10V4a1 1 0 011-1h1a1 1 0 011 1v1h1a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h1V4z"></path>
//                     </svg>
//                     {property.bathrooms}{" "}
//                     {property.bathrooms === 1 ? "bath" : "baths"}
//                   </span>
//                 )}
//               </div>

//               <div className="mt-4 flex justify-between">
//                 <Link
//                   to={`/property/${property._id}`}
//                   className="text-blue-500 hover:underline"
//                 >
//                   View Details
//                 </Link>
//                 <button
//                   onClick={() => handleRemoveFromWishlist(property._id)}
//                   className="text-red-500 hover:text-red-700"
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Wishlists;
