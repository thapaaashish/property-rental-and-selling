import { useState } from "react";
import { Share2 } from "lucide-react";
import ShareModal from "./ShareModal";

const ShareButton = ({ property }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/property/${property._id}`;
    const shareTitle = property?.title || "Check out this property!";

    if (navigator.share) {
      navigator
        .share({
          title: shareTitle,
          text: `Check out this property: ${property?.title} - ${property?.bedrooms} beds, ${property?.bathrooms} bath`,
          url: shareUrl,
        })
        .catch((err) => console.log("Error sharing:", err));
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleShareClick}
        className="rounded-full bg-white/80 p-2.5 shadow-md text-gray-600 hover:bg-white hover:text-blue-600 transition-colors cursor-pointer"
      >
        <Share2 className="h-5 w-5" />
      </button>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        property={property}
      />
    </>
  );
};

export default ShareButton;
