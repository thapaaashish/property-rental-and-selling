// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
// import { setNotifications } from "../redux/user/userSlice";
// import { IoMdNotificationsOutline, IoMdCheckmark } from "react-icons/io";

// const Notifications = () => {
//   const { currentUser } = useSelector((state) => state.user);
//   const [notifications, setLocalNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const res = await axios.get("/api/notifications");
//         setLocalNotifications(res.data);
//         dispatch(setNotifications(res.data));
//       } catch (error) {
//         console.error("Error fetching notifications:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (currentUser) {
//       fetchNotifications();
//     }
//   }, [currentUser, dispatch]);

//   const markAllAsRead = async () => {
//     try {
//       await axios.put("/api/notifications/read-all");
//       const updated = notifications.map((n) => ({ ...n, read: true }));
//       setLocalNotifications(updated);
//       dispatch(setNotifications(updated));
//     } catch (error) {
//       console.error("Error marking all as read:", error);
//     }
//   };

//   if (loading) {
//     return <div className="flex justify-center py-8">Loading...</div>;
//   }

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Notifications</h1>
//         <button
//           onClick={markAllAsRead}
//           className="flex items-center text-sm text-blue-600 hover:text-blue-800"
//         >
//           <IoMdCheckmark className="h-4 w-4 mr-1" /> Mark all as read
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {notifications.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">
//             You don't have any notifications yet
//           </div>
//         ) : (
//           <ul className="divide-y divide-gray-200">
//             {notifications.map((notification) => (
//               <li
//                 key={notification._id}
//                 className={`p-4 hover:bg-gray-50 ${
//                   !notification.read ? "bg-blue-50" : ""
//                 }`}
//               >
//                 <div className="flex justify-between">
//                   <div>
//                     <h3 className="font-medium">{notification.title}</h3>
//                     <p className="text-sm text-gray-600 mt-1">
//                       {notification.message}
//                     </p>
//                   </div>
//                   <span className="text-xs text-gray-500">
//                     {new Date(notification.createdAt).toLocaleDateString()}
//                   </span>
//                 </div>
//                 {notification.metadata && (
//                   <div className="mt-2 text-xs text-gray-500">
//                     {Object.entries(notification.metadata).map(
//                       ([key, value]) => (
//                         <div key={key}>
//                           {key}: {value.toString()}
//                         </div>
//                       )
//                     )}
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Notifications;
