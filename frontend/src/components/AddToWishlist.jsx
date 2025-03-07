import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../redux/wishlist/wishlistSlice";
import { useEffect, useState } from "react";
import { Heart, HeartOff } from "lucide-react";

const AddToWishlist = ({ propertyId }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.wishlist?.includes(propertyId)) {
      setIsInWishlist(true);
    } else {
      setIsInWishlist(false);
    }
  }, [currentUser, propertyId]);

  const handleWishlist = async () => {
    if (!currentUser) {
      alert("Please log in to add to wishlist");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isInWishlist
        ? "/api/wishlist/remove"
        : "/api/wishlist/add";
      console.log("Sending request to:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({ propertyId }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries([...response.headers])
      );

      // Try to get response body for more details
      let responseBody;
      try {
        responseBody = await response.clone().json();
        console.log("Response body:", responseBody);
      } catch (e) {
        console.log("Could not parse response as JSON");
      }

      if (!response.ok) {
        throw new Error(`Failed to update wishlist: ${response.status}`);
      }

      // Rest of your code remains the same
      if (isInWishlist) {
        dispatch(removeFromWishlist(propertyId));
      } else {
        dispatch(addToWishlist(propertyId));
      }

      setIsInWishlist((prev) => !prev);
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlist}
      disabled={loading}
      className="flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
    >
      {isInWishlist ? (
        <>
          <HeartOff className="h-5 w-5 text-red-500" />
          <span>Remove from Wishlist</span>
        </>
      ) : (
        <>
          <Heart className="h-5 w-5 text-gray-700" />
          <span>Add to Wishlist</span>
        </>
      )}
    </button>
  );
};

export default AddToWishlist;
