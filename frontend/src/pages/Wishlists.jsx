import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PropertyGrid from "../components/PropertyGrid";

const Wishlists = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchWishlistProperties = async () => {
      try {
        // Use credentials: 'include' to send cookies with the request
        const response = await fetch("/api/wishlist/get", {
          credentials: "include",
        });

        // If token is expired, try to refresh it
        if (response.status === 403 || response.status === 401) {
          const refreshResponse = await fetch("/api/auth/refresh", {
            credentials: "include",
          });

          if (refreshResponse.ok) {
            // Token refreshed, retry the original request
            const retryResponse = await fetch("/api/wishlist/get", {
              credentials: "include",
            });

            if (!retryResponse.ok) {
              throw new Error(`Error: ${retryResponse.status}`);
            }

            const data = await retryResponse.json();
            setWishlistItems(data);
            return;
          }
        }

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setWishlistItems(data);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        setError(error.message || "Failed to fetch wishlist");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchWishlistProperties();
    } else {
      setLoading(false);
      setError("Please log in to view your wishlist");
    }
  }, [currentUser]);

  const handleRemoveFromWishlist = async (propertyId) => {
    try {
      const response = await fetch("/api/wishlist/remove", {
        method: "POST",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyId }),
      });

      // Handle token expiration
      if (response.status === 403 || response.status === 401) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          credentials: "include",
        });

        if (refreshResponse.ok) {
          // Token refreshed, retry the original request
          const retryResponse = await fetch("/api/wishlist/remove", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ propertyId }),
          });

          if (!retryResponse.ok) {
            throw new Error("Failed to remove from wishlist");
          }

          // Update the UI
          setWishlistItems(
            wishlistItems.filter((item) => item._id !== propertyId)
          );
          return;
        }
      }

      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      // Update the UI by filtering out the removed property
      setWishlistItems(wishlistItems.filter((item) => item._id !== propertyId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setError("Failed to remove property from wishlist.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          {!currentUser && (
            <Link
              to="/login"
              className="mt-2 inline-block text-blue-500 hover:underline"
            >
              Go to login
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <h1 className="text-2xl font-semibold mb-4">Your Wishlist</h1>
        <p className="text-gray-600">Your wishlist is empty.</p>
        <Link
          to="/listings"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Explore Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Your Wishlist</h1>
      <PropertyGrid properties={wishlistItems} columns={3} />
    </div>
  );
};

export default Wishlists;
