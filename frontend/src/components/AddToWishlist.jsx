import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../redux/wishlist/wishlistSlice";
import { Heart, HeartOff } from "lucide-react";

const AddToWishlist = ({ propertyId }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  // Fetch wishlist data on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/wishlist/get", {
          credentials: "include",
        });

        // Log the response for debugging
        console.log("Response status:", response.status);
        const text = await response.text();
        console.log("Response text:", text);

        if (!response.ok) {
          throw new Error(`Failed to fetch wishlist: ${response.status}`);
        }

        const data = JSON.parse(text); // Parse the response as JSON
        setWishlist(data); // Update local wishlist state
      } catch (error) {
        console.error("Error fetching wishlist:", error.message);
      }
    };

    if (currentUser) {
      fetchWishlist();
    }
  }, [currentUser]);

  // Update button state based on wishlist data
  useEffect(() => {
    if (currentUser && wishlist.length > 0) {
      const exists = wishlist.some(
        (item) => item.userRef === currentUser._id && item._id === propertyId
      );
      setIsInWishlist(exists);
    } else {
      setIsInWishlist(false);
    }
  }, [currentUser, wishlist, propertyId]);

  // Handle adding/removing from wishlist
  const handleWishlist = async () => {
    if (!currentUser) {
      alert("Please log in to add to wishlist");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isInWishlist
        ? "http://localhost:3000/api/wishlist/remove"
        : "http://localhost:3000/api/wishlist/add";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ propertyId }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(
          responseBody?.message ||
            `Failed to update wishlist: ${response.status}`
        );
      }

      // Update wishlist data
      if (isInWishlist) {
        // Remove from wishlist
        const updatedWishlist = wishlist.filter(
          (item) => item._id !== propertyId
        );
        setWishlist(updatedWishlist);
        dispatch(removeFromWishlist(propertyId));
        setIsInWishlist(false);
      } else {
        // Add to wishlist
        const newItem = {
          _id: propertyId,
          userRef: currentUser._id,
          // Add other properties if needed
        };
        const updatedWishlist = [...wishlist, newItem];
        setWishlist(updatedWishlist);
        dispatch(addToWishlist(propertyId));
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlist}
      disabled={loading}
      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
        isInWishlist
          ? "bg-red-100 hover:bg-red-200"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
      aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      aria-live="polite"
    >
      {loading ? (
        <span className="text-gray-500 font-medium">Updating...</span>
      ) : isInWishlist ? (
        <>
          <HeartOff className="h-5 w-5 text-red-500" />
          <span className="text-red-600 font-medium">Remove from Wishlist</span>
        </>
      ) : (
        <>
          <Heart className="h-5 w-5 text-gray-700" />
          <span className="text-gray-800 font-medium">Add to Wishlist</span>
        </>
      )}
    </button>
  );
};

export default AddToWishlist;
