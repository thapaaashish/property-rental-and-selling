import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/wishlist/wishlistSlice";
import { Heart, HeartOff } from "lucide-react";
import Popup from "./Popup";

const API_BASE = import.meta.env.VITE_API_URL;

const AddToWishlist = ({ propertyId }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser) return;

      try {
        const response = await fetch(`${API_BASE}/api/wishlist/get`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch wishlist: ${response.status}`);
        }

        const data = await response.json();
        setWishlist(data || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error.message);
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && wishlist.length > 0) {
      const exists = wishlist.some((item) => item._id === propertyId);
      setIsInWishlist(exists);
    } else {
      setIsInWishlist(false);
    }
  }, [wishlist, propertyId, currentUser]);

  const handleWishlist = async () => {
    if (!currentUser) {
      setPopupMessage("Please log in to add to wishlist");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    setLoading(true);

    try {
      const endpoint = isInWishlist
        ? `${API_BASE}/api/wishlist/remove`
        : `${API_BASE}/api/wishlist/add`;

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

      if (isInWishlist) {
        setWishlist(wishlist.filter((item) => item._id !== propertyId));
        dispatch(removeFromWishlist(propertyId));
        setIsInWishlist(false);
        setPopupMessage("Removed from wishlist!");
      } else {
        const newItem = { _id: propertyId, userRef: currentUser._id };
        setWishlist([...wishlist, newItem]);
        dispatch(addToWishlist(propertyId));
        setIsInWishlist(true);
        setPopupMessage("Added to wishlist!");
      }

      setPopupType("success");
    } catch (error) {
      console.error("Error updating wishlist:", error.message);
      setPopupMessage("Something went wrong while updating wishlist");
      setPopupType("error");
    } finally {
      setShowPopup(true);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleWishlist}
        disabled={loading}
        className={`flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer ${
          isInWishlist
            ? "bg-red-100 hover:bg-red-200"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
        aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        {loading ? (
          <span className="text-gray-500 font-medium">Updating...</span>
        ) : isInWishlist ? (
          <>
            <HeartOff className="h-5 w-5 text-red-500" />
            <span className="text-red-600 font-medium">
              Remove from Wishlist
            </span>
          </>
        ) : (
          <>
            <Heart className="h-5 w-5 text-gray-700" />
            <span className="text-gray-800 font-medium">Add to Wishlist</span>
          </>
        )}
      </button>

      {showPopup && (
        <Popup
          message={popupMessage}
          type={popupType}
          duration={3000}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default AddToWishlist;
